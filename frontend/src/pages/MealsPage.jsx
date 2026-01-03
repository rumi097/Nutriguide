/**
 * Meals Page Component
 * Browse meals, search, filter, and get personalized recommendations
 * Now with one-click meal logging to progress
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Sparkles, Clock, Flame, Apple, ChefHat, Plus, Check } from 'lucide-react'
import Layout from '../components/Layout'
import { mealService } from '../services/mealService'
import { nutritionService } from '../services/nutritionService'
import { progressService } from '../services/progressService'
import toast from 'react-hot-toast'

const MealsPage = () => {
  const [meals, setMeals] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // 'all' or 'recommended'
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
  const [loggingMeal, setLoggingMeal] = useState(null)

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snacks' },
  ]

  useEffect(() => {
    fetchData()
  }, [selectedCategory, pagination.page])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [mealsData, recsData] = await Promise.all([
        mealService.getMeals({ category: selectedCategory, page: pagination.page, limit: 12 }),
        mealService.getRecommendations({ calorieTarget: 600 }),
      ])
      setMeals(mealsData.data.meals)
      setPagination(mealsData.data.pagination)
      setRecommendations(recsData.data.meals || [])
    } catch (error) {
      console.error('Meals error:', error)
      toast.error('Failed to load meals')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchData()
      return
    }
    try {
      setIsLoading(true)
      const data = await mealService.getMeals({ search: searchTerm, category: selectedCategory })
      setMeals(data.data.meals)
      setPagination(data.data.pagination)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogMeal = async (meal) => {
    try {
      setLoggingMeal(meal._id)
      
      // Prepare meal data with validation
      const mealData = {
        mealName: meal.name || 'Unnamed Meal',
        category: meal.category || 'snack',
        calories: Number(meal.nutrition?.calories) || 0,
        protein: Number(meal.nutrition?.protein) || 0,
        carbohydrates: Number(meal.nutrition?.carbohydrates) || 0,
        fats: Number(meal.nutrition?.fats) || 0,
      }
      
      await progressService.logMeal(mealData)
      
      toast.success(`${meal.name} logged to your progress!`, {
        icon: '✅',
        duration: 3000,
      })
    } catch (error) {
      console.error('Log meal error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to log meal'
      toast.error(errorMessage)
    } finally {
      setLoggingMeal(null)
    }
  }

  const displayMeals = activeTab === 'recommended' ? recommendations : meals

  if (isLoading && meals.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        {/* Compact Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-2xl shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10" />
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
          <div className="relative p-6 md:p-8">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-black text-white mb-2"
            >
              Meal Database
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 font-medium"
            >
              Browse thousands of meals & log them instantly
            </motion.p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 space-y-4 shadow-lg border-2 border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Search
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              Filters
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t-2 border-gray-100"
              >
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-64 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-3 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-6 py-3 font-bold transition-all ${
              activeTab === 'all' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Meals ({pagination.total})
            {activeTab === 'all' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`relative px-6 py-3 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'recommended' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="h-5 w-5" />
            Recommended ({recommendations.length})
            {activeTab === 'recommended' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            )}
          </button>
        </div>

        {/* Meals Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayMeals.map((meal, index) => (
            <MealCard
              key={meal._id}
              meal={meal}
              index={index}
              onLog={handleLogMeal}
              isLogging={loggingMeal === meal._id}
            />
          ))}
        </motion.div>

        {displayMeals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-2xl"
          >
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No meals found. Try adjusting your filters.</p>
          </motion.div>
        )}

        {/* Pagination */}
        {activeTab === 'all' && pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPagination({ ...pagination, page })}
                className={`w-12 h-12 rounded-xl font-bold transition-all ${
                  pagination.page === page
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

const MealCard = ({ meal, index, onLog, isLogging }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 shadow-lg border-2 border-gray-100 hover:border-green-300"
  >
    {meal.imageUrl && (
      <div className="h-48 bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 flex items-center justify-center relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-black/10"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
        <ChefHat className="h-20 w-20 text-white opacity-40 relative z-10" />
      </div>
    )}
    <div className="p-5 space-y-3">
      <div>
        <h3 className="font-black text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
          {meal.name}
        </h3>
        <span className="inline-block px-3 py-1 text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full border border-green-200">
          {meal.category}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-700 font-bold bg-orange-50 rounded-lg p-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>{meal.nutrition?.calories || 0} cal</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 font-bold bg-blue-50 rounded-lg p-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <span>{(meal.prepTime || 0) + (meal.cookTime || 0)} min</span>
        </div>
      </div>
      <div className="flex justify-between text-sm font-bold text-gray-700 pt-2 border-t-2 border-gray-100">
        <span className="text-blue-600">P: {meal.nutrition?.protein || 0}g</span>
        <span className="text-yellow-600">C: {meal.nutrition?.carbohydrates || 0}g</span>
        <span className="text-red-600">F: {meal.nutrition?.fats || 0}g</span>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onLog(meal)}
        disabled={isLogging}
        className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLogging ? (
          <>
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Logging...
          </>
        ) : (
          <>
            <Plus className="h-5 w-5" />
            Log to Progress
          </>
        )}
      </motion.button>
    </div>
  </motion.div>
)

export default MealsPage
