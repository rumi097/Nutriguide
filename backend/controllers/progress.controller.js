/**
 * Progress Controller
 * Handles progress tracking, meal logging, and analytics
 */

import Progress from '../models/Progress.model.js';
import User from '../models/User.model.js';
import Meal from '../models/Meal.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * @route   GET /api/progress/today
 * @desc    Get today's progress
 * @access  Private
 */
export const getTodayProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  const progress = await Progress.getTodayProgress(req.user.id, {
    calories: user.dailyCalorieTarget,
    protein: user.macronutrients.protein,
    carbohydrates: user.macronutrients.carbs,
    fats: user.macronutrients.fats
  });
  
  await progress.populate('meals.mealId');
  
  res.status(200).json({
    success: true,
    data: {
      progress
    }
  });
});

/**
 * @route   POST /api/progress/log-meal
 * @desc    Log a meal to today's progress
 * @access  Private
 */
export const logMeal = asyncHandler(async (req, res) => {
  const { mealId, mealName, category, servings, calories, protein, carbohydrates, fats } = req.body;
  
  // Validate required fields
  if (!mealName && !mealId) {
    return res.status(400).json({
      success: false,
      message: 'Either mealName or mealId is required'
    });
  }
  
  const user = await User.findById(req.user.id);
  
  const progress = await Progress.getTodayProgress(req.user.id, {
    calories: user.dailyCalorieTarget,
    protein: user.macronutrients.protein,
    carbohydrates: user.macronutrients.carbs,
    fats: user.macronutrients.fats
  });
  
  // Get meal details if mealId provided
  let mealData = {
    mealId,
    mealName: mealName || 'Custom Meal',
    category: category || 'snack',
    servings: servings || 1,
    calories: calories || 0,
    protein: protein || 0,
    carbohydrates: carbohydrates || 0,
    fats: fats || 0,
    consumedAt: new Date()
  };
  
  if (mealId) {
    const meal = await Meal.findById(mealId);
    if (meal) {
      mealData = {
        mealId: meal._id,
        mealName: meal.name,
        category: meal.category,
        servings: servings || 1,
        calories: meal.nutrition?.calories || 0,
        protein: meal.nutrition?.protein || 0,
        carbohydrates: meal.nutrition?.carbohydrates || 0,
        fats: meal.nutrition?.fats || 0,
        consumedAt: new Date()
      };
    }
  }
  
  // Add meal to progress
  progress.addMeal(mealData);
  await progress.save();
  
  res.status(200).json({
    success: true,
    message: 'Meal logged successfully',
    data: {
      progress
    }
  });
});

/**
 * @route   PUT /api/progress/update-weight
 * @desc    Update today's weight
 * @access  Private
 */
export const updateWeight = asyncHandler(async (req, res) => {
  const { weight } = req.body;
  
  const user = await User.findById(req.user.id);
  
  const progress = await Progress.getTodayProgress(req.user.id, {
    calories: user.dailyCalorieTarget,
    protein: user.macronutrients.protein,
    carbohydrates: user.macronutrients.carbs,
    fats: user.macronutrients.fats
  });
  
  progress.weight = weight;
  await progress.save();
  
  // Update user's current weight
  user.weight = weight;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Weight updated successfully',
    data: {
      weight,
      bmi: user.bmi
    }
  });
});

/**
 * @route   GET /api/progress/history
 * @desc    Get progress history for date range
 * @access  Private
 */
export const getProgressHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate, days = 30 } = req.query;
  
  let start, end;
  
  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    // Default to last N days
    end = new Date();
    start = new Date();
    start.setDate(start.getDate() - parseInt(days));
  }
  
  const progressData = await Progress.getProgressRange(req.user.id, start, end);
  
  res.status(200).json({
    success: true,
    data: {
      progress: progressData,
      summary: calculateSummary(progressData)
    }
  });
});

/**
 * @route   GET /api/progress/analytics
 * @desc    Get detailed analytics and insights
 * @access  Private
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - parseInt(days));
  
  const progressData = await Progress.getProgressRange(req.user.id, start, end);
  const user = await User.findById(req.user.id);
  
  // Calculate analytics
  const analytics = {
    averageCalories: 0,
    averageProtein: 0,
    averageCarbs: 0,
    averageFats: 0,
    calorieCompliance: 0,
    weightChange: 0,
    totalMealsLogged: 0,
    streakDays: 0,
    chartData: {
      dates: [],
      calories: [],
      protein: [],
      carbs: [],
      fats: [],
      weight: [],
      compliance: []
    }
  };
  
  if (progressData.length > 0) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalCompliance = 0;
    let totalMeals = 0;
    
    progressData.forEach(day => {
      totalCalories += day.nutrition.calories;
      totalProtein += day.nutrition.protein;
      totalCarbs += day.nutrition.carbohydrates;
      totalFats += day.nutrition.fats;
      totalCompliance += day.compliance.calorieCompliance;
      totalMeals += day.meals.length;
      
      // Chart data
      analytics.chartData.dates.push(day.date);
      analytics.chartData.calories.push(day.nutrition.calories);
      analytics.chartData.protein.push(day.nutrition.protein);
      analytics.chartData.carbs.push(day.nutrition.carbohydrates);
      analytics.chartData.fats.push(day.nutrition.fats);
      analytics.chartData.weight.push(day.weight || null);
      analytics.chartData.compliance.push(day.compliance.calorieCompliance);
    });
    
    const count = progressData.length;
    analytics.averageCalories = Math.round(totalCalories / count);
    analytics.averageProtein = Math.round(totalProtein / count);
    analytics.averageCarbs = Math.round(totalCarbs / count);
    analytics.averageFats = Math.round(totalFats / count);
    analytics.calorieCompliance = Math.round(totalCompliance / count);
    analytics.totalMealsLogged = totalMeals;
    
    // Calculate weight change
    const weightsRecorded = progressData.filter(d => d.weight);
    if (weightsRecorded.length >= 2) {
      analytics.weightChange = parseFloat(
        (weightsRecorded[weightsRecorded.length - 1].weight - weightsRecorded[0].weight).toFixed(2)
      );
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      analytics,
      targets: {
        calories: user.dailyCalorieTarget,
        protein: user.macronutrients.protein,
        carbs: user.macronutrients.carbs,
        fats: user.macronutrients.fats
      }
    }
  });
});

/**
 * @route   DELETE /api/progress/meal/:mealLogId
 * @desc    Remove a logged meal from today's progress
 * @access  Private
 */
export const removeMeal = asyncHandler(async (req, res) => {
  const { mealLogId } = req.params;
  
  const progress = await Progress.getTodayProgress(req.user.id);
  
  const mealIndex = progress.meals.findIndex(m => m._id.toString() === mealLogId);
  
  if (mealIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Meal not found in today\'s log'
    });
  }
  
  const removedMeal = progress.meals[mealIndex];
  
  // Update nutrition totals
  progress.nutrition.calories -= removedMeal.calories * removedMeal.servings;
  progress.nutrition.protein -= removedMeal.protein * removedMeal.servings;
  progress.nutrition.carbohydrates -= removedMeal.carbohydrates * removedMeal.servings;
  progress.nutrition.fats -= removedMeal.fats * removedMeal.servings;
  
  // Remove meal
  progress.meals.splice(mealIndex, 1);
  await progress.save();
  
  res.status(200).json({
    success: true,
    message: 'Meal removed successfully',
    data: {
      progress
    }
  });
});

/**
 * Helper function to calculate summary statistics
 */
const calculateSummary = (progressData) => {
  if (progressData.length === 0) {
    return {
      totalDays: 0,
      averageCalories: 0,
      averageCompliance: 0
    };
  }
  
  const totalCalories = progressData.reduce((sum, day) => sum + day.nutrition.calories, 0);
  const totalCompliance = progressData.reduce((sum, day) => sum + day.compliance.calorieCompliance, 0);
  
  return {
    totalDays: progressData.length,
    averageCalories: Math.round(totalCalories / progressData.length),
    averageCompliance: Math.round(totalCompliance / progressData.length)
  };
};

/**
 * @route   POST /api/progress/log-water
 * @desc    Log water intake for today
 * @access  Private
 */
export const logWater = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid water amount is required'
    });
  }
  
  const user = await User.findById(req.user.id);
  
  const progress = await Progress.getTodayProgress(req.user.id, {
    calories: user.dailyCalorieTarget,
    protein: user.macronutrients.protein,
    carbohydrates: user.macronutrients.carbs,
    fats: user.macronutrients.fats
  });
  
  progress.waterIntake = (progress.waterIntake || 0) + amount;
  await progress.save();
  
  res.status(200).json({
    success: true,
    message: 'Water logged successfully',
    data: {
      waterIntake: progress.waterIntake,
      waterGoal: user.waterGoal
    }
  });
});

/**
 * @route   POST /api/progress/log-weight
 * @desc    Log weight for today
 * @access  Private
 */
export const logWeight = asyncHandler(async (req, res) => {
  const { weight } = req.body;
  
  if (!weight || weight <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid weight is required'
    });
  }
  
  const user = await User.findById(req.user.id);
  
  const progress = await Progress.getTodayProgress(req.user.id, {
    calories: user.dailyCalorieTarget,
    protein: user.macronutrients.protein,
    carbohydrates: user.macronutrients.carbs,
    fats: user.macronutrients.fats
  });
  
  progress.weight = weight;
  progress.weightHistory.push({ weight, timestamp: new Date() });
  
  // Update user's current weight
  user.weight = weight;
  await Promise.all([progress.save(), user.save()]);
  
  res.status(200).json({
    success: true,
    message: 'Weight logged successfully',
    data: {
      weight: progress.weight,
      initialWeight: user.initialWeight || user.weight
    }
  });
});

/**
 * @route   GET /api/progress/weight-history
 * @desc    Get weight history over time
 * @access  Private
 */
export const getWeightHistory = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const progressData = await Progress.find({
    user: req.user.id,
    date: { $gte: startDate },
    weight: { $exists: true, $ne: null }
  })
    .select('date weight')
    .sort({ date: 1 });
  
  res.status(200).json({
    success: true,
    data: {
      history: progressData
    }
  });
});

/**
 * @route   GET /api/progress/weekly-summary
 * @desc    Get weekly summary with charts data
 * @access  Private
 */
export const getWeeklySummary = asyncHandler(async (req, res) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  const progressData = await Progress.find({
    user: req.user.id,
    date: { $gte: startDate, $lte: endDate }
  })
    .select('date nutrition waterIntake weight exercises')
    .sort({ date: 1 });
  
  const user = await User.findById(req.user.id);
  
  // Calculate totals and averages
  const totals = progressData.reduce((acc, day) => ({
    calories: acc.calories + day.nutrition.calories,
    protein: acc.protein + day.nutrition.protein,
    carbohydrates: acc.carbohydrates + day.nutrition.carbohydrates,
    fats: acc.fats + day.nutrition.fats,
    water: acc.water + (day.waterIntake || 0),
    exercises: acc.exercises + (day.exercises?.length || 0)
  }), { calories: 0, protein: 0, carbohydrates: 0, fats: 0, water: 0, exercises: 0 });
  
  const avgCalories = progressData.length > 0 ? Math.round(totals.calories / progressData.length) : 0;
  const avgWater = progressData.length > 0 ? Math.round(totals.water / progressData.length) : 0;
  
  // Calculate streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i <= 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    
    const hasProgress = progressData.some(p => {
      const pDate = new Date(p.date);
      pDate.setHours(0, 0, 0, 0);
      return pDate.getTime() === checkDate.getTime() && p.nutrition.calories > 0;
    });
    
    if (hasProgress) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      days: progressData,
      summary: {
        totalCalories: totals.calories,
        avgCalories,
        avgWater,
        totalExercises: totals.exercises,
        daysTracked: progressData.length,
        currentStreak
      },
      goals: {
        calories: user.dailyCalorieTarget,
        water: user.waterGoal,
        protein: user.macronutrients.protein,
        carbs: user.macronutrients.carbs,
        fats: user.macronutrients.fats
      }
    }
  });
});
