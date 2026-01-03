/**
 * Dashboard Page Component
 * Main user dashboard with health insights, overview, and daily exercise suggestions
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Target, Activity, Apple, Award, Dumbbell, Zap, Clock, Flame, CheckCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { userService } from '../services/userService'
import { progressService } from '../services/progressService'
import { nutritionService } from '../services/nutritionService'
import toast from 'react-hot-toast'

// Exercise database with detailed information
const exerciseDatabase = {
  lose_weight: [
    { name: 'Running', duration: 30, calories: 300, intensity: 'high', icon: '🏃', description: 'Great cardio for burning calories' },
    { name: 'Cycling', duration: 45, calories: 350, intensity: 'medium', icon: '🚴', description: 'Low-impact cardio workout' },
    { name: 'Jump Rope', duration: 20, calories: 250, intensity: 'high', icon: '🪢', description: 'High-intensity calorie burner' },
    { name: 'Swimming', duration: 30, calories: 280, intensity: 'medium', icon: '🏊', description: 'Full-body cardio workout' },
    { name: 'HIIT Training', duration: 25, calories: 320, intensity: 'high', icon: '⚡', description: 'Maximum calorie burn' },
  ],
  build_muscle: [
    { name: 'Weight Training', duration: 45, calories: 200, intensity: 'high', icon: '🏋️', description: 'Build strength and muscle mass' },
    { name: 'Push-ups & Pull-ups', duration: 30, calories: 150, intensity: 'medium', icon: '💪', description: 'Bodyweight strength training' },
    { name: 'Resistance Bands', duration: 35, calories: 160, intensity: 'medium', icon: '🎯', description: 'Muscle building with bands' },
    { name: 'Deadlifts & Squats', duration: 40, calories: 180, intensity: 'high', icon: '🦵', description: 'Compound movements for mass' },
    { name: 'Dumbbell Training', duration: 45, calories: 190, intensity: 'medium', icon: '🏋️', description: 'Targeted muscle development' },
  ],
  maintain_weight: [
    { name: 'Brisk Walking', duration: 40, calories: 180, intensity: 'low', icon: '🚶', description: 'Maintain fitness with walking' },
    { name: 'Yoga', duration: 45, calories: 150, intensity: 'low', icon: '🧘', description: 'Flexibility and mindfulness' },
    { name: 'Pilates', duration: 40, calories: 160, intensity: 'medium', icon: '🤸', description: 'Core strength and flexibility' },
    { name: 'Dancing', duration: 30, calories: 200, intensity: 'medium', icon: '💃', description: 'Fun cardio activity' },
    { name: 'Light Cycling', duration: 35, calories: 170, intensity: 'low', icon: '🚴', description: 'Easy cardio maintenance' },
  ],
  improve_health: [
    { name: 'Walking', duration: 30, calories: 150, intensity: 'low', icon: '🚶', description: 'Gentle daily activity' },
    { name: 'Stretching', duration: 20, calories: 80, intensity: 'low', icon: '🤸', description: 'Improve flexibility' },
    { name: 'Tai Chi', duration: 30, calories: 120, intensity: 'low', icon: '🥋', description: 'Balance and wellness' },
    { name: 'Water Aerobics', duration: 35, calories: 160, intensity: 'low', icon: '🏊', description: 'Joint-friendly exercise' },
    { name: 'Gentle Yoga', duration: 40, calories: 130, intensity: 'low', icon: '🧘', description: 'Stress relief and flexibility' },
  ],
  gain_weight: [
    { name: 'Strength Training', duration: 50, calories: 220, intensity: 'high', icon: '🏋️', description: 'Build muscle mass' },
    { name: 'Compound Lifts', duration: 45, calories: 200, intensity: 'high', icon: '💪', description: 'Heavy weight exercises' },
    { name: 'Progressive Overload', duration: 40, calories: 190, intensity: 'high', icon: '⚡', description: 'Increase strength gradually' },
    { name: 'Bodybuilding Split', duration: 60, calories: 250, intensity: 'high', icon: '🎯', description: 'Targeted muscle groups' },
    { name: 'Power Training', duration: 45, calories: 210, intensity: 'high', icon: '🔥', description: 'Explosive movements' },
  ],
}

const getExerciseSuggestions = (fitnessGoal, activityLevel, preferredDuration = 30) => {
  const goalExercises = exerciseDatabase[fitnessGoal] || exerciseDatabase.maintain_weight
  
  // Adjust based on activity level
  const activityMultiplier = {
    sedentary: 0.8,
    light: 0.9,
    moderate: 1.0,
    active: 1.2,
    very_active: 1.4,
  }
  
  const multiplier = activityMultiplier[activityLevel] || 1.0
  
  // Filter and adjust exercises based on user's preferred duration
  const adjustedExercises = goalExercises.map(exercise => {
    const baseDuration = exercise.duration
    let adjustedDuration = baseDuration
    
    // If user prefers shorter workouts, adjust duration
    if (preferredDuration < 30) {
      adjustedDuration = Math.max(10, Math.round(baseDuration * (preferredDuration / 30)))
    } else if (preferredDuration > 45) {
      adjustedDuration = Math.round(baseDuration * (preferredDuration / 30))
    }
    
    // Apply activity multiplier
    adjustedDuration = Math.round(adjustedDuration * multiplier)
    
    // Recalculate calories based on new duration
    const caloriesPerMinute = exercise.calories / exercise.duration
    const adjustedCalories = Math.round(caloriesPerMinute * adjustedDuration)
    
    return {
      ...exercise,
      duration: adjustedDuration,
      calories: adjustedCalories,
    }
  })
  
  // Get 3 random exercises
  const shuffled = [...adjustedExercises].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3)
}

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null)
  const [todayProgress, setTodayProgress] = useState(null)
  const [mlRecommendations, setMlRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [exerciseSuggestions, setExerciseSuggestions] = useState([])
  const [completedExercises, setCompletedExercises] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [dashboardData, progressData, mlData] = await Promise.all([
        userService.getDashboard(),
        progressService.getTodayProgress(),
        nutritionService.getRecommendations().catch(() => null),
      ])
      setDashboard(dashboardData.data)
      setTodayProgress(progressData.data.progress)
      setMlRecommendations(mlData?.data)
      
      // Generate exercise suggestions based on user's profile
      if (dashboardData.data?.goals?.fitnessGoal) {
        const userExerciseDuration = dashboardData.data.profile?.exerciseDuration || 30
        const userActivityLevel = dashboardData.data.profile?.activityLevel || 'moderate'
        
        const suggestions = getExerciseSuggestions(
          dashboardData.data.goals.fitnessGoal,
          userActivityLevel,
          userExerciseDuration
        )
        setExerciseSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error(error.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteExercise = (exerciseIndex) => {
    if (!completedExercises.includes(exerciseIndex)) {
      setCompletedExercises([...completedExercises, exerciseIndex])
      const exercise = exerciseSuggestions[exerciseIndex]
      toast.success(`Great job! You completed ${exercise.name}! 💪`, {
        icon: '🎉',
        duration: 3000,
      })
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  const caloriesConsumed = todayProgress?.nutrition?.calories || 0
  const caloriesTarget = dashboard?.goals?.dailyCalories || 2000
  const caloriesProgress = Math.min(100, (caloriesConsumed / caloriesTarget) * 100)

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
              Welcome back, {dashboard?.profile?.name}! 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 font-medium"
            >
              Here's your health overview for today
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={Target} title="Daily Calories" value={`${caloriesConsumed} / ${caloriesTarget}`} color="primary" />
          <StatsCard icon={Activity} title="BMI" value={dashboard?.health?.bmi?.toFixed(1)} subtitle={dashboard?.health?.bmiCategory?.category} color="secondary" />
          <StatsCard icon={Apple} title="Meals Logged" value={todayProgress?.meals?.length || 0} subtitle="today" color="green" />
          <StatsCard icon={TrendingUp} title="Weight" value={`${dashboard?.health?.weight} kg`} subtitle={dashboard?.insights?.weightStatus} color="blue" />
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Today's Calorie Progress</h3>
            <span className="text-2xl font-bold text-primary-600">{caloriesProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${caloriesProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-primary-500 to-primary-600" />
          </div>
          <p className="mt-3 text-base font-medium text-gray-700">{caloriesTarget - caloriesConsumed > 0 ? `${(caloriesTarget - caloriesConsumed).toFixed(0)} calories remaining` : 'Target reached!'}</p>
        </div>

        {/* Macronutrients */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Macronutrient Targets</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <MacroCard label="Protein" current={todayProgress?.nutrition?.protein || 0} target={dashboard?.goals?.macronutrients?.protein || 0} color="red" />
            <MacroCard label="Carbs" current={todayProgress?.nutrition?.carbohydrates || 0} target={dashboard?.goals?.macronutrients?.carbs || 0} color="yellow" />
            <MacroCard label="Fats" current={todayProgress?.nutrition?.fats || 0} target={dashboard?.goals?.macronutrients?.fats || 0} color="blue" />
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Health Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-lg border border-primary-100">
              <Award className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900">Fitness Goal: {formatGoal(dashboard?.goals?.fitnessGoal)}</p>
                <p className="text-base text-gray-700 mt-1">{dashboard?.insights?.recommendation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Exercise Suggestions */}
        {exerciseSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  Today's Exercise Suggestions
                </h3>
                <p className="text-gray-600 mt-2 font-medium">
                  {dashboard?.profile?.exerciseDuration || 30}-minute workouts for your {formatGoal(dashboard?.goals?.fitnessGoal)} goal
                </p>
                {dashboard?.profile?.exerciseFrequency && (
                  <p className="text-sm text-purple-600 font-semibold mt-1">
                    🎯 Target: {dashboard.profile.exerciseFrequency} days per week
                  </p>
                )}
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-4xl"
              >
                💪
              </motion.div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {exerciseSuggestions.map((exercise, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative overflow-hidden rounded-xl p-5 transition-all ${
                    completedExercises.includes(index)
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300'
                      : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {completedExercises.includes(index) && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-3 right-3"
                    >
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </motion.div>
                  )}
                  
                  <div className="text-4xl mb-3">{exercise.icon}</div>
                  
                  <h4 className="text-lg font-black text-gray-900 mb-2">
                    {exercise.name}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-700">
                        {exercise.duration} minutes
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-gray-700">
                        Burns ~{exercise.calories} calories
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-700 capitalize">
                        {exercise.intensity} intensity
                      </span>
                    </div>
                  </div>
                  
                  {!completedExercises.includes(index) ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCompleteExercise(index)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Mark as Done
                    </motion.button>
                  ) : (
                    <div className="w-full bg-green-600 text-white font-bold py-3 rounded-xl text-center">
                      ✓ Completed
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initia className="flex-1">
                  <p className="font-bold text-gray-900">Your Exercise Plan</p>
                  <p className="text-sm text-gray-700 mt-1">
                    These exercises are tailored to your {dashboard?.profile?.exerciseDuration || 30}-minute daily preference. 
                    {dashboard?.profile?.exerciseFrequency && ` Aim for ${dashboard.profile.exerciseFrequency} sessions per week.`}
                    {' '}Consistency is key! Remember to warm up before and cool down after your workout.
                  </p>
                  {exerciseSuggestions.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-bold text-purple-900">
                        Today's Total: {exerciseSuggestions.reduce((sum, ex) => sum + ex.duration, 0)} min • 
                        Burns ~{exerciseSuggestions.reduce((sum, ex) => sum + ex.calories, 0)} calories
                      </p>
                    </div>
                  )}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Pro Tip</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Consistency is key! Try to complete at least 2-3 exercises daily. Remember to warm up before and cool down after your workout.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ML-Powered Recommendations */}
        {mlRecommendations && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              AI-Powered Nutrition Insights
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                <p className="text-sm font-medium text-primary-900 mb-1">Daily Calorie Target</p>
                <p className="text-2xl font-bold text-primary-700">{mlRecommendations.dailyCalories} cal</p>
                <p className="text-xs text-primary-600 mt-1">Based on your profile and goals</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg">
                <p className="text-sm font-medium text-secondary-900 mb-1">BMI Status</p>
                <p className="text-2xl font-bold text-secondary-700">{mlRecommendations.bmi}</p>
                <p className="text-xs text-secondary-600 mt-1">Body Mass Index</p>
              </div>
            </div>
            {mlRecommendations.recommendations && mlRecommendations.recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Personalized Tips:</p>
                {mlRecommendations.recommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-primary-600">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

const StatsCard = ({ icon: Icon, title, value, subtitle, color }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color] || colorClasses.primary} mb-3`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </motion.div>
  )
}

const MacroCard = ({ label, current, target, color }) => {
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
        <span className="text-sm font-medium text-gray-700">{current}g / {target}g</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className={`h-full ${barColors[color] || barColors.blue}`} />
      </div>
    </div>
  )
}

const formatGoal = (goal) => {
  const goals = { lose_weight: 'Lose Weight', maintain_weight: 'Maintain Weight', gain_weight: 'Gain Weight', build_muscle: 'Build Muscle', improve_health: 'Improve Health' }
  return goals[goal] || goal
}

export default DashboardPage
