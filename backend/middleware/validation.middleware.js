/**
 * Validation Middleware
 * Input validation for API requests using express-validator
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 * Returns errors if validation fails
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// ======================
// Authentication Validation Rules
// ======================

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 10, max: 120 }).withMessage('Age must be between 10 and 120'),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  
  body('height')
    .notEmpty().withMessage('Height is required')
    .isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300 cm'),
  
  body('weight')
    .notEmpty().withMessage('Weight is required')
    .isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
  
  body('activityLevel')
    .notEmpty().withMessage('Activity level is required')
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']).withMessage('Invalid activity level'),
  
  body('fitnessGoal')
    .notEmpty().withMessage('Fitness goal is required')
    .isIn(['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_health']).withMessage('Invalid fitness goal'),
  
  validate
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// ======================
// User Profile Validation Rules
// ======================

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  body('age')
    .optional()
    .isInt({ min: 10, max: 120 }).withMessage('Age must be between 10 and 120'),
  
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50 and 300 cm'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
  
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']).withMessage('Invalid activity level'),
  
  body('fitnessGoal')
    .optional()
    .isIn(['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_health']).withMessage('Invalid fitness goal'),
  
  body('dietaryPreferences')
    .optional()
    .isArray().withMessage('Dietary preferences must be an array'),
  
  body('allergies')
    .optional()
    .isArray().withMessage('Allergies must be an array'),
  
  validate
];

// ======================
// Meal Validation Rules
// ======================

export const createMealValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Meal name is required')
    .isLength({ min: 2 }).withMessage('Meal name must be at least 2 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'beverage', 'dessert']).withMessage('Invalid category'),
  
  body('nutrition.calories')
    .notEmpty().withMessage('Calories are required')
    .isFloat({ min: 0 }).withMessage('Calories must be a positive number'),
  
  body('nutrition.protein')
    .notEmpty().withMessage('Protein is required')
    .isFloat({ min: 0 }).withMessage('Protein must be a positive number'),
  
  body('nutrition.carbohydrates')
    .notEmpty().withMessage('Carbohydrates are required')
    .isFloat({ min: 0 }).withMessage('Carbohydrates must be a positive number'),
  
  body('nutrition.fats')
    .notEmpty().withMessage('Fats are required')
    .isFloat({ min: 0 }).withMessage('Fats must be a positive number'),
  
  validate
];

// ======================
// Progress Validation Rules
// ======================

export const logMealValidation = [
  body('mealId')
    .optional()
    .isMongoId().withMessage('Invalid meal ID'),
  
  body('mealName')
    .notEmpty().withMessage('Meal name is required'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'beverage', 'dessert']).withMessage('Invalid category'),
  
  body('servings')
    .optional()
    .isFloat({ min: 0.1 }).withMessage('Servings must be at least 0.1'),
  
  body('calories')
    .notEmpty().withMessage('Calories are required')
    .isFloat({ min: 0 }).withMessage('Calories must be positive'),
  
  validate
];

export const updateWeightValidation = [
  body('weight')
    .notEmpty().withMessage('Weight is required')
    .isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
  
  validate
];

// ======================
// Query Validation Rules
// ======================

export const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
  
  validate
];
