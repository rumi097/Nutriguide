/**
 * Progress API Service
 * Handles progress tracking and analytics
 */

import api from '../utils/api'

export const progressService = {
  /**
   * Get today's progress
   */
  getTodayProgress: async () => {
    const response = await api.get('/progress/today')
    return response.data
  },

  /**
   * Log a meal
   */
  logMeal: async (mealData) => {
    const response = await api.post('/progress/log-meal', mealData)
    return response.data
  },

  /**
   * Update weight
   */
  updateWeight: async (weight) => {
    const response = await api.put('/progress/update-weight', { weight })
    return response.data
  },

  /**
   * Get progress history
   */
  getHistory: async (params) => {
    const response = await api.get('/progress/history', { params })
    return response.data
  },

  /**
   * Get analytics
   */
  getAnalytics: async (params) => {
    const response = await api.get('/progress/analytics', { params })
    return response.data
  },

  /**
   * Remove a logged meal
   */
  removeMeal: async (mealLogId) => {
    const response = await api.delete(`/progress/meal/${mealLogId}`)
    return response.data
  },
}

export default progressService
