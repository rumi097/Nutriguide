/**
 * Nutrition Routes
 * Defines API endpoints for nutrition recommendations and calculations
 */

import express from 'express';
import {
  getRecommendations,
  generateMealPlan,
  calculateNutrition
} from '../controllers/nutrition.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/recommendations', getRecommendations);
router.post('/meal-plan', generateMealPlan);
router.get('/calculate', calculateNutrition);

export default router;
