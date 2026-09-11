import { Router } from 'express';
import {
    getProductsController,
    getProductController,
    createProductController,
    updateProductController,
    deleteProductController,
} from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All product APIs require authentication.
router.get(
    '/',
    authenticateToken,
    getProductsController
);

router.get(
    '/:id',
    authenticateToken,
    getProductController
);

// Product creation/update/deletion is restricted
// to ADMIN and WAREHOUSE roles.
router.post(
    '/',
    authenticateToken,
    requireRole('ADMIN', 'WAREHOUSE'),
    createProductController
);

router.put(
    '/:id',
    authenticateToken,
    requireRole('ADMIN', 'WAREHOUSE'),
    updateProductController
);

router.delete(
    '/:id',
    authenticateToken,
    requireRole('ADMIN', 'WAREHOUSE'),
    deleteProductController
);

export default router;