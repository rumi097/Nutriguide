"""
NutriGuide AI - Meal Recommendation Model Training
Trains a content-based recommendation system for suggesting meals to users
Uses TF-IDF, cosine similarity, and user preference matching
"""

import numpy as np
import pandas as pd
import json
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, MultiLabelBinarizer
import ast

print("=" * 60)
print("NUTRIGUIDE AI - MEAL RECOMMENDATION MODEL TRAINING")
print("=" * 60)

# Configuration
OUTPUT_DIR = 'models'
MEALS_PATH = '../backend/seeds/meals_seed.json'

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ======================
# Load Meal Data
# ======================

print("\n[1/6] Loading meal database...")

try:
    with open(MEALS_PATH, 'r') as f:
        meals_data = json.load(f)
    
    meals_df = pd.DataFrame(meals_data)
    print(f"✓ Loaded {len(meals_df)} meals")
    
except Exception as e:
    print(f"✗ Error loading meals: {e}")
    print("  Please run: cd ml-service && python create_meal_database.py")
    exit(1)

# ======================
# Feature Engineering
# ======================

print("\n[2/6] Engineering features for recommendation...")

# Extract nutrition features
meals_df['calories'] = meals_df['nutrition'].apply(lambda x: x.get('calories', 0))
meals_df['protein'] = meals_df['nutrition'].apply(lambda x: x.get('protein', 0))
meals_df['carbohydrates'] = meals_df['nutrition'].apply(lambda x: x.get('carbohydrates', 0))
meals_df['fats'] = meals_df['nutrition'].apply(lambda x: x.get('fats', 0))
meals_df['fiber'] = meals_df['nutrition'].apply(lambda x: x.get('fiber', 0))

# Calculate derived features
meals_df['protein_ratio'] = meals_df['protein'] * 4 / meals_df['calories'].replace(0, 1)
meals_df['carb_ratio'] = meals_df['carbohydrates'] * 4 / meals_df['calories'].replace(0, 1)
meals_df['fat_ratio'] = meals_df['fats'] * 9 / meals_df['calories'].replace(0, 1)

# Create text features for TF-IDF
meals_df['text_features'] = (
    meals_df['name'].fillna('') + ' ' +
    meals_df['description'].fillna('') + ' ' +
    meals_df['category'].fillna('') + ' ' +
    meals_df['cuisine'].fillna('') + ' ' +
    meals_df['dietaryTags'].apply(lambda x: ' '.join(x) if isinstance(x, list) else '')
)

print(f"✓ Created nutrition and text features")

# ======================
# Content-Based Features
# ======================

print("\n[3/6] Building content-based recommendation system...")

# TF-IDF for text features
tfidf = TfidfVectorizer(
    max_features=100,
    stop_words='english',
    ngram_range=(1, 2)
)

tfidf_matrix = tfidf.fit_transform(meals_df['text_features'])
print(f"✓ TF-IDF matrix shape: {tfidf_matrix.shape}")

# Multi-label binarizer for dietary tags
mlb_dietary = MultiLabelBinarizer()
dietary_matrix = mlb_dietary.fit_transform(meals_df['dietaryTags'])
print(f"✓ Dietary tags encoded: {dietary_matrix.shape}")

# Multi-label binarizer for allergens
mlb_allergens = MultiLabelBinarizer()
allergen_matrix = mlb_allergens.fit_transform(meals_df['allergens'])
print(f"✓ Allergens encoded: {allergen_matrix.shape}")

# Nutrition features (scaled)
nutrition_features = meals_df[[
    'calories', 'protein', 'carbohydrates', 'fats', 'fiber',
    'protein_ratio', 'carb_ratio', 'fat_ratio'
]].fillna(0)

scaler_nutrition = StandardScaler()
nutrition_scaled = scaler_nutrition.fit_transform(nutrition_features)
print(f"✓ Nutrition features scaled: {nutrition_scaled.shape}")

# ======================
# Combined Feature Matrix
# ======================

print("\n[4/6] Combining features...")

# Combine all features with different weights
# TF-IDF: 40%, Nutrition: 40%, Dietary: 15%, Allergens: 5%
combined_features = np.hstack([
    tfidf_matrix.toarray() * 0.4,
    nutrition_scaled * 0.4,
    dietary_matrix * 0.15,
    allergen_matrix * 0.05
])

print(f"✓ Combined feature matrix: {combined_features.shape}")

# ======================
# Similarity Matrix
# ======================

print("\n[5/6] Computing similarity matrix...")

# Compute cosine similarity between all meals
similarity_matrix = cosine_similarity(combined_features)
print(f"✓ Similarity matrix computed: {similarity_matrix.shape}")

# Statistics
print(f"  Average similarity: {similarity_matrix.mean():.3f}")
print(f"  Max similarity: {similarity_matrix.max():.3f}")
print(f"  Min similarity (non-self): {similarity_matrix[~np.eye(len(similarity_matrix), dtype=bool)].min():.3f}")

# ======================
# Save Models and Data
# ======================

print("\n[6/6] Saving recommendation system...")

# Save all components
recommendation_system = {
    'similarity_matrix': similarity_matrix,
    'tfidf_vectorizer': tfidf,
    'mlb_dietary': mlb_dietary,
    'mlb_allergens': mlb_allergens,
    'scaler_nutrition': scaler_nutrition,
    'meals_df': meals_df[[
        'name', 'category', 'cuisine', 'calories', 
        'protein', 'carbohydrates', 'fats', 'fiber',
        'dietaryTags', 'allergens', 'cookTime'
    ]].to_dict('records'),
    'feature_weights': {
        'tfidf': 0.4,
        'nutrition': 0.4,
        'dietary': 0.15,
        'allergens': 0.05
    }
}

# Save the system
model_path = os.path.join(OUTPUT_DIR, 'meal_recommendation_system.pkl')
joblib.dump(recommendation_system, model_path)
print(f"✓ Recommendation system saved: {model_path}")

# Create index mapping
meal_index = {
    meal['name']: idx 
    for idx, meal in enumerate(recommendation_system['meals_df'])
}
index_path = os.path.join(OUTPUT_DIR, 'meal_index.json')
with open(index_path, 'w') as f:
    json.dump(meal_index, f, indent=2)
print(f"✓ Meal index saved: {index_path}")

# ======================
# Test Recommendations
# ======================

print("\n[Testing] Sample recommendations...")

def get_recommendations(meal_name, top_n=5):
    """Get similar meal recommendations"""
    if meal_name not in meal_index:
        return []
    
    meal_idx = meal_index[meal_name]
    similarities = similarity_matrix[meal_idx]
    
    # Get top N similar meals (excluding itself)
    similar_indices = similarities.argsort()[::-1][1:top_n+1]
    
    recommendations = []
    for idx in similar_indices:
        meal = recommendation_system['meals_df'][idx]
        recommendations.append({
            'name': meal['name'],
            'similarity': float(similarities[idx]),
            'calories': meal['calories'],
            'category': meal['category']
        })
    
    return recommendations

# Test with a few meals
test_meals = [
    meals_df.iloc[0]['name'],  # First meal
    meals_df[meals_df['category'] == 'breakfast'].iloc[0]['name'] if len(meals_df[meals_df['category'] == 'breakfast']) > 0 else None,
    meals_df[meals_df['category'] == 'dinner'].iloc[0]['name'] if len(meals_df[meals_df['category'] == 'dinner']) > 0 else None
]

for meal_name in test_meals:
    if meal_name:
        print(f"\n  Similar to '{meal_name}':")
        recs = get_recommendations(meal_name, 3)
        for i, rec in enumerate(recs, 1):
            print(f"    {i}. {rec['name']} (similarity: {rec['similarity']:.3f}, {rec['calories']:.0f} cal)")

# ======================
# Save Statistics
# ======================

stats = {
    'total_meals': len(meals_df),
    'categories': meals_df['category'].value_counts().to_dict(),
    'cuisines': meals_df['cuisine'].value_counts().head(5).to_dict(),
    'avg_calories': float(meals_df['calories'].mean()),
    'feature_dimensions': {
        'tfidf': tfidf_matrix.shape[1],
        'nutrition': nutrition_scaled.shape[1],
        'dietary': dietary_matrix.shape[1],
        'allergens': allergen_matrix.shape[1],
        'combined': combined_features.shape[1]
    },
    'similarity_stats': {
        'mean': float(similarity_matrix.mean()),
        'std': float(similarity_matrix.std()),
        'min_non_self': float(similarity_matrix[~np.eye(len(similarity_matrix), dtype=bool)].min()),
        'max_non_self': float(similarity_matrix[~np.eye(len(similarity_matrix), dtype=bool)].max())
    }
}

stats_path = os.path.join(OUTPUT_DIR, 'recommendation_stats.json')
with open(stats_path, 'w') as f:
    json.dump(stats, f, indent=2)
print(f"\n✓ Statistics saved: {stats_path}")

print("\n" + "=" * 60)
print("MEAL RECOMMENDATION SYSTEM COMPLETE!")
print("=" * 60)
print(f"\n✓ Recommendation system ready")
print(f"✓ {len(meals_df)} meals indexed")
print(f"✓ Feature dimension: {combined_features.shape[1]}")
print(f"✓ Similarity matrix computed")
print(f"\nNext step: Update Flask API to use this system")
print("=" * 60)
