import { apiRequest } from './api';

export interface Product {
    id: string;
    product_name: string;
    sku: string;
    category: string;
    unit_price: number;
    current_stock: number;
    minimum_stock_quantity: number;
    warehouse_location: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProductFormData {
    product_name: string;
    sku: string;
    category: string;
    unit_price: number;
    current_stock: number;
    minimum_stock_quantity: number;
    warehouse_location: string;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

/**
 * Get all products
 */
export const getProducts = async (): Promise<
    Product[]
> => {
    const response =
        await apiRequest<ApiResponse<Product[]>>(
            '/products'
        );

    return response.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (
    id: string
): Promise<Product> => {
    const response =
        await apiRequest<ApiResponse<Product>>(
            `/products/${id}`
        );

    return response.data;
};

/**
 * Create product
 */
export const createProduct = async (
    data: ProductFormData
): Promise<Product> => {
    const response =
        await apiRequest<ApiResponse<Product>>(
            '/products',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );

    return response.data;
};

/**
 * Update product
 */
export const updateProduct = async (
    id: string,
    data: ProductFormData
): Promise<Product> => {
    const response =
        await apiRequest<ApiResponse<Product>>(
            `/products/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            }
        );

    return response.data;
};

/**
 * Delete product
 */
export const deleteProduct = async (
    id: string
): Promise<void> => {
    await apiRequest<ApiResponse<null>>(
        `/products/${id}`,
        {
            method: 'DELETE',
        }
    );
};