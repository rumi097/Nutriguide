import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { 
  Users, 
  Utensils, 
  Activity, 
  TrendingUp, 
  Search,
  Edit2,
  Trash2,
  Shield,
  ShieldOff,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [meals, setMeals] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchAdminData()
  }, [])
  
  const fetchAdminData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:5002/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      
      // Fetch users
      const usersRes = await fetch('http://localhost:5002/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const usersData = await usersRes.json()
      
      // Fetch meals
      const mealsRes = await fetch('http://localhost:5002/api/admin/meals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const mealsData = await mealsRes.json()
      
      if (statsData.success) setStats(statsData.data)
      if (usersData.success) setUsers(usersData.data.users)
      if (mealsData.success) setMeals(mealsData.data.meals)
    } catch (error) {
      console.error('Admin data fetch error:', error)
      toast.error('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5002/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchAdminData()
      }
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }
  
  const handleDeleteMeal = async (mealId) => {
    if (!confirm('Are you sure you want to delete this meal?')) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5002/api/admin/meals/${mealId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Meal deleted successfully')
        fetchAdminData()
      }
    } catch (error) {
      toast.error('Failed to delete meal')
    }
  }
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">Admin Dashboard</h1>
              <p className="text-blue-100">Manage users, meals, and monitor system analytics</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-16 h-16 text-white opacity-50" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-black text-blue-900">{stats.totalUsers}</span>
              </div>
              <p className="text-blue-700 font-semibold">Total Users</p>
              <p className="text-xs text-blue-600 mt-1">{stats.activeUsers} active</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Utensils className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-black text-purple-900">{stats.totalMeals}</span>
              </div>
              <p className="text-purple-700 font-semibold">Total Meals</p>
              <p className="text-xs text-purple-600 mt-1">in database</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-black text-green-900">{stats.totalProgress}</span>
              </div>
              <p className="text-green-700 font-semibold">Progress Entries</p>
              <p className="text-xs text-green-600 mt-1">logged today</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <span className="text-3xl font-black text-orange-900">{stats.avgCaloriesLogged}</span>
              </div>
              <p className="text-orange-700 font-semibold">Avg Calories</p>
              <p className="text-xs text-orange-600 mt-1">per user today</p>
            </motion.div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="bg-white rounded-xl p-2 shadow-lg border-2 border-gray-200">
          <div className="flex gap-2">
            {['overview', 'users', 'meals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 rounded-lg font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900">System Overview</h2>
              
              {stats && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      User Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Registered:</span>
                        <span className="font-bold text-gray-900">{stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Active Users:</span>
                        <span className="font-bold text-green-600">{stats.activeUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Admin Users:</span>
                        <span className="font-bold text-purple-600">{stats.adminUsers || 1}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Activity Today
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Meals Logged:</span>
                        <span className="font-bold text-gray-900">{stats.totalProgress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Avg Calories:</span>
                        <span className="font-bold text-green-600">{stats.avgCaloriesLogged}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Active Sessions:</span>
                        <span className="font-bold text-blue-600">{stats.activeUsers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-yellow-900 mb-1">Admin Controls</h4>
                  <p className="text-sm text-yellow-800">
                    You have full access to manage users and meals. Use the tabs above to navigate to user management or meal database management.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-900">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'meals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">Meal Database</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search meals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMeals.map((meal) => (
                  <motion.div
                    key={meal._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-gray-200 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{meal.name}</h3>
                      <button
                        onClick={() => handleDeleteMeal(meal._id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 capitalize">{meal.category}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-50 rounded p-2">
                        <span className="text-blue-900 font-bold">{meal.nutrition?.calories || 0}</span>
                        <span className="text-blue-700 ml-1">cal</span>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <span className="text-green-900 font-bold">{meal.nutrition?.protein || 0}g</span>
                        <span className="text-green-700 ml-1">protein</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
