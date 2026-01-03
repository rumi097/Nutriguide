/**
 * User Controller
 * Handles user profile management and health data updates
 */

import User from '../models/User.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import axios from 'axios';

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    age,
    height,
    weight,
    activityLevel,
    fitnessGoal,
    dietaryPreferences,
    allergies,
    targetWeight
  } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Update fields
  if (name) user.name = name;
  if (age) user.age = age;
  if (height) user.height = height;
  if (weight) user.weight = weight;
  if (activityLevel) user.activityLevel = activityLevel;
  if (fitnessGoal) user.fitnessGoal = fitnessGoal;
  if (dietaryPreferences) user.dietaryPreferences = dietaryPreferences;
  if (allergies) user.allergies = allergies;
  if (targetWeight) user.targetWeight = targetWeight;
  
  // Recalculate nutrition targets if relevant fields changed
  const needsRecalculation = age || height || weight || activityLevel || fitnessGoal;
  
  if (needsRecalculation) {
    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activity_level: user.activityLevel,
        fitness_goal: user.fitnessGoal
      });
      
      if (mlResponse.data.success) {
        user.dailyCalorieTarget = mlResponse.data.daily_calories;
        user.macronutrients = mlResponse.data.macronutrients;
      }
    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
    }
  }
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

/**
 * @route   GET /api/users/dashboard
 * @desc    Get user dashboard data with health insights
 * @access  Private
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  // Calculate health insights
  const bmiCategory = getBMICategory(user.bmi);
  const weightStatus = getWeightStatus(user.weight, user.targetWeight, user.fitnessGoal);
  
  // Get activity multiplier description
  const activityDescription = {
    sedentary: 'Little or no exercise',
    light: 'Light exercise 1-3 days/week',
    moderate: 'Moderate exercise 3-5 days/week',
    active: 'Heavy exercise 6-7 days/week',
    very_active: 'Very heavy exercise, physical job'
  };
  
  res.status(200).json({
    success: true,
    data: {
      profile: {
        name: user.name,
        age: user.age,
        gender: user.gender,
        email: user.email
      },
      health: {
        weight: user.weight,
        height: user.height,
        bmi: user.bmi,
        bmiCategory,
        targetWeight: user.targetWeight
      },
      activity: {
        level: user.activityLevel,
        description: activityDescription[user.activityLevel]
      },
      goals: {
        fitnessGoal: user.fitnessGoal,
        dailyCalories: user.dailyCalorieTarget,
        macronutrients: user.macronutrients
      },
      preferences: {
        dietary: user.dietaryPreferences,
        allergies: user.allergies
      },
      insights: {
        weightStatus,
        recommendation: getRecommendation(user.fitnessGoal, bmiCategory)
      }
    }
  });
});

/**
 * Helper function to categorize BMI
 */
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'blue' };
  if (bmi < 25) return { category: 'Normal weight', color: 'green' };
  if (bmi < 30) return { category: 'Overweight', color: 'yellow' };
  return { category: 'Obese', color: 'red' };
};

/**
 * Helper function to get weight status
 */
const getWeightStatus = (currentWeight, targetWeight, goal) => {
  if (!targetWeight) return 'No target set';
  
  const difference = currentWeight - targetWeight;
  
  if (Math.abs(difference) < 2) {
    return 'You are at your target weight!';
  }
  
  if (goal === 'lose_weight' && difference > 0) {
    return `${difference.toFixed(1)} kg to lose`;
  }
  
  if (goal === 'gain_weight' && difference < 0) {
    return `${Math.abs(difference).toFixed(1)} kg to gain`;
  }
  
  return 'On track';
};

/**
 * Helper function to get personalized recommendation
 */
const getRecommendation = (goal, bmiCategory) => {
  const recommendations = {
    lose_weight: 'Focus on a calorie deficit with balanced nutrition and regular exercise.',
    maintain_weight: 'Continue your current routine and maintain your calorie balance.',
    gain_weight: 'Increase calorie intake with protein-rich foods and strength training.',
    build_muscle: 'High protein intake with progressive resistance training is key.',
    improve_health: 'Focus on whole foods, regular exercise, and adequate sleep.'
  };
  
  return recommendations[goal] || 'Follow a balanced diet and stay active.';
};

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  
  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});
