import { Router } from 'express';
import {
    getCustomerFollowupsController,
    createFollowupController,
    updateFollowupController,
    deleteFollowupController,
} from '../controllers/followup.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get(
    '/customer/:customerId',
    authenticateToken,
    getCustomerFollowupsController
);

router.post(
    '/customer/:customerId',
    authenticateToken,
    createFollowupController
);

router.put(
    '/:id',
    authenticateToken,
    updateFollowupController
);

router.delete(
    '/:id',
    authenticateToken,
    deleteFollowupController
);

export default router;