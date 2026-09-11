import { apiRequest } from './api';

import type {
    Customer,
    CustomerFormData,
    FollowUp,
} from '../types/customer.types';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export const getCustomers = async (): Promise<Customer[]> => {
    const response = await apiRequest<
        ApiResponse<Customer[]>
    >('/customers');

    return response.data;
};

export const getCustomer = async (
    id: string
): Promise<Customer> => {
    const response = await apiRequest<
        ApiResponse<Customer>
    >(`/customers/${id}`);

    return response.data;
};

export const createCustomer = async (
    customer: CustomerFormData
): Promise<Customer> => {
    const response = await apiRequest<
        ApiResponse<Customer>
    >('/customers', {
        method: 'POST',
        body: JSON.stringify(customer),
    });

    return response.data;
};

export const updateCustomer = async (
    id: string,
    customer: CustomerFormData
): Promise<Customer> => {
    const response = await apiRequest<
        ApiResponse<Customer>
    >(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customer),
    });

    return response.data;
};

export const deleteCustomer = async (
    id: string
): Promise<void> => {
    await apiRequest<ApiResponse<null>>(
        `/customers/${id}`,
        {
            method: 'DELETE',
        }
    );
};

export const getFollowUps = async (
    customerId: string
): Promise<FollowUp[]> => {
    const response = await apiRequest<
        ApiResponse<FollowUp[]>
    >(`/followups/customer/${customerId}`);

    return response.data;
};

export const createFollowUp = async (
    customerId: string,
    note: string,
    followUpDate: string
): Promise<FollowUp> => {
    const response = await apiRequest<
        ApiResponse<FollowUp>
    >(`/followups/customer/${customerId}`, {
        method: 'POST',
        body: JSON.stringify({
            note,
            follow_up_date: followUpDate,
        }),
    });

    return response.data;
};

export const updateFollowUp = async (
    id: string,
    note: string,
    followUpDate: string
): Promise<FollowUp> => {
    const response = await apiRequest<
        ApiResponse<FollowUp>
    >(`/followups/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            note,
            follow_up_date: followUpDate,
        }),
    });

    return response.data;
};

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