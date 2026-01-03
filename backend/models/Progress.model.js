/**
 * Progress Model Schema
 * Tracks user's daily nutrition intake, weight changes, and achievements
 * Used for progress visualization and analytics
 */

import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  // ======================
  // User Reference
  // ======================
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  
  // ======================
  // Date Tracking
  // ======================
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  
  // ======================
  // Daily Metrics
  // ======================
  weight: {
    type: Number,
    min: [20, 'Weight must be at least 20 kg']
  },
  
  waterIntake: {
    type: Number,
    default: 0,
    min: [0, 'Water intake cannot be negative']
  },
  
  // Track weight changes throughout the day
  weightHistory: [{
    weight: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ======================
  // Nutrition Intake
  // ======================
  nutrition: {
    calories: {
      type: Number,
      default: 0,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative']
    },
    carbohydrates: {
      type: Number,
      default: 0,
      min: [0, 'Carbohydrates cannot be negative']
    },
    fats: {
      type: Number,
      default: 0,
      min: [0, 'Fats cannot be negative']
    },
    fiber: {
      type: Number,
      default: 0,
      min: [0, 'Fiber cannot be negative']
    },
    water: {
      type: Number,
      default: 0,
      min: [0, 'Water intake cannot be negative']
    }
  },
  
  // ======================
  // Meals Consumed
  // ======================
  meals: [{
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    },
    mealName: {
      type: String,
      required: [true, 'Meal name is required'],
      default: 'Unnamed Meal'
    },
    category: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage', 'dessert'],
      default: 'snack'
    },
    servings: {
      type: Number,
      default: 1,
      min: [0.1, 'Servings must be at least 0.1']
    },
    calories: {
      type: Number,
      default: 0
    },
    protein: {
      type: Number,
      default: 0
    },
    carbohydrates: {
      type: Number,
      default: 0
    },
    fats: {
      type: Number,
      default: 0
    },
    consumedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ======================
  // Activity & Exercise
  // ======================
  exercise: {
    duration: {
      type: Number, // in minutes
      default: 0,
      min: [0, 'Duration cannot be negative']
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: [0, 'Calories burned cannot be negative']
    },
    activities: [{
      name: String,
      duration: Number,
      calories: Number
    }]
  },
  
  // ======================
  // Target vs Actual
  // ======================
  targets: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fats: Number
  },
  
  // ======================
  // Compliance & Achievements
  // ======================
  compliance: {
    calorieCompliance: {
      type: Number, // percentage
      default: 0
    },
    macroCompliance: {
      type: Number, // percentage
      default: 0
    }
  },
  
  // ======================
  // Notes & Observations
  // ======================
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'tired', 'stressed']
  },
  energyLevel: {
    type: Number,
    min: [1, 'Energy level must be between 1 and 10'],
    max: [10, 'Energy level must be between 1 and 10']
  }
}, {
  timestamps: true
});

// ======================
// Indexes for Performance
// ======================
progressSchema.index({ user: 1, date: -1 });
progressSchema.index({ user: 1, createdAt: -1 });

// ======================
// Pre-save Middleware
// ======================

/**
 * Calculate compliance percentages before saving
 */
progressSchema.pre('save', function(next) {
  if (this.targets && this.targets.calories > 0) {
    // Calculate calorie compliance
    const calorieRatio = this.nutrition.calories / this.targets.calories;
    this.compliance.calorieCompliance = Math.min(100, Math.max(0, 100 - Math.abs(100 - calorieRatio * 100)));
    
    // Calculate macro compliance (average of protein, carbs, fats)
    const proteinCompliance = this.targets.protein > 0 
      ? Math.min(100, (this.nutrition.protein / this.targets.protein) * 100) 
      : 100;
    const carbCompliance = this.targets.carbohydrates > 0 
      ? Math.min(100, (this.nutrition.carbohydrates / this.targets.carbohydrates) * 100) 
      : 100;
    const fatCompliance = this.targets.fats > 0 
      ? Math.min(100, (this.nutrition.fats / this.targets.fats) * 100) 
      : 100;
    
    this.compliance.macroCompliance = (proteinCompliance + carbCompliance + fatCompliance) / 3;
  }
  next();
});

// ======================
// Instance Methods
// ======================

/**
 * Add a meal to daily intake
 * @param {object} mealData - Meal information
 */
progressSchema.methods.addMeal = function(mealData) {
  this.meals.push(mealData);
  
  // Update daily nutrition totals
  this.nutrition.calories += mealData.calories * mealData.servings;
  this.nutrition.protein += mealData.protein * mealData.servings;
  this.nutrition.carbohydrates += mealData.carbohydrates * mealData.servings;
  this.nutrition.fats += mealData.fats * mealData.servings;
};

/**
 * Get daily summary
 * @returns {object} - Summary of the day
 */
progressSchema.methods.getDailySummary = function() {
  return {
    date: this.date,
    weight: this.weight,
    nutrition: this.nutrition,
    mealsCount: this.meals.length,
    compliance: this.compliance,
    netCalories: this.nutrition.calories - (this.exercise.caloriesBurned || 0)
  };
};

// ======================
// Static Methods
// ======================

/**
 * Get progress data for a date range
 * @param {string} userId - User's ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Progress entries
 */
progressSchema.statics.getProgressRange = async function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

/**
 * Get or create progress entry for today
 * @param {string} userId - User's ID
 * @param {object} targets - Daily targets
 * @returns {Promise<object>} - Progress entry
 */
progressSchema.statics.getTodayProgress = async function(userId, targets = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let progress = await this.findOne({
    user: userId,
    date: today
  });
  
  if (!progress) {
    progress = await this.create({
      user: userId,
      date: today,
      targets: targets
    });
  }
  
  return progress;
};

// ======================
// Export Model
// ======================

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
