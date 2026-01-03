/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import axios from 'axios';

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    gender,
    height,
    weight,
    activityLevel,
    fitnessGoal,
    dietaryPreferences,
    allergies,
    targetWeight
  } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    age,
    gender,
    height,
    weight,
    activityLevel,
    fitnessGoal,
    dietaryPreferences: dietaryPreferences || ['none'],
    allergies: allergies || [],
    targetWeight
  });
  
  // Calculate nutrition targets using ML service
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
      await user.save();
    }
  } catch (mlError) {
    console.error('ML Service Error:', mlError.message);
    // Continue without ML predictions (will use fallback calculation)
  }
  
  // Generate token
  const token = generateToken(user._id);
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        bmi: user.bmi,
        dailyCalorieTarget: user.dailyCalorieTarget,
        macronutrients: user.macronutrients
      },
      token
    }
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Get user with password field
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Check if user is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }
  
  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Generate token
  const token = generateToken(user._id);
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  // Remove password from response
  user.password = undefined;
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        bmi: user.bmi,
        dailyCalorieTarget: user.dailyCalorieTarget,
        macronutrients: user.macronutrients,
        fitnessGoal: user.fitnessGoal
      },
      token
    }
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});
