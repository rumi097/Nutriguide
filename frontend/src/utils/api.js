/**
 * API Client
 * Centralized Axios configuration for API calls
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with proper API URL handling
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      if (status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('token')
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
      } else if (status === 403) {
        toast.error('Access denied')
      } else if (status === 404) {
        toast.error('Resource not found')
      } else if (status === 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error(data.message || 'An error occurred')
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

export default api
