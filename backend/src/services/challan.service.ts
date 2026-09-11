import { getClient, query } from '../config/database';

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ChallanItemInput {
    productId: string;
    quantity: number;
}

export interface CreateChallanInput {
    challanNumber: string;
    customerId: string;
    createdBy: string;
    items: ChallanItemInput[];
}

/**
 * Get all challans with customer and creator information.
 */
export const getAllChallans = async () => {
    const result = await query(`
        SELECT
            c.id,
            c.challan_number,
            c.customer_id,
            cu.customer_name,
            c.total_quantity,
            c.status,
            c.created_by,
            u.name AS created_by_name,
            c.created_at,
            c.updated_at
        FROM challans c
        JOIN customers cu
            ON cu.id = c.customer_id
        JOIN users u
            ON u.id = c.created_by
        ORDER BY c.created_at DESC
    `);

    return result.rows;
};

/**
 * Get a single challan with all its items.
 */
export const getChallanById = async (id: string) => {
    const challanResult = await query(
        `
        SELECT
            c.id,
            c.challan_number,
            c.customer_id,
            cu.customer_name,
            c.total_quantity,
            c.status,
            c.created_by,
            u.name AS created_by_name,
            c.created_at,
            c.updated_at
        FROM challans c
        JOIN customers cu
            ON cu.id = c.customer_id
        JOIN users u
            ON u.id = c.created_by
        WHERE c.id = $1
        LIMIT 1
        `,
        [id]
    );

    if (challanResult.rows.length === 0) {
        return null;
    }

    const itemsResult = await query(
        `
        SELECT
            id,
            challan_id,
            product_id,
            product_name,
            sku,
            unit_price,
            quantity,
            (unit_price * quantity) AS line_total
        FROM challan_items
        WHERE challan_id = $1
        ORDER BY id
        `,
        [id]
    );

    return {
        ...challanResult.rows[0],
        items: itemsResult.rows,
    };
};

/**
 * Create a new Draft challan.
 *
 * Important:
 * - Product information is copied into the item as a snapshot.
 * - Stock is NOT changed.
 */
export const createChallan = async (
    input: CreateChallanInput
) => {
    if (input.items.length === 0) {
        throw new Error('At least one item is required');
    }

    const productIds = input.items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
        throw new Error('Duplicate products are not allowed in a challan');
    }

    const client = await getClient();

    try {
        await client.query('BEGIN');

        const customerResult = await client.query(
            `
            SELECT id
            FROM customers
            WHERE id = $1
            LIMIT 1
            `,
            [input.customerId]
        );

        if (customerResult.rows.length === 0) {
            throw new Error('Customer not found');
        }

        const productResult = await client.query(
            `
            SELECT
                id,
                product_name,
                sku,
                unit_price
            FROM products
            WHERE id = ANY($1::uuid[])
            `,
            [productIds]
        );

        if (productResult.rows.length !== productIds.length) {
            throw new Error('One or more products not found');
        }

        const productsById = new Map(
            productResult.rows.map((product) => [
                product.id,
                product,
            ])
        );

        const totalQuantity = input.items.reduce(
            (total, item) => total + item.quantity,
            0
        );

        const challanResult = await client.query(
            `
            INSERT INTO challans (
                challan_number,
                customer_id,
                total_quantity,
                status,
                created_by
            )
            VALUES ($1, $2, $3, 'Draft', $4)
            RETURNING
                id,
                challan_number,
                customer_id,
                total_quantity,
                status,
                created_by,
                created_at,
                updated_at
            `,
            [
                input.challanNumber,
                input.customerId,
                totalQuantity,
                input.createdBy,
            ]
        );

        const challan = challanResult.rows[0];

        for (const item of input.items) {
            const product = productsById.get(item.productId);

            if (!product) {
                throw new Error('Product not found');
            }

            await client.query(
                `
                INSERT INTO challan_items (
                    challan_id,
                    product_id,
                    product_name,
                    sku,
                    unit_price,
                    quantity
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    challan.id,
                    product.id,
                    product.product_name,
                    product.sku,
                    product.unit_price,
                    item.quantity,
                ]
            );
        }

        await client.query('COMMIT');

        return getChallanById(challan.id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Confirm a Draft challan.
 *
 * Critical business rule:
 *
 * 1. Lock the challan.
 * 2. Verify it is still Draft.
 * 3. Lock ALL required product rows.
 * 4. Check stock for ALL items.
 * 5. If any item has insufficient stock -> rollback everything.
 * 6. Reduce stock for every item.
 * 7. Create OUT stock movement records.
 * 8. Mark challan as Confirmed.
 *
 * Everything happens in ONE transaction.
 */
export const confirmChallan = async (
    challanId: string,
    confirmedBy: string
) => {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        const challanResult = await client.query(
            `
            SELECT
                id,
                challan_number,
                status,
                created_by
            FROM challans
            WHERE id = $1
            FOR UPDATE
            `,
            [challanId]
        );

        if (challanResult.rows.length === 0) {
            throw new Error('Challan not found');
        }

        const challan = challanResult.rows[0];

        if (challan.status !== 'Draft') {
            throw new Error(
                `Only Draft challans can be confirmed. Current status: ${challan.status}`
            );
        }

        const itemsResult = await client.query(
            `
            SELECT
                id,
                product_id,
                product_name,
                sku,
                unit_price,
                quantity
            FROM challan_items
            WHERE challan_id = $1
            ORDER BY product_id
            `,
            [challanId]
        );

        if (itemsResult.rows.length === 0) {
            throw new Error('Challan has no items');
        }

        /*
         * Lock products in deterministic product_id order.
         * This reduces the risk of transaction deadlocks
         * when multiple challans are confirmed concurrently.
         */
        const productIds = itemsResult.rows.map(
            (item) => item.product_id
        );

        const productsResult = await client.query(
            `
            SELECT
                id,
                product_name,
                sku,
                current_stock
            FROM products
            WHERE id = ANY($1::uuid[])
            ORDER BY id
            FOR UPDATE
            `,
            [productIds]
        );

        if (productsResult.rows.length !== productIds.length) {
            throw new Error('One or more products no longer exist');
        }

        const productsById = new Map(
            productsResult.rows.map((product) => [
                product.id,
                product,
            ])
        );

        /*
         * Check EVERY item before modifying ANY stock.
         */
        for (const item of itemsResult.rows) {
            const product = productsById.get(item.product_id);

            if (!product) {
                throw new Error('Product not found');
            }

            if (product.current_stock < item.quantity) {
                throw new Error(
                    `Insufficient stock for ${product.product_name}. Available: ${product.current_stock}, Required: ${item.quantity}`
                );
            }
        }

        /*
         * All stock checks passed.
         * Now reduce stock and create OUT movements.
         */
        for (const item of itemsResult.rows) {
            await client.query(
                `
                UPDATE products
                SET
                    current_stock = current_stock - $1,
                    updated_at = NOW()
                WHERE id = $2
                `,
                [item.quantity, item.product_id]
            );

            await client.query(
                `
                INSERT INTO stock_movements (
                    product_id,
                    quantity,
                    movement_type,
                    reason,
                    created_by
                )
                VALUES ($1, $2, 'OUT', $3, $4)
                `,
                [
                    item.product_id,
                    item.quantity,
                    `Challan ${challan.challan_number} confirmation`,
                    confirmedBy,
                ]
            );
        }

        const confirmedResult = await client.query(
            `
            UPDATE challans
            SET
                status = 'Confirmed',
                updated_at = NOW()
            WHERE id = $1
            RETURNING
                id,
                challan_number,
                customer_id,
                total_quantity,
                status,
                created_by,
                created_at,
                updated_at
            `,
            [challanId]
        );

        await client.query('COMMIT');

        return getChallanById(confirmedResult.rows[0].id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};