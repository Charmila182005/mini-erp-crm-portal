import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { verifyToken } from '../utils/jwt';

export const authenticateToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication token is required',
            });
            return;
        }

        const token = authHeader.substring(7);

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication token is required',
            });
            return;
        }

        const user = verifyToken(token);

        req.user = user;

        next();
    } catch (error) {
        console.error('[Authentication Middleware]', error);

        res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token',
        });
    }
};