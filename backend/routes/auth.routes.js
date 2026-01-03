/**
 * Authentication Routes
 * Defines API endpoints for user authentication
 */

import express from 'express';
import {
  register,
  login,
  getMe,
  logout
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  registerValidation,
  loginValidation
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
