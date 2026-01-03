/**
 * Admin Routes
 * Defines API endpoints for administrative functions
 */

import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  bulkCreateMeals,
  getSystemAnalytics,
  getAdminStats
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import Meal from '../models/Meal.model.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Dashboard and analytics
router.get('/stats', getAdminStats);
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getSystemAnalytics);

// Meal management
router.get('/meals', async (req, res) => {
  try {
    const meals = await Meal.find().limit(100).sort({ name: 1 });
    res.json({ success: true, data: { meals } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.delete('/meals/:id', async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post('/meals/bulk', bulkCreateMeals);

export default router;
