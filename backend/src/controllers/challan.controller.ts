import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import {
    getAllChallans,
    getChallanById,
    createChallan,
    confirmChallan,
    cancelChallan,
} from '../services/challan.service';

const validateCreateChallanInput = (
    body: any
): { valid: boolean; message?: string } => {
    if (
        typeof body.challan_number !== 'string' ||
        !body.challan_number.trim()
    ) {
        return {
            valid: false,
            message: 'Challan number is required',
        };
    }

    if (
        typeof body.customer_id !== 'string' ||
        !body.customer_id.trim()
    ) {
        return {
            valid: false,
            message: 'Customer ID is required',
        };
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
        return {
            valid: false,
            message: 'At least one challan item is required',
        };
    }

    for (const item of body.items) {
        if (
            typeof item.product_id !== 'string' ||
            !item.product_id.trim()
        ) {
            return {
                valid: false,
                message: 'Each item must have a product ID',
            };
        }

        if (
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0
        ) {
            return {
                valid: false,
                message:
                    'Each item quantity must be a positive integer',
            };
        }
    }

    const productIds = body.items.map(
        (item: any) => item.product_id
    );

    if (new Set(productIds).size !== productIds.length) {
        return {
            valid: false,
            message:
                'Duplicate products are not allowed in a challan',
        };
    }

    return { valid: true };
};

/**
 * GET /api/challans
 *
 * View all challans.
 * All authenticated roles can view.
 */
export const getChallansController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const challans = await getAllChallans();

        res.status(200).json({
            success: true,
            data: challans,
        });
    } catch (error) {
        console.error(
            '[Challan Controller] Get challans:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to fetch challans',
        });
    }
};

/**
 * GET /api/challans/:id
 *
 * View a single challan.
 * All authenticated roles can view.
 */
export const getChallanController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Challan ID is required',
            });
            return;
        }

        const challan = await getChallanById(id);

        if (!challan) {
            res.status(404).json({
                success: false,
                message: 'Challan not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: challan,
        });
    } catch (error) {
        console.error(
            '[Challan Controller] Get challan:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to fetch challan',
        });
    }
};

/**
 * POST /api/challans
 *
 * Creates a Draft challan.
 * Stock is NOT changed.
 *
 * ADMIN and SALES only.
 */
export const createChallanController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const validation = validateCreateChallanInput(
            req.body
        );

        if (!validation.valid) {
            res.status(400).json({
                success: false,
                message: validation.message,
            });
            return;
        }

        const challan = await createChallan({
            challanNumber: req.body.challan_number.trim(),
            customerId: req.body.customer_id.trim(),
            createdBy: req.user.id,
            items: req.body.items.map((item: any) => ({
                productId: item.product_id.trim(),
                quantity: item.quantity,
            })),
        });

        res.status(201).json({
            success: true,
            message: 'Draft challan created successfully',
            data: challan,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to create challan';

        if (message === 'Customer not found') {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }

        if (message === 'One or more products not found') {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }

        if (
            message ===
            'Duplicate products are not allowed in a challan'
        ) {
            res.status(400).json({
                success: false,
                message,
            });
            return;
        }

        if (
            message.includes(
                'duplicate key value violates unique constraint'
            )
        ) {
            res.status(409).json({
                success: false,
                message: 'Challan number already exists',
            });
            return;
        }

        console.error(
            '[Challan Controller] Create challan:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to create challan',
        });
    }
};

/**
 * POST /api/challans/:id/confirm
 *
 * Confirms a Draft challan.
 * Stock is atomically reduced.
 *
 * ADMIN and WAREHOUSE only.
 */
export const confirmChallanController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Challan ID is required',
            });
            return;
        }

        const challan = await confirmChallan(
            id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: 'Challan confirmed successfully',
            data: challan,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to confirm challan';

        if (message === 'Challan not found') {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }

        if (
            message.startsWith(
                'Only Draft challans can be confirmed'
            )
        ) {
            res.status(409).json({
                success: false,
                message,
            });
            return;
        }

        if (message === 'Challan has no items') {
            res.status(400).json({
                success: false,
                message,
            });
            return;
        }

        if (
            message ===
            'One or more products no longer exist'
        ) {
            res.status(409).json({
                success: false,
                message,
            });
            return;
        }

        if (message.startsWith('Insufficient stock for')) {
            res.status(409).json({
                success: false,
                message,
            });
            return;
        }

        console.error(
            '[Challan Controller] Confirm challan:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to confirm challan',
        });
    }
};

/**
 * POST /api/challans/:id/cancel
 *
 * Cancels a Draft challan.
 * Stock is NOT changed.
 *
 * ADMIN and SALES only.
 */
export const cancelChallanController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Challan ID is required',
            });
            return;
        }

        const challan = await cancelChallan(
            id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: 'Challan cancelled successfully',
            data: challan,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to cancel challan';

        if (message === 'Challan not found') {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }

        if (
            message.startsWith(
                'Only Draft challans can be cancelled'
            )
        ) {
            res.status(409).json({
                success: false,
                message,
            });
            return;
        }

        console.error(
            '[Challan Controller] Cancel challan:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to cancel challan',
        });
    }
};