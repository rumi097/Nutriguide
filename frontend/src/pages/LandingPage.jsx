/**
 * Landing Page Component
 * Public-facing homepage with features and call-to-action
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  TrendingUp,
  Users,
  Sparkles,
  CheckCircle,
} from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized meal plans based on your health goals and preferences',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your nutrition intake, weight changes, and achievements',
    },
    {
      icon: Users,
      title: 'Custom Meal Plans',
      description: 'Tailored daily meal suggestions that fit your lifestyle',
    },
    {
      icon: Sparkles,
      title: 'Smart Analytics',
      description: 'Visualize your health journey with interactive charts and insights',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container-responsive py-4 sm:py-6 sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="flex items-center justify-between">
          <motion.h1 
            className="text-xl sm:text-2xl font-bold gradient-text float"
            whileHover={{ scale: 1.05 }}
          >
            NutriGuide AI
          </motion.h1>
          <div className="flex gap-2 sm:gap-4">
            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary px-4 sm:px-6 py-2 text-sm sm:text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="container-responsive py-12 sm:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.h2 
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Your{' '}
            <span className="gradient-text">AI-Powered</span>
            <br className="hidden sm:block" />
            <span className="block sm:inline"> Nutrition Coach</span>
          </motion.h2>
          <motion.p 
            className="text-base sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Transform your health journey with personalized meal plans,
            smart nutrition tracking, and AI-driven recommendations
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 text-white rounded-xl hover:shadow-2xl transition-all text-base sm:text-lg font-semibold shimmer pulse-glow"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container-responsive py-12 sm:py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h3 
            variants={itemVariants}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12"
          >
            Everything You Need to Succeed
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  rotate: [0, -1, 1, 0],
                  transition: { duration: 0.3 }
                }}
                className="p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer glass"
              >
                <motion.div 
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-purple-100 text-primary-600 mb-4 float"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </motion.div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="container-responsive py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Achieve Your Health Goals
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {[
                'Personalized calorie and macro targets',
                'AI-powered meal recommendations',
                'Track weight and nutrition progress',
                'Visual analytics and insights',
                'Dietary preference customization',
                'Allergen-safe meal suggestions',
              ].map((benefit, index) => (
                <motion.li 
                  key={benefit} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-6 sm:p-8 card-hover"
          >
            <div className="space-y-4 sm:space-y-6">
              <motion.div 
                className="p-4 sm:p-6 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="font-semibold text-primary-900 mb-2 text-sm sm:text-base">
                  Daily Calorie Target
                </h4>
                <p className="text-2xl sm:text-3xl font-bold text-gradient-primary">2,400 cal</p>
              </motion.div>
              <motion.div 
                className="p-4 sm:p-6 bg-gradient-to-br from-secondary-50 to-pink-50 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="font-semibold text-secondary-900 mb-3 text-sm sm:text-base">
                  Macronutrients
                </h4>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Protein</p>
                    <p className="text-lg sm:text-xl font-bold text-gradient-secondary">180g</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Carbs</p>
                    <p className="text-lg sm:text-xl font-bold text-gradient-secondary">240g</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Fats</p>
                    <p className="text-xl font-bold text-gradient-secondary">80g</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-responsive py-12 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10">
            <motion.h3 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Health?
            </motion.h3>
            <motion.p 
              className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Join thousands of users achieving their nutrition goals
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 rounded-xl hover:shadow-2xl transition-all text-base sm:text-lg font-bold"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container-responsive py-8 border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p>© 2024 NutriGuide AI. All rights reserved.</p>
          <p className="mt-2">Powered by Machine Learning & Nutrition Science</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
