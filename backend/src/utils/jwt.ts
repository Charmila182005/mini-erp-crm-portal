import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthUser } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const generateToken = (user: AuthUser): string => {
    const options: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        options
    );
};

export const verifyToken = (token: string): AuthUser => {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
        typeof decoded !== 'object' ||
        decoded === null ||
        typeof decoded.id !== 'string' ||
        typeof decoded.email !== 'string' ||
        typeof decoded.role !== 'string'
    ) {
        throw new Error('Invalid token payload');
    }

    return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role as AuthUser['role'],
    };
};