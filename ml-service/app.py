"""
NutriGuide AI - ML Inference Service
Flask API for serving nutrition predictions based on trained ML model
Uses user health data to predict personalized calorie targets and macronutrient distribution
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS for production
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
CORS(app, origins=cors_origins, supports_credentials=True)

# ======================
# Configuration
# ======================
PORT = int(os.getenv('PORT', 5001))
MODEL_PATH = os.getenv('MODEL_PATH', 'models/nutrition_model.pkl')
SCALER_PATH = os.getenv('SCALER_PATH', 'models/scaler.pkl')

# ======================
# Load ML Models (if exist)
# ======================
try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    MODEL_LOADED = True
    print("✅ Nutrition ML Model loaded successfully")
except:
    MODEL_LOADED = False
    print("⚠️  Nutrition ML Model not found. Using fallback calculation.")

# Load Meal Recommendation System
try:
    RECOMMENDATION_PATH = 'models/meal_recommendation_system.pkl'
    recommendation_system = joblib.load(RECOMMENDATION_PATH)
    RECOMMENDATION_LOADED = True
    print(f"✅ Meal Recommendation System loaded ({len(recommendation_system['meals_df'])} meals)")
except Exception as e:
    RECOMMENDATION_LOADED = False
    recommendation_system = None
    print(f"⚠️  Meal Recommendation System not found. Run train_meal_recommendation.py")

# ======================
# Activity Level Multipliers
# ======================
ACTIVITY_MULTIPLIERS = {
    'sedentary': 1.2,      # Little or no exercise
    'light': 1.375,        # Light exercise 1-3 days/week
    'moderate': 1.55,      # Moderate exercise 3-5 days/week
    'active': 1.725,       # Heavy exercise 6-7 days/week
    'very_active': 1.9     # Very heavy exercise, physical job
}

# ======================
# Fitness Goal Adjustments (calories)
# ======================
GOAL_ADJUSTMENTS = {
    'lose_weight': -500,     # Calorie deficit for weight loss
    'maintain_weight': 0,    # Maintenance calories
    'gain_weight': 500,      # Calorie surplus for weight gain
    'build_muscle': 300,     # Moderate surplus for muscle building
    'improve_health': 0      # Maintenance with focus on nutrition quality
}

# ======================
# Helper Functions
# ======================

def calculate_bmi(weight_kg, height_cm):
    """
    Calculate Body Mass Index (BMI)
    Formula: BMI = weight (kg) / (height (m))^2
    """
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 2)

def calculate_bmr(age, gender, weight_kg, height_cm):
    """
    Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
    
    For Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
    For Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
    
    BMR represents calories burned at rest
    """
    if gender == 'male':
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:  # female or other
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    
    return round(bmr, 2)

def calculate_tdee(bmr, activity_level):
    """
    Calculate Total Daily Energy Expenditure (TDEE)
    TDEE = BMR × Activity Multiplier
    
    This represents total calories burned per day including activity
    """
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)
    tdee = bmr * multiplier
    return round(tdee, 2)

def calculate_daily_calories(tdee, fitness_goal):
    """
    Calculate target daily calories based on fitness goal
    Adjusts TDEE by adding/subtracting calories based on goal
    """
    adjustment = GOAL_ADJUSTMENTS.get(fitness_goal, 0)
    daily_calories = tdee + adjustment
    return round(daily_calories)

def calculate_macronutrients(daily_calories, fitness_goal):
    """
    Calculate macronutrient distribution (protein, carbs, fats) in grams
    
    Distribution varies by fitness goal:
    - Weight Loss: Higher protein, moderate carbs, lower fat
    - Muscle Building: High protein, higher carbs, moderate fat
    - Maintenance: Balanced distribution
    
    Conversion factors:
    - Protein: 4 calories per gram
    - Carbohydrates: 4 calories per gram
    - Fats: 9 calories per gram
    """
    
    # Define macro ratios for different goals
    macro_ratios = {
        'lose_weight': {'protein': 0.35, 'carbs': 0.35, 'fats': 0.30},
        'maintain_weight': {'protein': 0.30, 'carbs': 0.40, 'fats': 0.30},
        'gain_weight': {'protein': 0.25, 'carbs': 0.45, 'fats': 0.30},
        'build_muscle': {'protein': 0.35, 'carbs': 0.40, 'fats': 0.25},
        'improve_health': {'protein': 0.30, 'carbs': 0.40, 'fats': 0.30}
    }
    
    ratios = macro_ratios.get(fitness_goal, macro_ratios['maintain_weight'])
    
    # Calculate grams for each macronutrient
    protein_grams = round((daily_calories * ratios['protein']) / 4)  # 4 cal/g
    carbs_grams = round((daily_calories * ratios['carbs']) / 4)      # 4 cal/g
    fats_grams = round((daily_calories * ratios['fats']) / 9)        # 9 cal/g
    
    return {
        'protein': protein_grams,
        'carbs': carbs_grams,
        'fats': fats_grams
    }

def generate_recommendations(bmi, fitness_goal, age):
    """
    Generate personalized health recommendations based on user profile
    """
    recommendations = []
    
    # BMI-based recommendations
    if bmi < 18.5:
        recommendations.append("Your BMI indicates underweight. Focus on nutrient-dense, calorie-rich foods.")
    elif bmi < 25:
        recommendations.append("Your BMI is in the healthy range. Maintain your current lifestyle.")
    elif bmi < 30:
        recommendations.append("Your BMI indicates overweight. Consider a balanced calorie deficit.")
    else:
        recommendations.append("Consult a healthcare provider for personalized weight management advice.")
    
    # Goal-based recommendations
    goal_tips = {
        'lose_weight': "Aim for 1-2 lbs weight loss per week through diet and exercise.",
        'maintain_weight': "Keep a consistent routine with balanced nutrition and regular activity.",
        'gain_weight': "Focus on calorie-dense, nutritious foods and strength training.",
        'build_muscle': "Prioritize protein intake (1.6-2.2g per kg body weight) and progressive overload.",
        'improve_health': "Focus on whole foods, adequate hydration, and regular exercise."
    }
    recommendations.append(goal_tips.get(fitness_goal, "Maintain a balanced diet."))
    
    # General recommendations
    recommendations.append("Drink at least 8-10 glasses of water daily.")
    recommendations.append("Include fruits and vegetables in every meal.")
    
    if age > 50:
        recommendations.append("Ensure adequate calcium and vitamin D intake for bone health.")
    
    return recommendations

def preprocess_features(data):
    """
    Preprocess input features for ML model prediction
    Converts categorical variables to numerical and applies scaling
    """
    # Create feature array
    features = []
    
    # Encode gender (male=1, female=0, other=0.5)
    gender_encoded = 1 if data['gender'] == 'male' else (0 if data['gender'] == 'female' else 0.5)
    
    # Encode activity level (0-4 scale)
    activity_encoding = {
        'sedentary': 0,
        'light': 1,
        'moderate': 2,
        'active': 3,
        'very_active': 4
    }
    activity_encoded = activity_encoding.get(data['activity_level'], 2)
    
    # Encode fitness goal (0-4 scale)
    goal_encoding = {
        'lose_weight': 0,
        'maintain_weight': 1,
        'gain_weight': 2,
        'build_muscle': 3,
        'improve_health': 1
    }
    goal_encoded = goal_encoding.get(data['fitness_goal'], 1)
    
    # Calculate additional features
    bmi = calculate_bmi(data['weight'], data['height'])
    bmr = calculate_bmr(data['age'], data['gender'], data['weight'], data['height'])
    
    # Feature array: [age, gender, height, weight, bmi, bmr, activity, goal]
    features = [
        data['age'],
        gender_encoded,
        data['height'],
        data['weight'],
        bmi,
        bmr,
        activity_encoded,
        goal_encoded
    ]
    
    return np.array(features).reshape(1, -1)

# ======================
# API Routes
# ======================

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify service is running
    """
    return jsonify({
        'success': True,
        'message': 'NutriGuide ML Service is running',
        'model_loaded': MODEL_LOADED,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    Accepts user health data and returns personalized nutrition recommendations
    
    Request Body:
    {
        "age": 25,
        "gender": "male",
        "height": 175,
        "weight": 70,
        "activity_level": "moderate",
        "fitness_goal": "maintain_weight"
    }
    
    Response:
    {
        "success": true,
        "daily_calories": 2400,
        "macronutrients": {"protein": 180, "carbs": 240, "fats": 80},
        "bmi": 22.86,
        "bmr": 1680,
        "recommendations": [...]
    }
    """
    try:
        # Get request data
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['age', 'gender', 'height', 'weight', 'activity_level', 'fitness_goal']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Calculate nutrition metrics
        bmi = calculate_bmi(data['weight'], data['height'])
        bmr = calculate_bmr(data['age'], data['gender'], data['weight'], data['height'])
        tdee = calculate_tdee(bmr, data['activity_level'])
        daily_calories = calculate_daily_calories(tdee, data['fitness_goal'])
        macronutrients = calculate_macronutrients(daily_calories, data['fitness_goal'])
        recommendations = generate_recommendations(bmi, data['fitness_goal'], data['age'])
        
        # If ML model is loaded, use it for refined predictions
        if MODEL_LOADED:
            try:
                features = preprocess_features(data)
                # Scale features if scaler is available
                if scaler:
                    features = scaler.transform(features)
                
                # Make prediction
                prediction = model.predict(features)[0]
                # Use ML prediction if reasonable, otherwise use calculated value
                if 1200 <= prediction <= 5000:
                    daily_calories = round(prediction)
                    macronutrients = calculate_macronutrients(daily_calories, data['fitness_goal'])
            except Exception as ml_error:
                print(f"ML prediction error: {ml_error}")
                # Continue with calculated values
        
        # Return prediction
        return jsonify({
            'success': True,
            'daily_calories': daily_calories,
            'macronutrients': macronutrients,
            'bmi': bmi,
            'bmr': bmr,
            'tdee': tdee,
            'recommendations': recommendations,
            'method': 'ml_model' if MODEL_LOADED else 'calculation'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Prediction error: {str(e)}'
        }), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """
    Batch prediction endpoint for multiple users
    Useful for processing multiple predictions at once
    """
    try:
        data = request.get_json()
        users = data.get('users', [])
        
        if not users:
            return jsonify({
                'success': False,
                'message': 'No users provided'
            }), 400
        
        results = []
        for user in users:
            # Calculate for each user
            bmi = calculate_bmi(user['weight'], user['height'])
            bmr = calculate_bmr(user['age'], user['gender'], user['weight'], user['height'])
            tdee = calculate_tdee(bmr, user['activity_level'])
            daily_calories = calculate_daily_calories(tdee, user['fitness_goal'])
            macronutrients = calculate_macronutrients(daily_calories, user['fitness_goal'])
            
            results.append({
                'daily_calories': daily_calories,
                'macronutrients': macronutrients,
                'bmi': bmi,
                'bmr': bmr
            })
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Batch prediction error: {str(e)}'
        }), 500

# ======================
# Meal Recommendation Endpoints
# ======================

@app.route('/recommend/similar', methods=['POST'])
def recommend_similar_meals():
    """
    Get similar meal recommendations based on a meal name
    POST body: { "meal_name": "Grilled Chicken", "top_n": 5 }
    """
    try:
        if not RECOMMENDATION_LOADED:
            return jsonify({
                'success': False,
                'message': 'Recommendation system not available'
            }), 503
        
        data = request.get_json()
        meal_name = data.get('meal_name')
        top_n = data.get('top_n', 5)
        
        if not meal_name:
            return jsonify({
                'success': False,
                'message': 'meal_name is required'
            }), 400
        
        # Load meal index
        import json
        with open('models/meal_index.json', 'r') as f:
            meal_index = json.load(f)
        
        if meal_name not in meal_index:
            return jsonify({
                'success': False,
                'message': f'Meal "{meal_name}" not found in database'
            }), 404
        
        meal_idx = meal_index[meal_name]
        similarity_matrix = recommendation_system['similarity_matrix']
        similarities = similarity_matrix[meal_idx]
        
        # Get top N similar meals (excluding itself)
        similar_indices = similarities.argsort()[::-1][1:top_n+1]
        
        recommendations = []
        for idx in similar_indices:
            meal = recommendation_system['meals_df'][idx]
            recommendations.append({
                'name': meal['name'],
                'similarity_score': float(similarities[idx]),
                'calories': meal['calories'],
                'protein': meal['protein'],
                'carbohydrates': meal['carbohydrates'],
                'fats': meal['fats'],
                'category': meal['category'],
                'cuisine': meal['cuisine'],
                'dietary_tags': meal['dietaryTags'],
                'cook_time': meal['cookTime']
            })
        
        return jsonify({
            'success': True,
            'query_meal': meal_name,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Recommendation error: {str(e)}'
        }), 500


@app.route('/recommend/personalized', methods=['POST'])
def recommend_personalized_meals():
    """
    Get personalized meal recommendations based on user preferences and nutrition targets
    POST body: {
        "daily_calories": 2000,
        "target_protein": 150,
        "target_carbs": 200,
        "target_fats": 67,
        "dietary_preferences": ["vegetarian"],
        "allergies": ["nuts"],
        "meal_type": "lunch",
        "top_n": 10
    }
    """
    try:
        if not RECOMMENDATION_LOADED:
            return jsonify({
                'success': False,
                'message': 'Recommendation system not available'
            }), 503
        
        data = request.get_json()
        daily_calories = data.get('daily_calories', 2000)
        target_protein = data.get('target_protein', 150)
        target_carbs = data.get('target_carbs', 200)
        target_fats = data.get('target_fats', 67)
        dietary_preferences = data.get('dietary_preferences', [])
        allergies = data.get('allergies', [])
        meal_type = data.get('meal_type', None)
        top_n = data.get('top_n', 10)
        
        meals_df = pd.DataFrame(recommendation_system['meals_df'])
        
        # Filter by meal type
        if meal_type:
            meals_df = meals_df[meals_df['category'] == meal_type]
        
        # Calculate calorie target for this meal (30% of daily)
        meal_calorie_target = daily_calories * 0.3
        
        # Score each meal based on multiple factors
        scores = []
        for idx, meal in meals_df.iterrows():
            score = 100  # Start with perfect score
            
            # 1. Calorie match (40% weight) - prefer within ±200 calories
            calorie_diff = abs(meal['calories'] - meal_calorie_target)
            calorie_score = max(0, 100 - (calorie_diff / 10))
            score -= (100 - calorie_score) * 0.4
            
            # 2. Macro match (30% weight)
            protein_ratio_target = (target_protein * 4) / daily_calories
            carb_ratio_target = (target_carbs * 4) / daily_calories
            fat_ratio_target = (target_fats * 9) / daily_calories
            
            meal_calories = meal['calories'] if meal['calories'] > 0 else 1
            protein_ratio = (meal['protein'] * 4) / meal_calories
            carb_ratio = (meal['carbohydrates'] * 4) / meal_calories
            fat_ratio = (meal['fats'] * 9) / meal_calories
            
            macro_diff = (
                abs(protein_ratio - protein_ratio_target) +
                abs(carb_ratio - carb_ratio_target) +
                abs(fat_ratio - fat_ratio_target)
            ) / 3
            macro_score = max(0, 100 - (macro_diff * 200))
            score -= (100 - macro_score) * 0.3
            
            # 3. Dietary preferences (20% weight)
            dietary_match = 0
            if not dietary_preferences or 'none' in dietary_preferences:
                dietary_match = 100
            else:
                meal_tags = set(meal['dietaryTags'])
                pref_tags = set(dietary_preferences)
                if meal_tags & pref_tags:
                    dietary_match = 100
                else:
                    dietary_match = 50  # Partial match
            score -= (100 - dietary_match) * 0.2
            
            # 4. Allergen check (10% weight) - critical factor
            allergen_safe = True
            if allergies:
                meal_allergens = set(meal['allergens'])
                user_allergens = set(allergies)
                if meal_allergens & user_allergens:
                    allergen_safe = False
                    score = 0  # Immediate disqualification
            
            scores.append(score)
        
        meals_df['recommendation_score'] = scores
        
        # Sort by score and get top N
        top_meals = meals_df.nlargest(top_n, 'recommendation_score')
        
        recommendations = []
        for _, meal in top_meals.iterrows():
            recommendations.append({
                'name': meal['name'],
                'score': float(meal['recommendation_score']),
                'calories': meal['calories'],
                'protein': meal['protein'],
                'carbohydrates': meal['carbohydrates'],
                'fats': meal['fats'],
                'fiber': meal['fiber'],
                'category': meal['category'],
                'cuisine': meal['cuisine'],
                'dietary_tags': meal['dietaryTags'],
                'allergens': meal['allergens'],
                'cook_time': meal['cookTime']
            })
        
        return jsonify({
            'success': True,
            'user_preferences': {
                'daily_calories': daily_calories,
                'target_protein': target_protein,
                'target_carbs': target_carbs,
                'target_fats': target_fats,
                'dietary_preferences': dietary_preferences,
                'allergies': allergies,
                'meal_type': meal_type
            },
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Personalized recommendation error: {str(e)}'
        }), 500


@app.route('/recommend/stats', methods=['GET'])
def recommendation_stats():
    """Get statistics about the recommendation system"""
    try:
        if not RECOMMENDATION_LOADED:
            return jsonify({
                'success': False,
                'message': 'Recommendation system not available'
            }), 503
        
        import json
        with open('models/recommendation_stats.json', 'r') as f:
            stats = json.load(f)
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Stats error: {str(e)}'
        }), 500

# ======================
# Error Handlers
# ======================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

# ======================
# Run Server
# ======================

if __name__ == '__main__':
    print(f"🚀 Starting NutriGuide ML Service on port {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=(os.getenv('FLASK_ENV') != 'production'))
    print(f"📊 Model Status: {'Loaded' if MODEL_LOADED else 'Using Fallback Calculation'}")
    app.run(host='0.0.0.0', port=PORT, debug=True)
