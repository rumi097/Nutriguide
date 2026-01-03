/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens and checking user authorization
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/**
 * Verify JWT token and attach user to request
 * Usage: Add as middleware to protected routes
 */
export const protect = async (req, res, next) => {
  let token;
  
  try {
    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (exclude password)
    req.user = await User.findById(decoded.id).select('-password');
    
    // Check if user still exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }
    
    // Check if user is active
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Role-based authorization middleware
 * Restricts access to specific user roles
 * Usage: protect, authorize('admin'), routeHandler
 * 
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'user')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user role is included in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require authentication
 * Useful for routes that have different behavior for authenticated users
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (error) {
    // Silently fail - user just won't be attached
    console.log('Optional auth failed:', error.message);
  }
  
  next();
};
