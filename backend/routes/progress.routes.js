/**
 * Progress Routes
 * Defines API endpoints for progress tracking and analytics
 */

import express from 'express';
import {
  getTodayProgress,
  logMeal,
  updateWeight,
  getProgressHistory,
  getAnalytics,
  removeMeal,
  logWater,
  logWeight,
  getWeightHistory,
  getWeeklySummary
} from '../controllers/progress.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  logMealValidation,
  updateWeightValidation,
  dateRangeValidation
} from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/today', getTodayProgress);
router.post('/log-meal', logMealValidation, logMeal);
router.put('/update-weight', updateWeightValidation, updateWeight);
router.get('/history', dateRangeValidation, getProgressHistory);
router.get('/analytics', getAnalytics);
router.delete('/meal/:mealLogId', removeMeal);

// Water tracking
router.post('/log-water', logWater);

// Weight tracking
router.post('/log-weight', logWeight);
router.get('/weight-history', getWeightHistory);

// Weekly summary
router.get('/weekly-summary', getWeeklySummary);

export default router;
