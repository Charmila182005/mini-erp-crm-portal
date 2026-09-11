import { Router } from 'express';
import {
    getChallansController,
    getChallanController,
    createChallanController,
    confirmChallanController,
    cancelChallanController,
} from '../controllers/challan.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

/**
 * View all challans
 * All authenticated roles can view.
 */
router.get(
    '/',
    authenticateToken,
    getChallansController
);

/**
 * View a single challan
 * All authenticated roles can view.
 */
router.get(
    '/:id',
    authenticateToken,
    getChallanController
);

/**
 * Create Draft challan
 * ADMIN and SALES can create.
 */
router.post(
    '/',
    authenticateToken,
    requireRole('ADMIN', 'SALES'),
    createChallanController
);

/**
 * Confirm Draft challan
 * ADMIN and WAREHOUSE can confirm.
 */
router.post(
    '/:id/confirm',
    authenticateToken,
    requireRole('ADMIN', 'WAREHOUSE'),
    confirmChallanController
);

/**
 * Cancel Draft challan
 * ADMIN and SALES can cancel.
 */
router.post(
    '/:id/cancel',
    authenticateToken,
    requireRole('ADMIN', 'SALES'),
    cancelChallanController
);

export default router;