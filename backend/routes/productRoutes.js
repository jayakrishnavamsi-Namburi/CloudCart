import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getCategories
} from '../controllers/productController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { productValidation } from '../middleware/validate.js';

const router = express.Router();

// Public routes (Notice: specific subroutes defined before parameter route :id)
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin restricted routes
router.post('/', authenticate, authorizeAdmin, productValidation, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;
