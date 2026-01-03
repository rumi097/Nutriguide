/**
 * User Routes
 * Defines API endpoints for user profile management
 */

import express from 'express';
import {
  getProfile,
  updateProfile,
  getDashboard,
  deleteAccount
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { updateProfileValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.get('/dashboard', getDashboard);
router.delete('/account', deleteAccount);

export default router;
