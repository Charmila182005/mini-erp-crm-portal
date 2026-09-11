import { Router } from 'express';
import {
    getCustomersController,
    getCustomerController,
    createCustomerController,
    updateCustomerController,
    deleteCustomerController,
} from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getCustomersController);

router.post('/', authenticateToken, createCustomerController);

router.put('/:id', authenticateToken, updateCustomerController);

router.delete('/:id', authenticateToken, deleteCustomerController);

router.get('/:id', authenticateToken, getCustomerController);
export default router;