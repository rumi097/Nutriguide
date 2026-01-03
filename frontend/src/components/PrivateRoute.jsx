/**
 * Private Route Component
 * Protects routes that require authentication
 */

import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
