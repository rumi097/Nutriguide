/**
 * Authentication Store
 * Global state management for user authentication using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
        // Store token in localStorage for API calls
        if (token) {
          localStorage.setItem('token', token)
        }
      },

      setUser: (user) => {
        set({ user })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        localStorage.removeItem('token')
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      // Helper to check if user is admin
      isAdmin: () => {
        const { user } = get()
        return user?.role === 'admin'
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
