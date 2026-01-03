/**
 * Profile Page - Editable Settings
 * User can update health information, preferences, and exercise settings
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Activity,
  Target,
  Heart,
  Scale,
  Ruler,
  Calendar,
  Save,
  Edit2,
  Apple,
  Dumbbell,
  Trophy,
  Zap,
  Clock,
} from 'lucide-react'
import Layout from '../components/Layout'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile()
      setProfile(response.data.user)
      setFormData(response.data.user)
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await userService.updateProfile(formData)
      toast.success('Profile updated successfully!')
      setProfile(formData)
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-2xl shadow-2xl"
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
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-black text-white mb-2"
                >
                  Profile Settings
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/90 font-medium"
                >
                  Manage your health & fitness preferences
                </motion.p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
                  isEditing
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-white hover:bg-gray-50 text-purple-600'
                }`}
              >
                {isSaving ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isEditing ? (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="w-5 h-5" />
                    Edit Profile
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Personal Information */}
        <SectionCard
          title="Personal Information"
          icon={User}
          color="purple"
          isEditing={isEditing}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              icon={User}
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={!isEditing}
            />
            <InputField
              label="Email"
              icon={User}
              value={formData.email || ''}
              disabled={true}
              type="email"
            />
            <InputField
              label="Age"
              icon={Calendar}
              value={formData.age || ''}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              disabled={!isEditing}
              type="number"
            />
            <SelectField
              label="Gender"
              icon={User}
              value={formData.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              disabled={!isEditing}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>
        </SectionCard>

        {/* Health Metrics */}
        <SectionCard
          title="Health Metrics"
          icon={Activity}
          color="green"
          isEditing={isEditing}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <InputField
              label="Height (cm)"
              icon={Ruler}
              value={formData.height || ''}
              onChange={(e) => handleChange('height', parseFloat(e.target.value))}
              disabled={!isEditing}
              type="number"
            />
            <InputField
              label="Current Weight (kg)"
              icon={Scale}
              value={formData.weight || ''}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
              disabled={!isEditing}
              type="number"
            />
            <InputField
              label="Target Weight (kg)"
              icon={Target}
              value={formData.targetWeight || ''}
              onChange={(e) => handleChange('targetWeight', parseFloat(e.target.value))}
              disabled={!isEditing}
              type="number"
            />
          </div>
        </SectionCard>

        {/* Fitness Goals & Activity */}
        <SectionCard
          title="Fitness Goals & Activity"
          icon={Trophy}
          color="blue"
          isEditing={isEditing}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <SelectField
              label="Fitness Goal"
              icon={Target}
              value={formData.fitnessGoal || ''}
              onChange={(e) => handleChange('fitnessGoal', e.target.value)}
              disabled={!isEditing}
              options={[
                { value: 'lose_weight', label: 'Lose Weight' },
                { value: 'maintain_weight', label: 'Maintain Weight' },
                { value: 'gain_weight', label: 'Gain Weight' },
                { value: 'build_muscle', label: 'Build Muscle' },
                { value: 'improve_health', label: 'Improve Health' },
              ]}
            />
            <SelectField
              label="Activity Level"
              icon={Zap}
              value={formData.activityLevel || ''}
              onChange={(e) => handleChange('activityLevel', e.target.value)}
              disabled={!isEditing}
              options={[
                { value: 'sedentary', label: 'Sedentary (Little/No Exercise)' },
                { value: 'light', label: 'Light (1-3 days/week)' },
                { value: 'moderate', label: 'Moderate (3-5 days/week)' },
                { value: 'active', label: 'Active (6-7 days/week)' },
                { value: 'very_active', label: 'Very Active (Intense Daily)' },
              ]}
            />
          </div>
        </SectionCard>

        {/* Exercise Preferences */}
        <SectionCard
          title="Exercise Preferences"
          icon={Dumbbell}
          color="orange"
          isEditing={isEditing}
        >
          <div className="space-y-6">
            <MultiSelectField
              label="Preferred Exercise Types"
              icon={Dumbbell}
              value={formData.exercisePreferences || []}
              onChange={(value) => handleChange('exercisePreferences', value)}
              disabled={!isEditing}
              options={[
                'cardio',
                'strength',
                'yoga',
                'pilates',
                'cycling',
                'swimming',
                'running',
                'walking',
                'sports',
                'dance',
              ]}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="Exercise Duration (minutes/day)"
                icon={Clock}
                value={formData.exerciseDuration || 30}
                onChange={(e) => handleChange('exerciseDuration', parseInt(e.target.value))}
                disabled={!isEditing}
                type="number"
              />
              <InputField
                label="Exercise Frequency (days/week)"
                icon={Calendar}
                value={formData.exerciseFrequency || 3}
                onChange={(e) => handleChange('exerciseFrequency', parseInt(e.target.value))}
                disabled={!isEditing}
                type="number"
                min="0"
                max="7"
              />
            </div>
          </div>
        </SectionCard>

        {/* Dietary Preferences */}
        <SectionCard
          title="Dietary Preferences"
          icon={Apple}
          color="red"
          isEditing={isEditing}
        >
          <div className="space-y-6">
            <MultiSelectField
              label="Diet Type"
              icon={Apple}
              value={formData.dietaryPreferences || []}
              onChange={(value) => handleChange('dietaryPreferences', value)}
              disabled={!isEditing}
              options={[
                'vegetarian',
                'vegan',
                'keto',
                'paleo',
                'mediterranean',
                'low_carb',
                'high_protein',
                'none',
              ]}
            />
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Allergies & Restrictions
              </label>
              <textarea
                value={(formData.allergies || []).join(', ')}
                onChange={(e) =>
                  handleChange(
                    'allergies',
                    e.target.value.split(',').map((a) => a.trim())
                  )
                }
                disabled={!isEditing}
                rows="3"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                  isEditing
                    ? 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
                placeholder="Enter allergies separated by commas (e.g., peanuts, dairy, gluten)"
              />
            </div>
          </div>
        </SectionCard>

        {/* Nutrition Goals Display */}
        {profile?.dailyCalorieTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-green-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Your Daily Targets</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox
                label="Calories"
                value={profile.dailyCalorieTarget}
                unit="kcal"
                color="green"
              />
              <StatBox
                label="Protein"
                value={profile.macronutrients?.protein}
                unit="g"
                color="blue"
              />
              <StatBox
                label="Carbs"
                value={profile.macronutrients?.carbohydrates}
                unit="g"
                color="yellow"
              />
              <StatBox
                label="Fats"
                value={profile.macronutrients?.fats}
                unit="g"
                color="red"
              />
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  )
}

// Reusable Components
const SectionCard = ({ title, icon: Icon, color, children, isEditing }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
        isEditing ? 'border-' + color + '-300' : 'border-gray-200'
      } transition-all`}
    >
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  )
}

const InputField = ({ label, icon: Icon, disabled, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        {...props}
        disabled={disabled}
        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 font-medium transition-all ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-600'
            : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
        }`}
      />
    </div>
  </div>
)

const SelectField = ({ label, icon: Icon, disabled, options, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <select
        {...props}
        disabled={disabled}
        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 font-medium transition-all appearance-none ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-600'
            : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
)

const MultiSelectField = ({ label, icon: Icon, value, onChange, disabled, options }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-3">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value.includes(option)
        return (
          <motion.button
            key={option}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => {
              if (disabled) return
              if (isSelected) {
                onChange(value.filter((v) => v !== option))
              } else {
                onChange([...value, option])
              }
            }}
            disabled={disabled}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.replace('_', ' ')}
          </motion.button>
        )
      })}
    </div>
  </div>
)

const StatBox = ({ label, value, unit, color }) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-pink-600',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 text-white`}>
      <p className="text-sm font-semibold opacity-90">{label}</p>
      <p className="text-2xl font-black mt-1">
        {value}
        <span className="text-sm ml-1">{unit}</span>
      </p>
    </div>
  )
}

export default ProfilePage
