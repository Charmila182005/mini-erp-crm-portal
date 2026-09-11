import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { login } from '../services/auth.service';

export const loginController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Basic request validation
        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
            return;
        }

        const result = await login(email, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Authentication failed';

        if (message === 'Invalid email or password') {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        console.error('[Auth Controller]', error);

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
export const meController = (
    req: AuthenticatedRequest,
    res: Response
): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    res.status(200).json({
        success: true,
        message: 'Authenticated user',
        data: {
            user: req.user,
        },
    });
};