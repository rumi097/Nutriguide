/**
 * Meal Model Schema
 * Defines the structure for meal/food items in the nutrition database
 * Used for meal recommendations and tracking
 */

import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  // ======================
  // Basic Information
  // ======================
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage', 'dessert'],
    index: true
  },
  cuisine: {
    type: String,
    default: 'other'
  },
  
  // ======================
  // Nutritional Information (per serving)
  // ======================
  nutrition: {
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      required: [true, 'Protein is required'],
      min: [0, 'Protein cannot be negative']
    },
    carbohydrates: {
      type: Number,
      required: [true, 'Carbohydrates are required'],
      min: [0, 'Carbohydrates cannot be negative']
    },
    fats: {
      type: Number,
      required: [true, 'Fats are required'],
      min: [0, 'Fats cannot be negative']
    },
    fiber: {
      type: Number,
      default: 0,
      min: [0, 'Fiber cannot be negative']
    },
    sugar: {
      type: Number,
      default: 0,
      min: [0, 'Sugar cannot be negative']
    },
    sodium: {
      type: Number,
      default: 0,
      min: [0, 'Sodium cannot be negative']
    }
  },
  
  // ======================
  // Serving Information
  // ======================
  servingSize: {
    type: String,
    default: '1 serving'
  },
  servingUnit: {
    type: String,
    default: 'serving'
  },
  
  // ======================
  // Dietary Tags
  // ======================
  dietaryTags: {
    type: [String],
    default: []
  },
  
  // ======================
  // Allergen Information
  // ======================
  allergens: {
    type: [String],
    default: []
  },
  
  // ======================
  // Recipe Information (Optional)
  // ======================
  ingredients: [{
    name: String,
    quantity: String,
    unit: String
  }],
  instructions: {
    type: [String],
    default: []
  },
  prepTime: {
    type: Number, // in minutes
    min: [0, 'Prep time cannot be negative']
  },
  cookTime: {
    type: Number, // in minutes
    min: [0, 'Cook time cannot be negative']
  },
  
  // ======================
  // Media
  // ======================
  imageUrl: {
    type: String,
    default: ''
  },
  
  // ======================
  // Popularity & Rating
  // ======================
  popularity: {
    type: Number,
    default: 0,
    min: [0, 'Popularity cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  // ======================
  // System Fields
  // ======================
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'database'
  }
}, {
  timestamps: true
});

// ======================
// Indexes for Performance
// ======================
mealSchema.index({ name: 'text', description: 'text' });
mealSchema.index({ category: 1, 'nutrition.calories': 1 });
mealSchema.index({ dietaryTags: 1 });
mealSchema.index({ popularity: -1 });

// ======================
// Instance Methods
// ======================

/**
 * Check if meal is suitable for given dietary preferences
 * @param {Array<string>} preferences - User's dietary preferences
 * @returns {boolean} - True if meal matches preferences
 */
mealSchema.methods.matchesDietaryPreferences = function(preferences) {
  if (!preferences || preferences.length === 0 || preferences.includes('none')) {
    return true;
  }
  return preferences.some(pref => this.dietaryTags.includes(pref));
};

/**
 * Check if meal contains any allergens
 * @param {Array<string>} userAllergens - User's allergens
 * @returns {boolean} - True if meal is safe (no allergen match)
 */
mealSchema.methods.isSafeForAllergens = function(userAllergens) {
  if (!userAllergens || userAllergens.length === 0) {
    return true;
  }
  return !this.allergens.some(allergen => userAllergens.includes(allergen));
};

// ======================
// Static Methods
// ======================

/**
 * Find meals suitable for user profile
 * @param {object} userProfile - User's dietary profile
 * @param {number} calorieTarget - Target calories for the meal
 * @param {number} tolerance - Calorie tolerance (±)
 * @returns {Promise<Array>} - Array of suitable meals
 */
mealSchema.statics.findSuitableMeals = async function(userProfile, calorieTarget, tolerance = 100) {
  const query = {
    isActive: true,
    'nutrition.calories': {
      $gte: calorieTarget - tolerance,
      $lte: calorieTarget + tolerance
    }
  };
  
  // Filter by dietary preferences
  if (userProfile.dietaryPreferences && userProfile.dietaryPreferences.length > 0 && !userProfile.dietaryPreferences.includes('none')) {
    query.dietaryTags = { $in: userProfile.dietaryPreferences };
  }
  
  // Exclude allergens
  if (userProfile.allergies && userProfile.allergies.length > 0) {
    query.allergens = { $nin: userProfile.allergies };
  }
  
  return this.find(query).sort({ popularity: -1 }).limit(20);
};

// ======================
// Export Model
// ======================

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;
