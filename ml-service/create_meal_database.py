"""
NutriGuide AI - Meal Database Creator
Extracts meals from Kaggle recipes dataset and creates seed data for MongoDB
"""

import pandas as pd
import numpy as np
import json
import ast
import os
from datetime import datetime

# Configuration
KAGGLE_DATA_PATH = '../datasets/archive/RAW_recipes.csv'
OUTPUT_PATH = '../backend/seeds/meals_seed.json'
MAX_MEALS = 500  # Limit for database seeding

print("=" * 60)
print("NUTRIGUIDE AI - MEAL DATABASE CREATOR")
print("=" * 60)

def parse_nutrition(nutrition_str):
    """Parse nutrition list from string"""
    try:
        nutrition = ast.literal_eval(nutrition_str)
        # Format: [calories, total_fat, sugar, sodium, protein, sat_fat, carbs]
        return {
            'calories': float(nutrition[0]) if len(nutrition) > 0 else 0,
            'total_fat': float(nutrition[1]) if len(nutrition) > 1 else 0,
            'sugar': float(nutrition[2]) if len(nutrition) > 2 else 0,
            'sodium': float(nutrition[3]) if len(nutrition) > 3 else 0,
            'protein': float(nutrition[4]) if len(nutrition) > 4 else 0,
            'saturated_fat': float(nutrition[5]) if len(nutrition) > 5 else 0,
            'carbohydrates': float(nutrition[6]) if len(nutrition) > 6 else 0
        }
    except:
        return None


def categorize_meal(tags, name, minutes):
    """Determine meal category based on tags and name"""
    tags_lower = [str(t).lower() for t in tags]
    name_lower = name.lower()
    
    # Breakfast indicators
    breakfast_keywords = ['breakfast', 'brunch', 'morning', 'oatmeal', 'cereal', 'pancake', 'waffle', 'eggs']
    if any(kw in name_lower or kw in ' '.join(tags_lower) for kw in breakfast_keywords):
        return 'breakfast'
    
    # Snack indicators
    snack_keywords = ['snack', 'appetizer', 'finger-food', 'bar', 'cookie', 'muffin']
    if any(kw in ' '.join(tags_lower) for kw in snack_keywords):
        return 'snack'
    
    # Quick meals (under 20 min) are often lunch
    if minutes < 20:
        return 'lunch'
    
    # Dessert
    dessert_keywords = ['dessert', 'sweet', 'cake', 'pie', 'pudding']
    if any(kw in ' '.join(tags_lower) for kw in dessert_keywords):
        return 'dessert'
    
    # Default to dinner for longer cooking times
    if minutes > 30:
        return 'dinner'
    
    return 'lunch'


def extract_cuisine(tags):
    """Extract cuisine type from tags"""
    cuisines = ['mexican', 'italian', 'chinese', 'indian', 'thai', 'japanese', 
                'french', 'greek', 'spanish', 'american', 'middle-eastern']
    
    tags_lower = [str(t).lower() for t in tags]
    for cuisine in cuisines:
        if cuisine in ' '.join(tags_lower):
            return cuisine
    
    return 'american'


def extract_dietary_tags(tags, nutrition):
    """Extract dietary preference tags"""
    dietary_tags = []
    tags_str = ' '.join([str(t).lower() for t in tags])
    
    if 'vegetarian' in tags_str:
        dietary_tags.append('vegetarian')
    if 'vegan' in tags_str:
        dietary_tags.append('vegan')
    if 'gluten-free' in tags_str or 'gluten free' in tags_str:
        dietary_tags.append('gluten_free')
    if 'low-calorie' in tags_str or nutrition['calories'] < 200:
        dietary_tags.append('low_calorie')
    if 'low-carb' in tags_str or nutrition['carbohydrates'] < 15:
        dietary_tags.append('low_carb')
    if 'high-protein' in tags_str or nutrition['protein'] > 25:
        dietary_tags.append('high_protein')
    if 'low-fat' in tags_str or nutrition['total_fat'] < 5:
        dietary_tags.append('low_fat')
    if 'dairy-free' in tags_str or 'lactose-free' in tags_str:
        dietary_tags.append('dairy_free')
    
    return dietary_tags if dietary_tags else ['none']


def extract_allergens(ingredients, tags):
    """Identify common allergens"""
    allergens = []
    
    ingredients_str = ' '.join([str(i).lower() for i in ingredients])
    tags_str = ' '.join([str(t).lower() for t in tags])
    combined = ingredients_str + ' ' + tags_str
    
    allergen_map = {
        'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
        'eggs': ['egg', 'eggs'],
        'nuts': ['peanut', 'almond', 'walnut', 'cashew', 'pecan'],
        'soy': ['soy', 'tofu', 'tempeh'],
        'wheat': ['wheat', 'flour', 'bread'],
        'shellfish': ['shrimp', 'crab', 'lobster', 'shellfish'],
        'fish': ['fish', 'salmon', 'tuna', 'cod']
    }
    
    for allergen, keywords in allergen_map.items():
        if any(kw in combined for kw in keywords):
            allergens.append(allergen)
    
    return allergens


def parse_ingredients(ingredients_str):
    """Parse ingredients list"""
    try:
        ingredients_list = ast.literal_eval(ingredients_str)
        # Take first 10 ingredients to keep it manageable
        return [{'name': ing.strip(), 'quantity': '', 'unit': ''} 
                for ing in ingredients_list[:10]]
    except:
        return []


def main():
    print("\n[1/4] Loading Kaggle recipes dataset...")
    
    # Load dataset
    try:
        df = pd.read_csv(KAGGLE_DATA_PATH)
        print(f"✓ Loaded {len(df):,} recipes")
    except Exception as e:
        print(f"✗ Error loading dataset: {e}")
        return
    
    print("\n[2/4] Processing and filtering recipes...")
    
    # Parse nutrition
    df['nutrition_parsed'] = df['nutrition'].apply(parse_nutrition)
    df = df[df['nutrition_parsed'].notna()]
    
    # Filter valid recipes
    df = df[
        (df['nutrition_parsed'].apply(lambda x: x['calories'] > 0 if x else False)) &
        (df['nutrition_parsed'].apply(lambda x: x['calories'] < 2000 if x else False)) &
        (df['name'].notna()) &
        (df['description'].notna())
    ]
    
    print(f"✓ Filtered to {len(df):,} valid recipes")
    
    # Parse tags
    df['tags_list'] = df['tags'].apply(lambda x: ast.literal_eval(x) if pd.notna(x) else [])
    
    # Select diverse meals
    # Prioritize: varied calories, varied categories, high ratings
    df = df.sample(min(MAX_MEALS * 2, len(df)), random_state=42)  # Oversample then filter
    
    print("\n[3/4] Creating meal documents...")
    
    meals = []
    
    for idx, row in df.iterrows():
        nutrition = row['nutrition_parsed']
        
        # Calculate fiber estimate (not in dataset, approximate)
        fiber = nutrition['carbohydrates'] * 0.15  # Rough estimate: 15% of carbs
        
        meal = {
            'name': row['name'].strip().title(),
            'description': row['description'][:200] if pd.notna(row['description']) else '',
            'category': categorize_meal(row['tags_list'], row['name'], row['minutes']),
            'cuisine': extract_cuisine(row['tags_list']),
            'nutrition': {
                'calories': round(nutrition['calories'], 1),
                'protein': round(nutrition['protein'], 1),
                'carbohydrates': round(nutrition['carbohydrates'], 1),
                'fats': round(nutrition['total_fat'], 1),
                'fiber': round(fiber, 1),
                'sugar': round(nutrition['sugar'], 1),
                'sodium': round(nutrition['sodium'], 1)
            },
            'servingSize': '1 serving',
            'dietaryTags': extract_dietary_tags(row['tags_list'], nutrition),
            'allergens': extract_allergens(
                ast.literal_eval(row['ingredients']) if pd.notna(row['ingredients']) else [],
                row['tags_list']
            ),
            'ingredients': parse_ingredients(row['ingredients']) if pd.notna(row['ingredients']) else [],
            'prepTime': 5,
            'cookTime': int(row['minutes']) if pd.notna(row['minutes']) else 30,
            'popularity': 0,
            'rating': 4.0,
            'isActive': True,
            'source': 'kaggle_food_com',
            'recipeId': int(row['id']) if pd.notna(row['id']) else None
        }
        
        meals.append(meal)
        
        if len(meals) >= MAX_MEALS:
            break
    
    print(f"✓ Created {len(meals)} meal documents")
    
    # Statistics
    categories = pd.Series([m['category'] for m in meals]).value_counts()
    print(f"\n  Category distribution:")
    for cat, count in categories.items():
        print(f"    - {cat}: {count}")
    
    cuisines = pd.Series([m['cuisine'] for m in meals]).value_counts().head(5)
    print(f"\n  Top cuisines:")
    for cuisine, count in cuisines.items():
        print(f"    - {cuisine}: {count}")
    
    print("\n[4/4] Saving to JSON file...")
    
    # Create output directory
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # Save to JSON
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(meals, f, indent=2)
    
    print(f"✓ Saved to: {OUTPUT_PATH}")
    
    # Also save simple nutrition.csv for quick reference
    nutrition_csv_path = '../datasets/processed_meals.csv'
    meals_df = pd.DataFrame([{
        'name': m['name'],
        'category': m['category'],
        'calories': m['nutrition']['calories'],
        'protein': m['nutrition']['protein'],
        'carbs': m['nutrition']['carbohydrates'],
        'fats': m['nutrition']['fats']
    } for m in meals])
    
    meals_df.to_csv(nutrition_csv_path, index=False)
    print(f"✓ Also saved CSV to: {nutrition_csv_path}")
    
    print("\n" + "=" * 60)
    print("MEAL DATABASE CREATION COMPLETE!")
    print("=" * 60)
    print(f"\n✓ Created {len(meals)} diverse meals from Kaggle dataset")
    print(f"✓ Ready to seed MongoDB database")
    print(f"\nNext steps:")
    print(f"  1. Start MongoDB")
    print(f"  2. Run backend: cd ../backend && npm run seed")
    print(f"  3. This will populate your meals collection")
    print("=" * 60)


if __name__ == '__main__':
    main()
