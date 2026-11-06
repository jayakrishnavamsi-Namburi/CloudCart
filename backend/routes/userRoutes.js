import express from 'express';
import {
  getAllUsers,
  getUserStats,
  updateUserRole
} from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// All user management routes require authenticated admin access
router.use(authenticate, authorizeAdmin);

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.put('/:id', updateUserRole);

export default router;
