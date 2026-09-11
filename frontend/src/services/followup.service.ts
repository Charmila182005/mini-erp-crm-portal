import { apiRequest } from './api';

import type {
    FollowUp,
    FollowUpFormData,
} from '../types/followup.types';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

/**
 * Get all follow-ups for a customer
 */
export const getFollowUps = async (
    customerId: string
): Promise<FollowUp[]> => {
    const response =
        await apiRequest<ApiResponse<FollowUp[]>>(
            `/followups/customer/${customerId}`
        );

    return response.data;
};

/**
 * Create a new follow-up
 */
export const createFollowUp = async (
    customerId: string,
    data: FollowUpFormData
): Promise<FollowUp> => {
    const response =
        await apiRequest<ApiResponse<FollowUp>>(
            `/followups/customer/${customerId}`,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );

    return response.data;
};

/**
 * Update an existing follow-up
 */
export const updateFollowUp = async (
    id: string,
    data: FollowUpFormData
): Promise<FollowUp> => {
    const response =
        await apiRequest<ApiResponse<FollowUp>>(
            `/followups/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            }
        );

    return response.data;
};

/**
 * Delete a follow-up
 */
export const deleteFollowUp = async (
    id: string
): Promise<void> => {
    await apiRequest<ApiResponse<null>>(
        `/followups/${id}`,
        {
            method: 'DELETE',
        }
    );
};