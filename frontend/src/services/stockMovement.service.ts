import { apiRequest } from './api';

export interface StockMovement {
    id: string;
    product_id: string;
    product_name?: string;
    sku?: string;
    movement_type: 'IN' | 'OUT';
    quantity: number;
    reason: string;
    reference?: string | null;
    created_by?: string;
    created_by_email?: string;
    created_at: string;
}

export interface StockMovementFormData {
    product_id: string;
    movement_type: 'IN' | 'OUT';
    quantity: number;
    reason: string;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

/**
 * Get all stock movements
 */
export const getStockMovements = async (): Promise<
    StockMovement[]
> => {
    const response =
        await apiRequest<
            ApiResponse<StockMovement[]>
        >('/stock-movements');

    return response.data;
};

/**
 * Create a stock movement
 *
 * IN  -> increases product stock
 * OUT -> decreases product stock
 *
 * The backend validates that stock
 * never becomes negative.
 */
export const createStockMovement = async (
    data: StockMovementFormData
): Promise<StockMovement> => {
    const response =
        await apiRequest<
            ApiResponse<StockMovement>
        >('/stock-movements', {
            method: 'POST',
            body: JSON.stringify(data),
        });

    return response.data;
};