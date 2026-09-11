import { Request, Response } from 'express';
import {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from '../services/customer.service';

export const getCustomersController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const customers = await getAllCustomers();

        res.status(200).json({
            success: true,
            data: customers,
        });
    } catch (error) {
        console.error('[Customer Controller] Get all customers:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch customers',
        });
    }
};

export const getCustomerController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Customer ID is required',
            });
            return;
        }

        const customer = await getCustomerById(id);

        if (!customer) {
            res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: customer,
        });
    } catch (error) {
        console.error('[Customer Controller] Get all customers:', error);

        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
}
export const createCustomerController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            customer_name,
            mobile_number,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes,
        } = req.body;

        if (
            typeof customer_name !== 'string' ||
            !customer_name.trim() ||
            typeof mobile_number !== 'string' ||
            !mobile_number.trim() ||
            typeof email !== 'string' ||
            !email.trim() ||
            typeof customer_type !== 'string' ||
            !customer_type.trim() ||
            typeof address !== 'string' ||
            !address.trim() ||
            typeof status !== 'string' ||
            !status.trim()
        ) {
            res.status(400).json({
                success: false,
                message: 'Required customer fields are missing',
            });
            return;
        }

        const customer = await createCustomer({
            customer_name: customer_name.trim(),
            mobile_number: mobile_number.trim(),
            email: email.trim(),
            business_name: business_name?.trim() || null,
            gst_number: gst_number?.trim() || null,
            customer_type: customer_type.trim(),
            address: address.trim(),
            status: status.trim(),
            follow_up_date: follow_up_date || null,
            notes: notes?.trim() || null,
        });

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer,
        });
    } catch (error) {
        console.error('[Customer Controller] Create customer:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create customer',
        });
    }
};
export const updateCustomerController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Customer ID is required',
            });
            return;
        }

        const {
            customer_name,
            mobile_number,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes,
        } = req.body;

        if (
            typeof customer_name !== 'string' ||
            !customer_name.trim() ||
            typeof mobile_number !== 'string' ||
            !mobile_number.trim() ||
            typeof email !== 'string' ||
            !email.trim() ||
            typeof customer_type !== 'string' ||
            !customer_type.trim() ||
            typeof address !== 'string' ||
            !address.trim() ||
            typeof status !== 'string' ||
            !status.trim()
        ) {
            res.status(400).json({
                success: false,
                message: 'Required customer fields are missing',
            });
            return;
        }

        const customer = await updateCustomer(id, {
            customer_name: customer_name.trim(),
            mobile_number: mobile_number.trim(),
            email: email.trim(),
            business_name: business_name?.trim() || null,
            gst_number: gst_number?.trim() || null,
            customer_type: customer_type.trim(),
            address: address.trim(),
            status: status.trim(),
            follow_up_date: follow_up_date || null,
            notes: notes?.trim() || null,
        });

        if (!customer) {
            res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: customer,
        });
    } catch (error) {
        console.error('[Customer Controller] Update customer:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update customer',
        });
    }
};
export const deleteCustomerController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Customer ID is required',
            });
            return;
        }

        const deletedCustomer = await deleteCustomer(id);

        if (!deletedCustomer) {
            res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully',
        });
    } catch (error) {
        console.error('[Customer Controller] Delete customer:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete customer',
        });
    }
};