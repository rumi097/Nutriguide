/**
 * Nutrition Controller
 * Handles nutrition recommendations and meal planning using ML service
 */

import { asyncHandler } from '../middleware/error.middleware.js';
import User from '../models/User.model.js';
import Meal from '../models/Meal.model.js';
import axios from 'axios';

const normalizeUrl = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim().replace(/\/+$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
};

/**
 * @route   GET /api/nutrition/recommendations
 * @desc    Get personalized nutrition recommendations
 * @access  Private
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get recommendations from ML service
  try {
    const mlBaseUrl = normalizeUrl(process.env.ML_SERVICE_URL);
    if (!mlBaseUrl) throw new Error('ML_SERVICE_URL is not configured');

    const mlResponse = await axios.post(`${mlBaseUrl}/predict`, {
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activity_level: user.activityLevel,
      fitness_goal: user.fitnessGoal
    });
    
    if (mlResponse.data.success) {
      res.status(200).json({
        success: true,
        data: {
          dailyCalories: mlResponse.data.daily_calories,
          macronutrients: mlResponse.data.macronutrients,
          bmi: mlResponse.data.bmi,
          bmr: mlResponse.data.bmr,
          recommendations: mlResponse.data.recommendations || []
        }
      });
    } else {
      throw new Error('ML service returned unsuccessful response');
    }
  } catch (mlError) {
    console.error('ML Service Error:', mlError.message);
    
    // Fallback: Calculate using simple formulas
    const fallbackData = calculateFallbackNutrition(user);
    
    res.status(200).json({
      success: true,
      data: fallbackData,
      warning: 'Using fallback calculation (ML service unavailable)'
    });
  }
});

/**
 * @route   POST /api/nutrition/meal-plan
 * @desc    Generate daily meal plan
 * @access  Private
 */
export const generateMealPlan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const { date, mealTypes } = req.body;
  
  const targetMealTypes = mealTypes || ['breakfast', 'lunch', 'dinner', 'snack'];
  const dailyCalories = user.dailyCalorieTarget;
  
  // Calculate calorie distribution
  const calorieDistribution = {
    breakfast: dailyCalories * 0.25,
    lunch: dailyCalories * 0.35,
    dinner: dailyCalories * 0.30,
    snack: dailyCalories * 0.10
  };
  
  const mealPlan = {};
  
  // Find suitable meals for each meal type
  for (const mealType of targetMealTypes) {
    const targetCalories = calorieDistribution[mealType];
    
    const meals = await Meal.findSuitableMeals(
      {
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies
      },
      targetCalories,
      150 // tolerance
    );
    
    // Select random meals from suitable options
    const selectedMeals = meals.slice(0, 3).map(meal => ({
      id: meal._id,
      name: meal.name,
      category: meal.category,
      calories: meal.nutrition.calories,
      protein: meal.nutrition.protein,
      carbs: meal.nutrition.carbohydrates,
      fats: meal.nutrition.fats,
      imageUrl: meal.imageUrl,
      prepTime: meal.prepTime,
      cookTime: meal.cookTime
    }));
    
    mealPlan[mealType] = selectedMeals;
  }
  
  res.status(200).json({
    success: true,
    data: {
      date: date || new Date(),
      mealPlan,
      totalCalories: dailyCalories,
      macroTargets: user.macronutrients
    }
  });
});

/**
 * @route   GET /api/nutrition/calculate
 * @desc    Calculate nutrition needs based on custom inputs
 * @access  Private
 */
export const calculateNutrition = asyncHandler(async (req, res) => {
  const { age, gender, height, weight, activityLevel, fitnessGoal } = req.query;
  
  try {
    const mlBaseUrl = normalizeUrl(process.env.ML_SERVICE_URL);
    if (!mlBaseUrl) throw new Error('ML_SERVICE_URL is not configured');

    const mlResponse = await axios.post(`${mlBaseUrl}/predict`, {
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      activity_level: activityLevel,
      fitness_goal: fitnessGoal
    });
    
    res.status(200).json({
      success: true,
      data: mlResponse.data
    });
  } catch (mlError) {
    console.error('ML Service Error:', mlError.message);
    
    const fallbackData = calculateFallbackNutrition({
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      activityLevel,
      fitnessGoal
    });
    
    res.status(200).json({
      success: true,
      data: fallbackData,
      warning: 'Using fallback calculation'
    });
  }
});

/**
 * Fallback nutrition calculation using Mifflin-St Jeor equation
 */
const calculateFallbackNutrition = (userData) => {
  const { age, gender, height, weight, activityLevel, fitnessGoal } = userData;
  
  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  let tdee = bmr * multiplier;
  
  // Adjust for fitness goal
  const goalAdjustments = {
    lose_weight: -500,
    maintain_weight: 0,
    gain_weight: 500,
    build_muscle: 300,
    improve_health: 0
  };
  
  const dailyCalories = Math.round(tdee + (goalAdjustments[fitnessGoal] || 0));
  
  // Calculate macronutrients
  const macronutrients = {
    protein: Math.round(dailyCalories * 0.30 / 4), // 30% of calories, 4 cal/g
    carbs: Math.round(dailyCalories * 0.40 / 4),   // 40% of calories, 4 cal/g
    fats: Math.round(dailyCalories * 0.30 / 9)     // 30% of calories, 9 cal/g
  };
  
  return {
    daily_calories: dailyCalories,
    macronutrients,
    bmi: parseFloat(bmi.toFixed(2)),
    bmr: Math.round(bmr),
    recommendations: [
      'Drink at least 8 glasses of water daily',
      'Include fruits and vegetables in every meal',
      'Aim for 7-9 hours of sleep per night'
    ]
  };
};
