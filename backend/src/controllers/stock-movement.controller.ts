import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import {
    getAllStockMovements,
    getStockMovementById,
    createStockMovement,
    MovementType,
} from '../services/stock-movement.service';

const validateStockMovementInput = (
    body: any
): { valid: boolean; message?: string } => {
    if (
        typeof body.product_id !== 'string' ||
        !body.product_id.trim()
    ) {
        return {
            valid: false,
            message: 'Product ID is required',
        };
    }

    if (
        !Number.isInteger(body.quantity) ||
        body.quantity <= 0
    ) {
        return {
            valid: false,
            message: 'Quantity must be a positive integer',
        };
    }

    if (
        body.movement_type !== 'IN' &&
        body.movement_type !== 'OUT'
    ) {
        return {
            valid: false,
            message: 'Movement type must be IN or OUT',
        };
    }

    if (
        typeof body.reason !== 'string' ||
        !body.reason.trim()
    ) {
        return {
            valid: false,
            message: 'Reason is required',
        };
    }

    return { valid: true };
};

export const getStockMovementsController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const movements = await getAllStockMovements();

        res.status(200).json({
            success: true,
            data: movements,
        });
    } catch (error) {
        console.error(
            '[Stock Movement Controller] Get movements:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock movements',
        });
    }
};

export const getStockMovementController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Stock movement ID is required',
            });
            return;
        }

        const movement = await getStockMovementById(id);

        if (!movement) {
            res.status(404).json({
                success: false,
                message: 'Stock movement not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: movement,
        });
    } catch (error) {
        console.error(
            '[Stock Movement Controller] Get movement:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock movement',
        });
    }
};

export const createStockMovementController = async (
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

        const validation = validateStockMovementInput(
            req.body
        );

        if (!validation.valid) {
            res.status(400).json({
                success: false,
                message: validation.message,
            });
            return;
        }

        const movement = await createStockMovement({
            productId: req.body.product_id.trim(),
            quantity: req.body.quantity,
            movementType: req.body
                .movement_type as MovementType,
            reason: req.body.reason.trim(),
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Stock movement created successfully',
            data: movement,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to create stock movement';

        if (message === 'Product not found') {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }

        if (message === 'Insufficient stock') {
            res.status(409).json({
                success: false,
                message,
            });
            return;
        }

        if (message === 'Invalid movement type') {
            res.status(400).json({
                success: false,
                message,
            });
            return;
        }

        console.error(
            '[Stock Movement Controller] Create movement:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to create stock movement',
        });
    }
};