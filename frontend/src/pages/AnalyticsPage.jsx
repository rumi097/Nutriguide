import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Flame,
  Droplets,
  Dumbbell,
  Calendar,
  Award,
  Target,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

const AnalyticsPage = () => {
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [weightHistory, setWeightHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(7)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayProgress, setDayProgress] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [progressDates, setProgressDates] = useState(new Set())
  
  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])
  
  useEffect(() => {
    if (selectedDate) {
      fetchDayProgress(selectedDate)
    }
  }, [selectedDate])
  
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      
      const [summaryRes, weightRes, historyRes] = await Promise.all([
        fetch('http://localhost:5002/api/progress/weekly-summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5002/api/progress/weight-history?days=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5002/api/progress/history?days=90`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])
      
      const summaryData = await summaryRes.json()
      const weightData = await weightRes.json()
      const historyData = await historyRes.json()
      
      if (summaryData.success) setWeeklySummary(summaryData.data)
      if (weightData.success) setWeightHistory(weightData.data.history)
      
      // Create set of dates with progress data
      if (historyData.success && historyData.data.history) {
        const dates = new Set(
          historyData.data.history.map(d => 
            new Date(d.date).toISOString().split('T')[0]
          )
        )
        setProgressDates(dates)
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchDayProgress = async (date) => {
    try {
      const token = localStorage.getItem('token')
      const dateStr = date.toISOString().split('T')[0]
      
      const res = await fetch(`http://localhost:5002/api/progress/history?startDate=${dateStr}&endDate=${dateStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await res.json()
      if (data.success && data.data.history.length > 0) {
        setDayProgress(data.data.history[0])
        toast.success(`📅 Loaded data for ${date.toLocaleDateString()}`)
      } else {
        setDayProgress(null)
        toast.error('No data available for this date')
      }
    } catch (error) {
      toast.error('Failed to load day progress')
    }
  }
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }
  
  const hasProgressOnDate = (date) => {
    const dateStr = new Date(date).toISOString().split('T')[0]
    return progressDates.has(dateStr)
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }
  
  const weightChange = weightHistory.length >= 2
    ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
    : 0
  
  const calorieCompliance = weeklySummary?.summary && weeklySummary.goals
    ? Math.round((weeklySummary.summary.avgCalories / weeklySummary.goals.calories) * 100)
    : 0
  
  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-1">Weekly Analytics</h1>
              <p className="text-sm text-blue-100">Track your progress</p>
            </div>
            <BarChart3 className="w-12 h-12 text-white opacity-40" />
          </div>
        </motion.div>
        
        {/* Controls */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-[280px] flex gap-2 bg-white rounded-xl p-2 shadow-lg border border-gray-200">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`flex-1 py-3 px-4 rounded-lg text-base font-bold transition-all ${
                  timeRange === days
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCalendar(!showCalendar)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl py-3 px-6 text-base font-bold shadow-lg flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            {showCalendar ? 'Hide' : 'Calendar'}
          </motion.button>
        </div>
        
        {/* Calendar View */}
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-6 shadow-xl border border-purple-200/50 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-purple-100 rounded-xl text-purple-600 font-bold shadow-md text-xl"
              >
                ‹
              </motion.button>
              <h3 className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-purple-100 rounded-xl text-purple-600 font-bold shadow-md text-xl"
              >
                ›
              </motion.button>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-sm font-bold text-gray-600 py-2">
                  {day}
                </div>
              ))}
              
              {(() => {
                const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
                const days = []
                
                // Empty cells for days before month starts
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(<div key={`empty-${i}`} className="aspect-square" />)
                }
                
                // Days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(year, month, day)
                  const dateStr = date.toISOString().split('T')[0]
                  const hasProgress = hasProgressOnDate(date)
                  const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateStr
                  const isToday = new Date().toISOString().split('T')[0] === dateStr
                  
                  days.push(
                    <motion.button
                      key={day}
                      whileHover={{ scale: hasProgress ? 1.1 : 1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (hasProgress) setSelectedDate(date)
                      }}
                      disabled={!hasProgress}
                      className={`aspect-square rounded-xl text-sm font-bold transition-all relative flex items-center justify-center min-h-[40px] ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105 z-10'
                          : hasProgress
                          ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white hover:from-emerald-500 hover:to-green-600 shadow-md'
                          : 'bg-white/50 text-gray-300 cursor-not-allowed'
                      } ${
                        isToday && !isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {day}
                      {hasProgress && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white" />
                      )}
                    </motion.button>
                  )
                }
                
                return days
              })()}
            </div>
            
            <div className="mt-5 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full shadow-sm" />
                <span className="text-gray-700 font-semibold">Has Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 ring-2 ring-blue-500 rounded-full" />
                <span className="text-gray-700 font-semibold">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-sm" />
                <span className="text-gray-700 font-semibold">Selected</span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Selected Day Details */}
        {selectedDate && dayProgress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl p-6 shadow-xl border border-purple-200/50"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <p className="text-sm text-purple-600 font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSelectedDate(null)
                  setDayProgress(null)
                }}
                className="w-10 h-10 flex items-center justify-center hover:bg-purple-100 rounded-xl text-purple-600 text-xl font-bold"
              >
                ✕
              </motion.button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-5">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-200/50 shadow-sm">
                <Flame className="w-7 h-7 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-orange-600">{dayProgress.nutrition.calories}</p>
                <p className="text-xs text-gray-600 font-semibold mt-1">calories</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center border border-blue-200/50 shadow-sm">
                <Droplets className="w-7 h-7 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-600">{dayProgress.waterIntake || 0}</p>
                <p className="text-xs text-gray-600 font-semibold mt-1">ml water</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200/50 shadow-sm">
                <Dumbbell className="w-7 h-7 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-purple-600">{dayProgress.exercises?.length || 0}</p>
                <p className="text-xs text-gray-600 font-semibold mt-1">exercises</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200/50 shadow-sm">
                <Target className="w-7 h-7 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-green-600">{dayProgress.meals?.length || 0}</p>
                <p className="text-xs text-gray-600 font-semibold mt-1">meals</p>
              </div>
            </div>
            
            {/* Macros */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 shadow-sm">
              <h4 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
                Macronutrients
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-700 font-semibold">Protein</span>
                    <span className="font-black text-red-600">{dayProgress.nutrition.protein}g</span>
                  </div>
                  <div className="bg-red-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      transition={{ duration: 0.4 }}
                      className="bg-gradient-to-r from-red-400 to-red-600 h-full rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-700 font-semibold">Carbs</span>
                    <span className="font-black text-yellow-600">{dayProgress.nutrition.carbohydrates}g</span>
                  </div>
                  <div className="bg-yellow-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 0.4 }}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-700 font-semibold">Fats</span>
                    <span className="font-black text-blue-600">{dayProgress.nutrition.fats}g</span>
                  </div>
                  <div className="bg-blue-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '50%' }}
                      transition={{ duration: 0.4 }}
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Meals List */}
            {dayProgress.meals && dayProgress.meals.length > 0 && (
              <div className="mt-5 bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 shadow-sm">
                <h4 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full" />
                  Meals Logged
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {dayProgress.meals.map((meal, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-white rounded-lg p-3 shadow-sm">
                      <span className="font-semibold text-gray-900">{meal.mealName}</span>
                      <span className="text-orange-600 font-bold">{meal.calories} cal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Summary Cards */}
        {weeklySummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-lg"
            >
              <Flame className="w-8 h-8 text-orange-600 mb-3" />
              <p className="text-3xl font-black text-orange-900">
                {weeklySummary.summary.avgCalories}
              </p>
              <p className="text-sm text-orange-700 font-semibold mt-1">Calories/Day</p>
              <p className="text-xs text-orange-600 mt-2">
                Goal: {weeklySummary.goals.calories}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-lg"
            >
              <Droplets className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-3xl font-black text-blue-900">
                {weeklySummary.summary.avgWater}
              </p>
              <p className="text-sm text-blue-700 font-semibold mt-1">Water ml/Day</p>
              <p className="text-xs text-blue-600 mt-2">
                Goal: {weeklySummary.goals.water}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-lg"
            >
              <Dumbbell className="w-8 h-8 text-purple-600 mb-3" />
              <p className="text-3xl font-black text-purple-900">
                {weeklySummary.summary.totalExercises}
              </p>
              <p className="text-sm text-purple-700 font-semibold mt-1">Exercises</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-lg"
            >
              <Award className="w-8 h-8 text-green-600 mb-3" />
              <p className="text-3xl font-black text-green-900">
                {weeklySummary.summary.currentStreak}
              </p>
              <p className="text-sm text-green-700 font-semibold mt-1">Day Streak 🔥</p>
            </motion.div>
          </div>
        )}
        
        {/* Weight Progress */}
        {weightHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Weight Progress
              </h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                weightChange < 0 
                  ? 'bg-green-100 text-green-700' 
                  : weightChange > 0
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {weightChange < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                <span className="font-bold">
                  {Math.abs(weightChange).toFixed(1)}kg
                </span>
              </div>
            </div>
            
            {/* weight chart */}
            <div className="space-y-3">
              {weightHistory.map((entry, index) => {
                const date = new Date(entry.date)
                const progress = ((entry.weight - weightHistory[0].weight) / (weightHistory[0].weight || 1)) * 100
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600 w-20">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.abs(progress), 100)}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`h-full rounded-full ${
                          progress < 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-16">
                      {entry.weight.toFixed(1)}kg
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
        
        {/* Daily Breakdown */}
        {weeklySummary?.days && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
          >
            <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Daily Breakdown
            </h2>
            
            <div className="grid gap-4">
              {weeklySummary.days.map((day, index) => {
                const date = new Date(day.date)
                const caloriePercent = (day.nutrition.calories / weeklySummary.goals.calories) * 100
                const waterPercent = (day.waterIntake / weeklySummary.goals.water) * 100
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-orange-600">
                          {day.nutrition.calories}
                        </p>
                        <p className="text-xs text-gray-600">cal</p>
                      </div>
                    </div>
                    
                    {/* progress bars */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-semibold">Calories</span>
                          <span className="font-bold text-gray-900">{Math.round(caloriePercent)}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full h-2 transition-all duration-300"
                            style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-semibold">Water</span>
                          <span className="font-bold text-gray-900">{day.waterIntake || 0}ml</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-2 transition-all duration-300"
                            style={{ width: `${Math.min(waterPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
        
        {/* Compliance */}
        {weeklySummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 shadow-xl border ${
              calorieCompliance >= 90 && calorieCompliance <= 110
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Target className={`w-10 h-10 flex-shrink-0 ${
                calorieCompliance >= 90 && calorieCompliance <= 110 ? 'text-green-600' : 'text-yellow-600'
              }`} />
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {calorieCompliance >= 90 && calorieCompliance <= 110 
                    ? '🎯 Great! On track!' 
                    : '💪 Keep going!'}
                </h3>
                <p className="text-sm text-gray-700">
                  You're at <span className="font-bold">{calorieCompliance}%</span> of daily goal
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  )
}

export default AnalyticsPage
