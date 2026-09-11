import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { AuthUser } from '../types/auth.types';
import { generateToken } from '../utils/jwt';

interface LoginResult {
    user: AuthUser;
    token: string;
}

export const login = async (
    email: string,
    password: string
): Promise<LoginResult> => {
    const result = await query(
        `
      SELECT id, name, email, password_hash, role
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
        [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error('Invalid email or password');
    }

    const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const token = generateToken(authUser);

    return {
        user: authUser,
        token,
    };
};