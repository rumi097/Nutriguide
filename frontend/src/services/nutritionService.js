/**
 * Nutrition API Service
 * Handles nutrition recommendations and meal planning
 */

import api from '../utils/api'

export const nutritionService = {
  /**
   * Get personalized nutrition recommendations
   */
  getRecommendations: async () => {
    const response = await api.get('/nutrition/recommendations')
    return response.data
  },

  /**
   * Generate daily meal plan
   */
  generateMealPlan: async (data) => {
    const response = await api.post('/nutrition/meal-plan', data)
    return response.data
  },

  /**
   * Calculate nutrition needs
   */
  calculateNutrition: async (params) => {
    const response = await api.get('/nutrition/calculate', { params })
    return response.data
  },
}

export default nutritionService
