import { Router } from 'express';
import {
    loginController,
    meController,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', loginController);

router.get('/me', authenticateToken, meController);

export default router;