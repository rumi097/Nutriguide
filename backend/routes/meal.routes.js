/**
 * Meal Routes
 * Defines API endpoints for meal database operations
 */

import express from 'express';
import {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  getRecommendations,
  getCategorySummary
} from '../controllers/meal.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { createMealValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getMeals);
router.get('/categories/summary', getCategorySummary);
router.get('/:id', getMealById);

// Protected routes
router.get('/search/recommendations', protect, getRecommendations);

// Admin only routes
router.post('/', protect, authorize('admin'), createMealValidation, createMeal);
router.put('/:id', protect, authorize('admin'), updateMeal);
router.delete('/:id', protect, authorize('admin'), deleteMeal);

export default router;
