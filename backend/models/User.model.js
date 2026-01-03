/**
 * User Model Schema
 * Defines the structure for user documents in MongoDB
 * Includes authentication, personal info, health data, and preferences
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // ======================
  // Authentication Fields
  // ======================
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // ======================
  // Personal Information
  // ======================
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [10, 'Age must be at least 10'],
    max: [120, 'Age must be less than 120']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  
  // ======================
  // Health Metrics
  // ======================
  height: {
    type: Number, // in centimeters
    required: [true, 'Height is required'],
    min: [50, 'Height must be at least 50 cm']
  },
  weight: {
    type: Number, // in kilograms
    required: [true, 'Weight is required'],
    min: [20, 'Weight must be at least 20 kg']
  },
  activityLevel: {
    type: String,
    required: [true, 'Activity level is required'],
    enum: {
      values: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      message: 'Activity level must be sedentary, light, moderate, active, or very_active'
    },
    default: 'moderate'
  },
  
  // ======================
  // Dietary Preferences
  // ======================
  dietaryPreferences: {
    type: [String],
    enum: ['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'low_carb', 'high_protein', 'none'],
    default: ['none']
  },
  
  waterGoal: {
    type: Number,
    default: 2000,
    min: [500, 'Water goal must be at least 500ml']
  },
  
  initialWeight: {
    type: Number,
    min: [20, 'Initial weight must be at least 20 kg']
  },
  
  allergies: {
    type: [String],
    default: []
  },
  
  // ======================
  // Fitness Goals
  // ======================
  fitnessGoal: {
    type: String,
    required: [true, 'Fitness goal is required'],
    enum: {
      values: ['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_health'],
      message: 'Invalid fitness goal'
    }
  },
  targetWeight: {
    type: Number, // in kilograms
    min: [20, 'Target weight must be at least 20 kg']
  },
  
  // ======================
  // Exercise Preferences
  // ======================
  exercisePreferences: {
    type: [String],
    enum: ['cardio', 'strength', 'yoga', 'pilates', 'cycling', 'swimming', 'running', 'walking', 'sports', 'dance'],
    default: []
  },
  exerciseDuration: {
    type: Number, // in minutes per day
    default: 30,
    min: [0, 'Exercise duration cannot be negative']
  },
  exerciseFrequency: {
    type: Number, // days per week
    default: 3,
    min: [0, 'Exercise frequency cannot be negative'],
    max: [7, 'Exercise frequency cannot exceed 7 days']
  },
  
  // ======================
  // Calculated Metrics
  // ======================
  bmi: {
    type: Number,
    default: 0
  },
  dailyCalorieTarget: {
    type: Number,
    default: 0
  },
  macronutrients: {
    protein: { type: Number, default: 0 }, // in grams
    carbs: { type: Number, default: 0 },   // in grams
    fats: { type: Number, default: 0 }     // in grams
  },
  
  // ======================
  // System Fields
  // ======================
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// ======================
// Indexes for Performance
// ======================
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ======================
// Pre-save Middleware
// ======================

/**
 * Hash password before saving to database
 * Only hash if password is modified
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Calculate BMI before saving
 * BMI = weight (kg) / (height (m))^2
 */
userSchema.pre('save', function(next) {
  if (this.isModified('height') || this.isModified('weight')) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(2));
  }
  next();
});

/**
 * Check if profile is complete
 */
userSchema.pre('save', function(next) {
  const requiredFields = ['name', 'email', 'age', 'gender', 'height', 'weight', 'activityLevel', 'fitnessGoal'];
  this.profileComplete = requiredFields.every(field => this[field]);
  next();
});

// ======================
// Instance Methods
// ======================

/**
 * Compare entered password with hashed password in database
 * @param {string} enteredPassword - Plain text password from login
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Get user object without sensitive information
 * @returns {object} - User object safe for sending to client
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// ======================
// Export Model
// ======================

const User = mongoose.model('User', userSchema);

export default User;
