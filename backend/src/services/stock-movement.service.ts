import { getClient, query } from '../config/database';

export type MovementType = 'IN' | 'OUT';

export interface StockMovementInput {
    productId: string;
    quantity: number;
    movementType: MovementType;
    reason: string;
    createdBy: string;
}

export const getAllStockMovements = async () => {
    const result = await query(
        `
        SELECT
            sm.id,
            sm.product_id,
            p.product_name,
            p.sku,
            sm.quantity,
            sm.movement_type,
            sm.reason,
            sm.created_by,
            u.name AS created_by_name,
            sm.created_at
        FROM stock_movements sm
        JOIN products p
            ON p.id = sm.product_id
        JOIN users u
            ON u.id = sm.created_by
        ORDER BY sm.created_at DESC
        `
    );

    return result.rows;
};

export const getStockMovementById = async (id: string) => {
    const result = await query(
        `
        SELECT
            sm.id,
            sm.product_id,
            p.product_name,
            p.sku,
            sm.quantity,
            sm.movement_type,
            sm.reason,
            sm.created_by,
            u.name AS created_by_name,
            sm.created_at
        FROM stock_movements sm
        JOIN products p
            ON p.id = sm.product_id
        JOIN users u
            ON u.id = sm.created_by
        WHERE sm.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};

export const createStockMovement = async (
    input: StockMovementInput
) => {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // Lock the product row so concurrent stock updates
        // cannot modify the same product at the same time.
        const productResult = await client.query(
            `
            SELECT
                id,
                product_name,
                current_stock
            FROM products
            WHERE id = $1
            FOR UPDATE
            `,
            [input.productId]
        );

        if (productResult.rows.length === 0) {
            throw new Error('Product not found');
        }

        const product = productResult.rows[0];

        if (input.movementType === 'IN') {
            await client.query(
                `
                UPDATE products
                SET
                    current_stock = current_stock + $1,
                    updated_at = NOW()
                WHERE id = $2
                `,
                [input.quantity, input.productId]
            );
        } else if (input.movementType === 'OUT') {
            if (product.current_stock < input.quantity) {
                throw new Error('Insufficient stock');
            }

            await client.query(
                `
                UPDATE products
                SET
                    current_stock = current_stock - $1,
                    updated_at = NOW()
                WHERE id = $2
                `,
                [input.quantity, input.productId]
            );
        } else {
            throw new Error('Invalid movement type');
        }

        const movementResult = await client.query(
            `
            INSERT INTO stock_movements (
                product_id,
                quantity,
                movement_type,
                reason,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                id,
                product_id,
                quantity,
                movement_type,
                reason,
                created_by,
                created_at
            `,
            [
                input.productId,
                input.quantity,
                input.movementType,
                input.reason,
                input.createdBy,
            ]
        );

        await client.query('COMMIT');

        return movementResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};