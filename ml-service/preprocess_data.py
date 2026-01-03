"""
Data Preprocessing Script for NutriGuide AI
Handles cleaning, transformation, and preparation of nutrition datasets

This script should be used to preprocess Kaggle nutrition datasets before training.
Example datasets you can use:
1. USDA Food Composition Database
2. MyFitnessPal Food Database
3. Nutrition and Diet datasets from Kaggle
4. Recipe Ingredients and Nutrition dataset
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import os

# ======================
# Configuration
# ======================
INPUT_FILE = 'data/raw_nutrition_data.csv'  # Update with your Kaggle dataset path
OUTPUT_FILE = 'data/processed_nutrition_data.csv'

# ======================
# Data Loading
# ======================

def load_dataset(filepath):
    """
    Load nutrition dataset from CSV
    """
    print(f"📂 Loading dataset from {filepath}...")
    
    try:
        df = pd.read_csv(filepath)
        print(f"✅ Loaded {len(df)} rows and {len(df.columns)} columns")
        print(f"\nColumns: {list(df.columns)}")
        return df
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        print("\n📝 Instructions:")
        print("1. Download a nutrition dataset from Kaggle")
        print("2. Place it in the 'data' folder")
        print("3. Update INPUT_FILE variable with the correct filename")
        return None

# ======================
# Data Cleaning
# ======================

def clean_dataset(df):
    """
    Clean the dataset by handling missing values and outliers
    """
    print("\n🧹 Cleaning dataset...")
    
    initial_rows = len(df)
    
    # Display missing values
    missing_values = df.isnull().sum()
    if missing_values.sum() > 0:
        print("\nMissing values per column:")
        print(missing_values[missing_values > 0])
        
        # Handle missing values
        # Strategy 1: Drop rows with too many missing values
        threshold = len(df.columns) * 0.5
        df = df.dropna(thresh=threshold)
        
        # Strategy 2: Fill remaining missing values
        # For numerical columns, fill with median
        numerical_cols = df.select_dtypes(include=[np.number]).columns
        df[numerical_cols] = df[numerical_cols].fillna(df[numerical_cols].median())
        
        # For categorical columns, fill with mode
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Remove outliers using IQR method for key nutritional columns
    nutrition_cols = ['calories', 'protein', 'carbohydrates', 'fats']
    existing_nutrition_cols = [col for col in nutrition_cols if col in df.columns]
    
    for col in existing_nutrition_cols:
        Q1 = df[col].quantile(0.01)
        Q3 = df[col].quantile(0.99)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
    
    final_rows = len(df)
    print(f"✅ Removed {initial_rows - final_rows} rows during cleaning")
    print(f"   Final dataset size: {final_rows} rows")
    
    return df

# ======================
# Feature Engineering
# ======================

def engineer_nutrition_features(df):
    """
    Create additional features from nutrition data
    """
    print("\n🔧 Engineering features...")
    
    # Calculate calories from macronutrients if not present
    if 'calories' not in df.columns and all(col in df.columns for col in ['protein', 'carbohydrates', 'fats']):
        df['calories_calculated'] = (df['protein'] * 4) + (df['carbohydrates'] * 4) + (df['fats'] * 9)
    
    # Calculate macro ratios
    if 'calories' in df.columns:
        if 'protein' in df.columns:
            df['protein_ratio'] = (df['protein'] * 4) / df['calories']
        if 'carbohydrates' in df.columns:
            df['carbs_ratio'] = (df['carbohydrates'] * 4) / df['calories']
        if 'fats' in df.columns:
            df['fats_ratio'] = (df['fats'] * 9) / df['calories']
    
    # Calorie density (calories per 100g)
    if 'calories' in df.columns and 'serving_size' in df.columns:
        df['calorie_density'] = df['calories'] / (df['serving_size'] / 100)
    
    # Create nutritional quality score (simple version)
    if all(col in df.columns for col in ['protein', 'fiber']):
        df['quality_score'] = df['protein'] + df.get('fiber', 0) * 2
    
    print(f"✅ Feature engineering complete")
    
    return df

# ======================
# Data Transformation
# ======================

def encode_categorical_variables(df):
    """
    Encode categorical variables into numerical format
    """
    print("\n🔢 Encoding categorical variables...")
    
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    label_encoders = {}
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col])
        label_encoders[col] = le
        print(f"   Encoded {col}: {len(le.classes_)} unique values")
    
    return df, label_encoders

# ======================
# Data Normalization
# ======================

def normalize_features(df, columns_to_normalize):
    """
    Normalize numerical features using StandardScaler
    """
    print("\n📊 Normalizing numerical features...")
    
    scaler = StandardScaler()
    
    existing_cols = [col for col in columns_to_normalize if col in df.columns]
    
    if existing_cols:
        df[existing_cols] = scaler.fit_transform(df[existing_cols])
        print(f"✅ Normalized {len(existing_cols)} columns")
    
    return df, scaler

# ======================
# Data Export
# ======================

def save_processed_data(df, filepath):
    """
    Save processed dataset to CSV
    """
    print(f"\n💾 Saving processed data to {filepath}...")
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    
    print(f"✅ Saved {len(df)} rows")
    print(f"\nProcessed dataset info:")
    print(df.info())

# ======================
# Main Pipeline
# ======================

def main():
    """
    Main data preprocessing pipeline
    """
    print("=" * 60)
    print("NutriGuide AI - Data Preprocessing Pipeline")
    print("=" * 60)
    
    # Load dataset
    df = load_dataset(INPUT_FILE)
    
    if df is None:
        print("\n⚠️  No dataset found. Using synthetic data generation instead.")
        print("   To use real data:")
        print("   1. Download nutrition dataset from Kaggle")
        print("   2. Place in 'data/raw_nutrition_data.csv'")
        print("   3. Run this script again")
        return
    
    # Display initial statistics
    print("\n📊 Initial Dataset Statistics:")
    print(df.describe())
    
    # Clean dataset
    df = clean_dataset(df)
    
    # Engineer features
    df = engineer_nutrition_features(df)
    
    # Encode categorical variables
    df, label_encoders = encode_categorical_variables(df)
    
    # Save processed data
    save_processed_data(df, OUTPUT_FILE)
    
    print("\n" + "=" * 60)
    print("✅ Preprocessing Complete!")
    print("=" * 60)
    print(f"\nProcessed data saved to: {OUTPUT_FILE}")
    print("Next step: Run train_model.py to train the ML model")

if __name__ == '__main__':
    main()
