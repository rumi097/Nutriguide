/**
 * Meal Controller
 * Handles meal database operations, search, and recipe management
 */

import Meal from '../models/Meal.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import axios from 'axios';

/**
 * @route   GET /api/meals
 * @desc    Get all meals with filtering and pagination
 * @access  Public
 */
export const getMeals = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    dietaryTags,
    maxCalories,
    minProtein,
    page = 1,
    limit = 20
  } = req.query;
  
  // Build query
  const query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (dietaryTags) {
    query.dietaryTags = { $in: dietaryTags.split(',') };
  }
  
  if (maxCalories) {
    query['nutrition.calories'] = { $lte: parseInt(maxCalories) };
  }
  
  if (minProtein) {
    query['nutrition.protein'] = { $gte: parseInt(minProtein) };
  }
  
  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const meals = await Meal.find(query)
    .sort({ popularity: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Meal.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      meals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

/**
 * @route   GET /api/meals/:id
 * @desc    Get single meal by ID
 * @access  Public
 */
export const getMealById = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.id);
  
  if (!meal) {
    return res.status(404).json({
      success: false,
      message: 'Meal not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      meal
    }
  });
});

/**
 * @route   POST /api/meals
 * @desc    Create a new meal (Admin only)
 * @access  Private/Admin
 */
export const createMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Meal created successfully',
    data: {
      meal
    }
  });
});

/**
 * @route   PUT /api/meals/:id
 * @desc    Update meal (Admin only)
 * @access  Private/Admin
 */
export const updateMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!meal) {
    return res.status(404).json({
      success: false,
      message: 'Meal not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Meal updated successfully',
    data: {
      meal
    }
  });
});

/**
 * @route   DELETE /api/meals/:id
 * @desc    Delete meal (Admin only)
 * @access  Private/Admin
 */
export const deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.id);
  
  if (!meal) {
    return res.status(404).json({
      success: false,
      message: 'Meal not found'
    });
  }
  
  // Soft delete - mark as inactive
  meal.isActive = false;
  await meal.save();
  
  res.status(200).json({
    success: true,
    message: 'Meal deleted successfully'
  });
});

/**
 * @route   GET /api/meals/search/recommendations
 * @desc    Get meal recommendations based on user preferences
 * @access  Private
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  const { calorieTarget, category } = req.query;
  
  const user = req.user;
  
  // Try to get AI-powered recommendations from ML service
  try {
    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/recommend/personalized`, {
      daily_calories: user.dailyCalorieTarget || 2000,
      target_protein: user.macronutrients?.protein || 150,
      target_carbs: user.macronutrients?.carbs || 200,
      target_fats: user.macronutrients?.fats || 67,
      dietary_preferences: user.dietaryPreferences || [],
      allergies: user.allergies || [],
      meal_type: category || null,
      top_n: 10
    });
    
    if (mlResponse.data.success) {
      // Map ML recommendations to meal format
      const mlMeals = mlResponse.data.recommendations.map(rec => ({
        name: rec.name,
        category: rec.category,
        nutrition: {
          calories: rec.calories,
          protein: rec.protein,
          carbohydrates: rec.carbohydrates,
          fats: rec.fats,
          fiber: rec.fiber
        },
        cuisine: rec.cuisine,
        dietaryTags: rec.dietary_tags,
        allergens: rec.allergens,
        cookTime: rec.cook_time,
        recommendationScore: rec.score
      }));
      
      return res.status(200).json({
        success: true,
        data: {
          meals: mlMeals,
          source: 'ml_recommendation'
        }
      });
    }
  } catch (mlError) {
    console.error('ML Recommendation Error:', mlError.message);
    // Fall back to database query
  }
  
  // Fallback: Use database query with filtering
  const meals = await Meal.findSuitableMeals(
    {
      dietaryPreferences: user.dietaryPreferences,
      allergies: user.allergies
    },
    parseInt(calorieTarget) || user.dailyCalorieTarget * 0.3,
    150
  );
  
  // Filter by category if specified
  const filteredMeals = category 
    ? meals.filter(meal => meal.category === category)
    : meals;
  
  res.status(200).json({
    success: true,
    data: {
      meals: filteredMeals.slice(0, 10),
      source: 'database_filter'
    }
  });
});

/**
 * @route   GET /api/meals/categories/summary
 * @desc    Get meal counts by category
 * @access  Public
 */
export const getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Meal.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgCalories: { $avg: '$nutrition.calories' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      summary
    }
  });
});
