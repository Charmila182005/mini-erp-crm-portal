import { apiRequest } from './api';

export interface ChallanItemInput {
    product_id: string;
    quantity: number;
}

export interface CreateChallanData {
    challan_number: string;
    customer_id: string;
    items: ChallanItemInput[];
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const getChallans = async () => {
    const response =
        await apiRequest<ApiResponse<any[]>>(
            '/challans'
        );

    return response.data;
};

export const getChallanById = async (
    id: string
) => {
    const response =
        await apiRequest<ApiResponse<any>>(
            `/challans/${id}`
        );

    return response.data;
};

export const createChallan = async (
    data: CreateChallanData
) => {
    const response =
        await apiRequest<ApiResponse<any>>(
            '/challans',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );

    return response.data;
};

export const confirmChallan = async (
    id: string
) => {
    const response =
        await apiRequest<ApiResponse<any>>(
            `/challans/${id}/confirm`,
            {
                method: 'POST',
            }
        );

    return response.data;
};

export const cancelChallan = async (
    id: string
) => {
    const response =
        await apiRequest<ApiResponse<any>>(
            `/challans/${id}/cancel`,
            {
                method: 'POST',
            }
        );

    return response.data;
};