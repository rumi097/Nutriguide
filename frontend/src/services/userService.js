/**
 * User API Service
 * Handles user profile and dashboard API calls
 */

import api from '../utils/api'

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData)
    return response.data
  },

  /**
   * Get dashboard data
   */
  getDashboard: async () => {
    const response = await api.get('/users/dashboard')
    return response.data
  },

  /**
   * Delete user account
   */
  deleteAccount: async () => {
    const response = await api.delete('/users/account')
    return response.data
  },
}

export default userService
