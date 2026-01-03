"""
NutriGuide AI - Machine Learning Model Training Script
Trains a regression model to predict daily calorie requirements
Uses synthetic data generation for demonstration (replace with Kaggle dataset)
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

# ======================
# Configuration
# ======================
OUTPUT_DIR = 'models'
DATA_DIR = 'data'
MODEL_FILENAME = 'nutrition_model.pkl'
SCALER_FILENAME = 'scaler.pkl'

# Create directories if they don't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# ======================
# Data Generation
# ======================

def generate_synthetic_dataset(n_samples=5000):
    """
    Generate synthetic nutrition dataset for training
    
    NOTE: In production, replace this with real data from:
    - Kaggle Nutrition datasets
    - USDA Food Composition Database
    - MyFitnessPal data
    - Custom collected data
    
    Features:
    - Age (years)
    - Gender (encoded: 1=male, 0=female)
    - Height (cm)
    - Weight (kg)
    - BMI (calculated)
    - BMR (calculated)
    - Activity Level (0-4 scale)
    - Fitness Goal (0-4 scale)
    
    Target:
    - Daily Calorie Requirement
    """
    
    print("🔄 Generating synthetic training data...")
    
    np.random.seed(42)
    
    # Generate features
    age = np.random.randint(18, 70, n_samples)
    gender = np.random.choice([0, 1], n_samples)  # 0=female, 1=male
    height = np.random.normal(170, 10, n_samples)  # cm
    weight = np.random.normal(70, 15, n_samples)   # kg
    
    # Activity level: 0=sedentary, 1=light, 2=moderate, 3=active, 4=very_active
    activity_level = np.random.choice([0, 1, 2, 3, 4], n_samples, p=[0.2, 0.25, 0.3, 0.15, 0.1])
    
    # Fitness goal: 0=lose, 1=maintain, 2=gain, 3=build_muscle, 4=improve_health
    fitness_goal = np.random.choice([0, 1, 2, 3], n_samples, p=[0.35, 0.30, 0.20, 0.15])
    
    # Calculate BMI
    height_m = height / 100
    bmi = weight / (height_m ** 2)
    
    # Calculate BMR using Mifflin-St Jeor equation
    bmr = np.where(
        gender == 1,
        10 * weight + 6.25 * height - 5 * age + 5,      # Male
        10 * weight + 6.25 * height - 5 * age - 161     # Female
    )
    
    # Activity multipliers
    activity_multipliers = [1.2, 1.375, 1.55, 1.725, 1.9]
    multiplier = np.array([activity_multipliers[int(a)] for a in activity_level])
    
    # Calculate TDEE
    tdee = bmr * multiplier
    
    # Goal adjustments
    goal_adjustments = [-500, 0, 500, 300]
    adjustment = np.array([goal_adjustments[int(g)] for g in fitness_goal])
    
    # Calculate target calories (with some noise for realism)
    daily_calories = tdee + adjustment + np.random.normal(0, 50, n_samples)
    
    # Ensure reasonable ranges
    daily_calories = np.clip(daily_calories, 1200, 5000)
    weight = np.clip(weight, 40, 150)
    height = np.clip(height, 140, 210)
    
    # Create DataFrame
    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'height': height,
        'weight': weight,
        'bmi': bmi,
        'bmr': bmr,
        'activity_level': activity_level,
        'fitness_goal': fitness_goal,
        'daily_calories': daily_calories
    })
    
    print(f"✅ Generated {n_samples} samples")
    print(f"\nDataset Statistics:")
    print(df.describe())
    
    return df

# ======================
# Feature Engineering
# ======================

def engineer_features(df):
    """
    Create additional features from raw data
    Feature engineering can significantly improve model performance
    """
    print("\n🔧 Engineering features...")
    
    # Create interaction features
    df['weight_height_ratio'] = df['weight'] / df['height']
    df['bmi_age'] = df['bmi'] * df['age']
    df['bmr_activity'] = df['bmr'] * (df['activity_level'] + 1)
    
    # Polynomial features for age
    df['age_squared'] = df['age'] ** 2
    
    # BMI categories as features
    df['bmi_underweight'] = (df['bmi'] < 18.5).astype(int)
    df['bmi_normal'] = ((df['bmi'] >= 18.5) & (df['bmi'] < 25)).astype(int)
    df['bmi_overweight'] = ((df['bmi'] >= 25) & (df['bmi'] < 30)).astype(int)
    df['bmi_obese'] = (df['bmi'] >= 30).astype(int)
    
    print(f"✅ Created {len(df.columns) - 9} additional features")
    
    return df

# ======================
# Model Training
# ======================

def train_model(df):
    """
    Train multiple models and select the best performer
    """
    print("\n🤖 Training machine learning models...")
    
    # Separate features and target
    feature_columns = [col for col in df.columns if col != 'daily_calories']
    X = df[feature_columns]
    y = df['daily_calories']
    
    # Split data into training and testing sets (80-20 split)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")
    
    # Feature scaling
    print("\n📊 Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train multiple models
    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        ),
        'Gradient Boosting': GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\n🔄 Training {name}...")
        
        # Train model
        model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred_train = model.predict(X_train_scaled)
        y_pred_test = model.predict(X_test_scaled)
        
        # Calculate metrics
        train_mae = mean_absolute_error(y_train, y_pred_train)
        test_mae = mean_absolute_error(y_test, y_pred_test)
        train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
        test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
        train_r2 = r2_score(y_train, y_pred_train)
        test_r2 = r2_score(y_test, y_pred_test)
        
        results[name] = {
            'model': model,
            'train_mae': train_mae,
            'test_mae': test_mae,
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'train_r2': train_r2,
            'test_r2': test_r2
        }
        
        print(f"  Train MAE: {train_mae:.2f} calories")
        print(f"  Test MAE:  {test_mae:.2f} calories")
        print(f"  Train R²:  {train_r2:.4f}")
        print(f"  Test R²:   {test_r2:.4f}")
    
    # Select best model based on test MAE
    best_model_name = min(results, key=lambda x: results[x]['test_mae'])
    best_model = results[best_model_name]['model']
    
    print(f"\n🏆 Best Model: {best_model_name}")
    print(f"   Test MAE: {results[best_model_name]['test_mae']:.2f} calories")
    print(f"   Test R²: {results[best_model_name]['test_r2']:.4f}")
    
    return best_model, scaler, results

# ======================
# Model Evaluation
# ======================

def evaluate_model(model, scaler, df):
    """
    Evaluate model performance with detailed analysis
    """
    print("\n📈 Evaluating model performance...")
    
    feature_columns = [col for col in df.columns if col != 'daily_calories']
    X = df[feature_columns]
    y = df['daily_calories']
    
    X_scaled = scaler.transform(X)
    predictions = model.predict(X_scaled)
    
    # Calculate errors
    errors = y - predictions
    
    print(f"\nPrediction Statistics:")
    print(f"  Mean Actual: {y.mean():.2f} calories")
    print(f"  Mean Predicted: {predictions.mean():.2f} calories")
    print(f"  Mean Absolute Error: {np.abs(errors).mean():.2f} calories")
    print(f"  Standard Deviation of Errors: {errors.std():.2f} calories")
    print(f"  Within ±100 calories: {(np.abs(errors) <= 100).sum() / len(errors) * 100:.1f}%")
    print(f"  Within ±200 calories: {(np.abs(errors) <= 200).sum() / len(errors) * 100:.1f}%")
    
    # Feature importance (if available)
    if hasattr(model, 'feature_importances_'):
        print("\n🔍 Top 5 Most Important Features:")
        importances = pd.DataFrame({
            'feature': feature_columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        for idx, row in importances.head(5).iterrows():
            print(f"  {row['feature']}: {row['importance']:.4f}")

# ======================
# Model Persistence
# ======================

def save_model(model, scaler):
    """
    Save trained model and scaler to disk
    """
    print(f"\n💾 Saving model to {OUTPUT_DIR}/...")
    
    model_path = os.path.join(OUTPUT_DIR, MODEL_FILENAME)
    scaler_path = os.path.join(OUTPUT_DIR, SCALER_FILENAME)
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"✅ Model saved: {model_path}")
    print(f"✅ Scaler saved: {scaler_path}")

# ======================
# Main Execution
# ======================

def main():
    """
    Main training pipeline
    """
    print("=" * 60)
    print("NutriGuide AI - Model Training Pipeline")
    print("=" * 60)
    
    # Generate dataset
    df = generate_synthetic_dataset(n_samples=5000)
    
    # Engineer features
    df = engineer_features(df)
    
    # Save dataset for reference
    dataset_path = os.path.join(DATA_DIR, 'training_data.csv')
    df.to_csv(dataset_path, index=False)
    print(f"\n💾 Dataset saved: {dataset_path}")
    
    # Train model
    model, scaler, results = train_model(df)
    
    # Evaluate model
    evaluate_model(model, scaler, df)
    
    # Save model
    save_model(model, scaler)
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print("\nNext Steps:")
    print("1. Review model performance metrics")
    print("2. Start the Flask API server: python app.py")
    print("3. Test predictions using the /predict endpoint")
    print("\nFor production:")
    print("- Replace synthetic data with real nutrition dataset from Kaggle")
    print("- Perform hyperparameter tuning")
    print("- Add cross-validation")
    print("- Implement model versioning")

if __name__ == '__main__':
    main()
