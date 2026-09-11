import { query } from '../config/database';

export interface ProductInput {
    product_name: string;
    sku: string;
    category: string;
    unit_price: number;
    current_stock: number;
    minimum_stock_quantity: number;
    warehouse_location: string;
}

export interface ProductUpdateInput {
    product_name: string;
    sku: string;
    category: string;
    unit_price: number;
    minimum_stock_quantity: number;
    warehouse_location: string;
}

export const getAllProducts = async () => {
    const result = await query(
        `
        SELECT
            id,
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock_quantity,
            warehouse_location,
            created_at,
            updated_at
        FROM products
        ORDER BY created_at DESC
        `
    );

    return result.rows;
};

export const getProductById = async (id: string) => {
    const result = await query(
        `
        SELECT
            id,
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock_quantity,
            warehouse_location,
            created_at,
            updated_at
        FROM products
        WHERE id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
};

export const createProduct = async (
    product: ProductInput
) => {
    const result = await query(
        `
        INSERT INTO products (
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock_quantity,
            warehouse_location
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            id,
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock_quantity,
            warehouse_location,
            created_at,
            updated_at
        `,
        [
            product.product_name,
            product.sku,
            product.category,
            product.unit_price,
            product.current_stock,
            product.minimum_stock_quantity,
            product.warehouse_location,
        ]
    );

    return result.rows[0];
};

export const updateProduct = async (
    id: string,
    product: ProductUpdateInput
) => {
    const result = await query(
        `
        UPDATE products
        SET
            product_name = $1,
            sku = $2,
            category = $3,
            unit_price = $4,
            minimum_stock_quantity = $5,
            warehouse_location = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING
            id,
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock_quantity,
            warehouse_location,
            created_at,
            updated_at
        `,
        [
            product.product_name,
            product.sku,
            product.category,
            product.unit_price,
            product.minimum_stock_quantity,
            product.warehouse_location,
            id,
        ]
    );

    return result.rows[0] || null;
};

export const deleteProduct = async (id: string) => {
    const result = await query(
        `
        DELETE FROM products
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows[0] || null;
};

export const isSkuTaken = async (
    sku: string,
    excludeProductId?: string
) => {
    const result = await query(
        `
        SELECT id
        FROM products
        WHERE LOWER(sku) = LOWER($1)
        ${excludeProductId ? 'AND id <> $2' : ''}
        LIMIT 1
        `,
        excludeProductId
            ? [sku, excludeProductId]
            : [sku]
    );

    return result.rows.length > 0;
};