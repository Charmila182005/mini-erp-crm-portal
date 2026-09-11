import { Router } from 'express';
import {
    getStockMovementsController,
    getStockMovementController,
    createStockMovementController,
} from '../controllers/stock-movement.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All authenticated users can view stock movement history.
router.get(
    '/',
    authenticateToken,
    getStockMovementsController
);

router.get(
    '/:id',
    authenticateToken,
    getStockMovementController
);

// Only ADMIN and WAREHOUSE can create stock movements.
router.post(
    '/',
    authenticateToken,
    requireRole('ADMIN', 'WAREHOUSE'),
    createStockMovementController
);

export default router;