import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { orderValidation } from '../middleware/validate.js';

const router = express.Router();

// All order endpoints require authentication
router.use(authenticate);

// Specific order routes placed before parameterized :id
router.post('/', orderValidation, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/stats', authorizeAdmin, getOrderStats);
router.get('/', authorizeAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorizeAdmin, updateOrderStatus);

export default router;
