/**
 * Admin Controller
 * Handles administrative functions for managing users and meals
 */

import User from '../models/User.model.js';
import Meal from '../models/Meal.model.js';
import Progress from '../models/Progress.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    query.role = role;
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await User.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details by ID
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (admin can change role, active status)
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  if (role) user.role = role;
  if (typeof isActive !== 'undefined') user.isActive = isActive;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user
    }
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }
  
  await User.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalUsers = await User.countDocuments();
  const totalMeals = await Meal.countDocuments({ isActive: true });
  const activeUsers = await User.countDocuments({ isActive: true });
  
  // Get recent users
  const recentUsers = await User.find()
    .select('name email createdAt')
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Get user distribution by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get meal distribution by category
  const mealsByCategory = await Meal.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get fitness goal distribution
  const goalDistribution = await User.aggregate([
    {
      $group: {
        _id: '$fitnessGoal',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        activeUsers,
        totalMeals,
        inactiveUsers: totalUsers - activeUsers
      },
      recentUsers,
      distributions: {
        usersByRole,
        mealsByCategory,
        goalDistribution
      }
    }
  });
});

/**
 * @route   POST /api/admin/meals/bulk
 * @desc    Bulk create meals (for importing datasets)
 * @access  Private/Admin
 */
export const bulkCreateMeals = asyncHandler(async (req, res) => {
  const { meals } = req.body;
  
  if (!Array.isArray(meals) || meals.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of meals'
    });
  }
  
  const createdMeals = await Meal.insertMany(meals);
  
  res.status(201).json({
    success: true,
    message: `${createdMeals.length} meals created successfully`,
    data: {
      count: createdMeals.length
    }
  });
});

/**
 * @route   GET /api/admin/analytics
 * @desc    Get system-wide analytics
 * @access  Private/Admin
 */
export const getSystemAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  // User registrations over time
  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Progress entries over time
  const progressActivity = await Progress.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        activeUsers: { $addToSet: '$user' },
        totalMealsLogged: { $sum: { $size: '$meals' } }
      }
    },
    {
      $project: {
        _id: 1,
        activeUsers: { $size: '$activeUsers' },
        totalMealsLogged: 1
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      userRegistrations,
      progressActivity
    }
  });
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private/Admin
 */
export const getAdminStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [
    totalUsers,
    activeUsers,
    totalMeals,
    todayProgress
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Meal.countDocuments(),
    Progress.find({ date: { $gte: today } })
  ]);
  
  const totalCaloriesToday = todayProgress.reduce(
    (sum, p) => sum + p.nutrition.calories, 
    0
  );
  const avgCaloriesLogged = todayProgress.length > 0 
    ? Math.round(totalCaloriesToday / todayProgress.length) 
    : 0;
  
  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalMeals,
      totalProgress: todayProgress.length,
      avgCaloriesLogged,
      adminUsers: await User.countDocuments({ role: 'admin' })
    }
  });
});
