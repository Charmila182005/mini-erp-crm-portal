import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import {
    getCustomerFollowups,
    createFollowup,
    updateFollowup,
    deleteFollowup,
} from '../services/followup.service';

export const getCustomerFollowupsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            res.status(400).json({
                success: false,
                message: 'Customer ID is required',
            });
            return;
        }

        const followups = await getCustomerFollowups(customerId);

        res.status(200).json({
            success: true,
            data: followups,
        });
    } catch (error) {
        console.error(
            '[Followup Controller] Get follow-ups:',
            error
        );

        // Temporary detailed error for debugging.
        // We will replace this with a generic message after testing.
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : String(error),
        });
    }
};

export const createFollowupController = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { customerId } = req.params;
        const { follow_up_date, note } = req.body;

        if (!customerId) {
            res.status(400).json({
                success: false,
                message: 'Customer ID is required',
            });
            return;
        }

        if (
            typeof follow_up_date !== 'string' ||
            !follow_up_date.trim() ||
            typeof note !== 'string' ||
            !note.trim()
        ) {
            res.status(400).json({
                success: false,
                message: 'Follow-up date and note are required',
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const followup = await createFollowup(
            customerId,
            follow_up_date.trim(),
            note.trim(),
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: 'Follow-up created successfully',
            data: followup,
        });
    } catch (error) {
        console.error(
            '[Followup Controller] Create follow-up:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to create follow-up',
        });
    }
};

export const updateFollowupController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { follow_up_date, note } = req.body;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Follow-up ID is required',
            });
            return;
        }

        if (
            typeof follow_up_date !== 'string' ||
            !follow_up_date.trim() ||
            typeof note !== 'string' ||
            !note.trim()
        ) {
            res.status(400).json({
                success: false,
                message: 'Follow-up date and note are required',
            });
            return;
        }

        const followup = await updateFollowup(
            id,
            follow_up_date.trim(),
            note.trim()
        );

        if (!followup) {
            res.status(404).json({
                success: false,
                message: 'Follow-up not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Follow-up updated successfully',
            data: followup,
        });
    } catch (error) {
        console.error(
            '[Followup Controller] Update follow-up:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to update follow-up',
        });
    }
};

export const deleteFollowupController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Follow-up ID is required',
            });
            return;
        }

        const deletedFollowup = await deleteFollowup(id);

        if (!deletedFollowup) {
            res.status(404).json({
                success: false,
                message: 'Follow-up not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Follow-up deleted successfully',
        });
    } catch (error) {
        console.error(
            '[Followup Controller] Get follow-ups:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to fetch follow-ups',
        });
    }
}