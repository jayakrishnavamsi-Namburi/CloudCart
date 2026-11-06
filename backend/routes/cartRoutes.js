import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);

export default router;
