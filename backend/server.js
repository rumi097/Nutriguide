/**
 * NutriGuide AI - Backend Server
 * Main entry point for the Express.js backend server
 * Handles API routing, middleware configuration, and database connection
 */

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import nutritionRoutes from './routes/nutrition.routes.js';
import mealRoutes from './routes/meal.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Import error handler
import { errorHandler } from './middleware/error.middleware.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5002;

const normalizeUrl = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim().replace(/\/+$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
};

// ======================
// Middleware Configuration
// ======================

// Security middleware - sets various HTTP headers for security
app.use(helmet());

// CORS configuration - allow frontend to communicate with backend
const allowedOrigins = [
  normalizeUrl(process.env.FRONTEND_URL),
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsers - parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware - log HTTP requests in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ======================
// Database Connection
// ======================

/**
 * Connect to MongoDB database
 * Uses mongoose for ODM (Object Document Mapping)
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// ======================
// API Routes
// ======================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NutriGuide AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes - register, login, logout
app.use('/api/auth', authRoutes);

// User routes - profile management, health data
app.use('/api/users', userRoutes);

// Nutrition routes - get personalized nutrition recommendations
app.use('/api/nutrition', nutritionRoutes);

// Meal routes - meal planning, recipes, food database
app.use('/api/meals', mealRoutes);

// Progress routes - track weight, calories, achievements
app.use('/api/progress', progressRoutes);

// Admin routes - manage food database, users
app.use('/api/admin', adminRoutes);

// 404 handler - catch undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware - centralized error handler
app.use(errorHandler);

// ======================
// Start Server
// ======================

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server and exit process
  process.exit(1);
});
