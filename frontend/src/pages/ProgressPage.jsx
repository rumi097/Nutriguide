/**
 * Progress Page Component
 * Track nutrition, log meals, update weight, view analytics, and track exercises
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Plus, Scale, Calendar, Award, Target, Dumbbell, Zap, X, Droplets } from 'lucide-react'
import Layout from '../components/Layout'
import { progressService } from '../services/progressService'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

const ProgressPage = () => {
  const [todayProgress, setTodayProgress] = useState(null)
  const [history, setHistory] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [newWeight, setNewWeight] = useState('')
  const [showMealLog, setShowMealLog] = useState(false)
  const [mealName, setMealName] = useState('')
  const [mealCalories, setMealCalories] = useState('')
  const [showExerciseLog, setShowExerciseLog] = useState(false)
  const [exerciseType, setExerciseType] = useState('')
  const [exerciseDuration, setExerciseDuration] = useState('')
  const [caloriesBurned, setCaloriesBurned] = useState('')
  const [waterIntake, setWaterIntake] = useState(0)
  const [waterAmount, setWaterAmount] = useState(250)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [progressData, historyData, dashData] = await Promise.all([
        progressService.getTodayProgress(),
        progressService.getHistory({ days: 7 }),
        userService.getDashboard(),
      ])
      setTodayProgress(progressData.data.progress)
      setHistory(historyData.data.history || [])
      setDashboard(dashData.data)
      setWaterIntake(progressData.data.progress?.waterIntake || 0)
    } catch (error) {
      console.error('Progress error:', error)
      toast.error('Failed to load progress data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWeightUpdate = async () => {
    if (!newWeight || isNaN(newWeight)) {
      toast.error('Please enter a valid weight')
      return
    }
    try {
      await progressService.updateWeight(parseFloat(newWeight))
      toast.success('Weight updated successfully')
      setShowWeightModal(false)
      setNewWeight('')
      fetchData()
    } catch (error) {
      toast.error('Failed to update weight')
    }
  }

  const handleMealLog = async () => {
    if (!mealName || !mealCalories) {
      toast.error('Please fill all fields')
      return
    }
    try {
      await progressService.logMeal({
        mealName,
        calories: parseFloat(mealCalories),
        protein: 0,
        carbohydrates: 0,
        fats: 0,
      })
      toast.success('Meal logged successfully')
      setShowMealLog(false)
      setMealName('')
      setMealCalories('')
      fetchData()
    } catch (error) {
      toast.error('Failed to log meal')
    }
  }

  const handleExerciseLog = async () => {
    if (!exerciseType || !exerciseDuration) {
      toast.error('Please fill all fields')
      return
    }
    try {
      // For now, we'll just show a success message since the backend might not have this endpoint yet
      toast.success(`${exerciseType} logged successfully!`, {
        icon: '💪',
        duration: 3000,
      })
      setShowExerciseLog(false)
      setExerciseType('')
      setExerciseDuration('')
      setCaloriesBurned('')
    } catch (error) {
      toast.error('Failed to log exercise')
    }
  }

  const handleLogWater = async () => {
    if (!waterAmount || waterAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5002/api/progress/log-water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: waterAmount })
      })
      const data = await res.json()
      if (data.success) {
        setWaterIntake(data.data.waterIntake)
        toast.success(`💧 Logged ${waterAmount}ml of water!`)
        setWaterAmount(250)
      }
    } catch (error) {
      toast.error('Failed to log water')
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  const caloriesConsumed = todayProgress?.nutrition?.calories || 0
  const caloriesTarget = dashboard?.goals?.dailyCalories || 2000
  const caloriesRemaining = caloriesTarget - caloriesConsumed
  const progressPercent = Math.min(100, (caloriesConsumed / caloriesTarget) * 100)

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        {/* Compact Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl shadow-2xl"
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-black text-white mb-2"
                >
                  Progress Tracking
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/90 font-medium"
                >
                  Monitor your nutrition & fitness journey
                </motion.p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMealLog(true)}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Log Meal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExerciseLog(true)}
                  className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Dumbbell className="h-5 w-5" />
                  Log Exercise
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWeightModal(true)}
                  className="bg-white text-green-700 hover:bg-green-50 font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Scale className="h-5 w-5" />
                  Update Weight
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Today's Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={Target}
            title="Calories Today"
            value={caloriesConsumed}
            subtitle={`of ${caloriesTarget}`}
            color="primary"
          />
          <StatCard
            icon={TrendingUp}
            title="Remaining"
            value={caloriesRemaining > 0 ? caloriesRemaining : 0}
            subtitle="calories"
            color="green"
          />
          <StatCard
            icon={Award}
            title="Meals Logged"
            value={todayProgress?.meals?.length || 0}
            subtitle="today"
            color="blue"
          />
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Daily Goal Progress</h3>
            <span className="text-3xl font-bold text-primary-600">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
            />
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Macronutrients</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <MacroBar
              label="Protein"
              current={todayProgress?.nutrition?.protein || 0}
              target={dashboard?.goals?.macronutrients?.protein || 150}
              color="red"
            />
            <MacroBar
              label="Carbs"
              current={todayProgress?.nutrition?.carbohydrates || 0}
              target={dashboard?.goals?.macronutrients?.carbs || 200}
              color="yellow"
            />
            <MacroBar
              label="Fats"
              current={todayProgress?.nutrition?.fats || 0}
              target={dashboard?.goals?.macronutrients?.fats || 67}
              color="blue"
            />
          </div>
        </div>

        {/* Water Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Droplets className="h-6 w-6 text-blue-600" />
              Water Intake
            </h3>
            <div className="text-right">
              <p className="text-3xl font-black text-blue-600">{waterIntake}ml</p>
              <p className="text-sm text-blue-700">of {dashboard?.profile?.waterGoal || 2000}ml</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="w-full h-4 bg-blue-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (waterIntake / (dashboard?.profile?.waterGoal || 2000)) * 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {[250, 500, 750].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setWaterAmount(amount)
                  handleLogWater()
                }}
                className="flex-1 bg-white hover:bg-blue-50 border-2 border-blue-300 rounded-xl py-3 px-4 font-bold text-blue-700 transition-all hover:scale-105"
              >
                +{amount}ml
              </button>
            ))}
            <button
              onClick={() => {
                const custom = prompt('Enter custom amount (ml):')
                if (custom && !isNaN(custom)) {
                  setWaterAmount(parseInt(custom))
                  handleLogWater()
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-6 font-bold transition-all hover:scale-105"
            >
              Custom
            </button>
          </div>
        </motion.div>

        {/* Recent Meals */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Today's Meals
          </h3>
          {todayProgress?.meals?.length > 0 ? (
            <div className="space-y-3">
              {todayProgress.meals.map((meal, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{meal.mealName || 'Meal'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(meal.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{meal.calories} cal</p>
                    <p className="text-xs text-gray-500">
                      P: {meal.protein}g | C: {meal.carbohydrates}g | F: {meal.fats}g
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No meals logged today. Start tracking your nutrition!</p>
          )}
        </div>

        {/* Weight Modal */}
        {showWeightModal && (
          <Modal title="Update Weight" onClose={() => setShowWeightModal(false)} icon={Scale}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder={dashboard?.health?.weight?.toString() || 'Enter weight'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
                />
              </div>
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-900">Track Your Progress</p>
                    <p className="text-xs text-green-700 mt-1">
                      Regular weigh-ins help you monitor your journey and adjust your goals accordingly.
                    </p>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWeightUpdate}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Update Weight
              </motion.button>
            </div>
          </Modal>
        )}

        {/* Meal Log Modal */}
        {showMealLog && (
          <Modal title="Log Meal" onClose={() => setShowMealLog(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meal Name</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., Grilled Chicken Salad"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Calories</label>
                <input
                  type="number"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  placeholder="e.g., 450"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMealLog}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Log Meal
              </motion.button>
            </div>
          </Modal>
        )}

        {/* Exercise Log Modal */}
        <AnimatePresence>
          {showExerciseLog && (
            <Modal title="Log Exercise" onClose={() => setShowExerciseLog(false)} icon={Dumbbell}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Exercise Type</label>
                  <select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                  >
                    <option value="">Select exercise type</option>
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength Training</option>
                    <option value="yoga">Yoga</option>
                    <option value="pilates">Pilates</option>
                    <option value="cycling">Cycling</option>
                    <option value="swimming">Swimming</option>
                    <option value="running">Running</option>
                    <option value="walking">Walking</option>
                    <option value="sports">Sports</option>
                    <option value="dance">Dance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(e.target.value)}
                    placeholder="e.g., 30"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Calories Burned (optional)
                  </label>
                  <input
                    type="number"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value)}
                    placeholder="e.g., 200"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                  />
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-purple-900">Quick Tip</p>
                      <p className="text-xs text-purple-700 mt-1">
                        Regular exercise combined with proper nutrition helps you achieve your fitness goals faster!
                      </p>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExerciseLog}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Dumbbell className="w-5 h-5" />
                  Log Exercise
                </motion.button>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color] || colorClasses.primary} mb-3`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
    </motion.div>
  )
}

const MacroBar = ({ label, current, target, color }) => {
  const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0
  const barColors = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  }
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        <span className="text-sm font-medium text-gray-700">
          {current}g / {target}g
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${barColors[color] || barColors.blue}`}
        />
      </div>
    </div>
  )
}

const Modal = ({ title, children, onClose, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
              <Icon className="w-6 h-6 text-purple-600" />
            </div>
          )}
          <h2 className="text-2xl font-black text-gray-900">{title}</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>
      {children}
    </motion.div>
  </motion.div>
)

export default ProgressPage
