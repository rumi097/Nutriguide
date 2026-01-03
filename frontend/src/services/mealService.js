/**
 * Meal API Service
 * Handles meal database operations
 */

import api from '../utils/api'

export const mealService = {
  /**
   * Get all meals with filtering
   */
  getMeals: async (params) => {
    const response = await api.get('/meals', { params })
    return response.data
  },

  /**
   * Get meal by ID
   */
  getMealById: async (id) => {
    const response = await api.get(`/meals/${id}`)
    return response.data
  },

  /**
   * Get meal recommendations
   */
  getRecommendations: async (params) => {
    const response = await api.get('/meals/search/recommendations', { params })
    return response.data
  },

  /**
   * Get category summary
   */
  getCategorySummary: async () => {
    const response = await api.get('/meals/categories/summary')
    return response.data
  },

  /**
   * Create meal (Admin only)
   */
  createMeal: async (mealData) => {
    const response = await api.post('/meals', mealData)
    return response.data
  },

  /**
   * Update meal (Admin only)
   */
  updateMeal: async (id, mealData) => {
    const response = await api.put(`/meals/${id}`, mealData)
    return response.data
  },

  /**
   * Delete meal (Admin only)
   */
  deleteMeal: async (id) => {
    const response = await api.delete(`/meals/${id}`)
    return response.data
  },
}

export default mealService
