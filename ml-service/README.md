# NutriGuide ML Service

## Overview
Python-based machine learning service for NutriGuide AI. Provides personalized nutrition predictions using trained ML models.

## Setup

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Train the model:
```bash
python train_model.py
```

4. Start ML service:
```bash
python app.py
```

Service runs on: http://localhost:5001

## Project Structure

```
ml-service/
├── app.py                  # Flask API server
├── train_model.py          # Model training script
├── preprocess_data.py      # Data preprocessing
├── models/                 # Trained models (.pkl)
├── data/                   # Training datasets
└── requirements.txt        # Python dependencies
```

## API Endpoints

### Health Check
```http
GET /health
```

### Prediction
```http
POST /predict
Content-Type: application/json

{
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "activity_level": "moderate",
  "fitness_goal": "maintain_weight"
}
```

Response:
```json
{
  "success": true,
  "daily_calories": 2400,
  "macronutrients": {
    "protein": 180,
    "carbs": 240,
    "fats": 80
  },
  "bmi": 22.86,
  "bmr": 1680,
  "tdee": 2604,
  "recommendations": [
    "Your BMI is in the healthy range...",
    "Keep a consistent routine...",
    "Drink at least 8-10 glasses of water daily."
  ]
}
```

### Batch Prediction
```http
POST /batch-predict
Content-Type: application/json

{
  "users": [
    { "age": 25, "gender": "male", ... },
    { "age": 30, "gender": "female", ... }
  ]
}
```

## Machine Learning Model

### Algorithm
- **Primary**: Gradient Boosting Regressor
- **Alternatives**: Random Forest, Linear Regression

### Features
1. Age (years)
2. Gender (encoded: 1=male, 0=female, 0.5=other)
3. Height (cm)
4. Weight (kg)
5. BMI (calculated)
6. BMR (Basal Metabolic Rate)
7. Activity Level (0-4 scale)
8. Fitness Goal (0-4 scale)

### Training Process

1. **Data Generation** (or load from Kaggle):
```bash
python preprocess_data.py
```

2. **Train Model**:
```bash
python train_model.py
```

Output:
- `models/nutrition_model.pkl` - Trained model
- `models/scaler.pkl` - Feature scaler
- `data/training_data.csv` - Training dataset

3. **Evaluation Metrics**:
- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)
- R² Score
- Feature importance

### Formulas Used

**BMI (Body Mass Index)**:
```
BMI = weight (kg) / (height (m))²
```

**BMR (Basal Metabolic Rate)** - Mifflin-St Jeor Equation:
```
Men:   BMR = 10 × weight + 6.25 × height - 5 × age + 5
Women: BMR = 10 × weight + 6.25 × height - 5 × age - 161
```

**TDEE (Total Daily Energy Expenditure)**:
```
TDEE = BMR × Activity Multiplier

Activity Multipliers:
- Sedentary:    1.2  (little/no exercise)
- Light:        1.375 (1-3 days/week)
- Moderate:     1.55  (3-5 days/week)
- Active:       1.725 (6-7 days/week)
- Very Active:  1.9   (intense daily)
```

**Daily Calorie Target**:
```
Target = TDEE + Goal Adjustment

Goal Adjustments:
- Lose Weight:     -500 calories
- Maintain Weight:    0 calories
- Gain Weight:     +500 calories
- Build Muscle:    +300 calories
- Improve Health:     0 calories
```

**Macronutrient Distribution** (varies by goal):
```
Protein: 25-35% of calories (÷ 4 for grams)
Carbs:   35-45% of calories (÷ 4 for grams)
Fats:    25-30% of calories (÷ 9 for grams)
```

## Using Real Datasets

### Recommended Kaggle Datasets

1. **Food Nutrition Dataset**
   - https://www.kaggle.com/datasets/tags/nutrition

2. **USDA Food Composition**
   - Comprehensive nutritional data

3. **MyFitnessPal Foods**
   - Large meal database

### How to Use

1. Download dataset from Kaggle
2. Place in `data/raw_nutrition_data.csv`
3. Run preprocessing:
```bash
python preprocess_data.py
```
4. Train model:
```bash
python train_model.py
```

## Model Performance

Expected performance on synthetic data:
- MAE: ~50-100 calories
- R² Score: ~0.85-0.95
- 80%+ predictions within ±200 calories

## Fallback Calculation

If model is not loaded, the service uses formula-based calculation:
- Calculates BMR using Mifflin-St Jeor
- Applies activity multiplier for TDEE
- Adjusts for fitness goal
- Always returns reasonable predictions

## Development

```bash
# Activate virtual environment
source venv/bin/activate

# Install in development mode
pip install -e .

# Run with debug mode
FLASK_DEBUG=True python app.py
```

## Production Considerations

1. **Model Versioning**: Save models with version numbers
2. **A/B Testing**: Test new models before deployment
3. **Monitoring**: Log predictions and accuracy
4. **Caching**: Cache predictions for common inputs
5. **Scaling**: Use gunicorn/uwsgi for production
6. **API Gateway**: Add rate limiting and authentication

## Troubleshooting

**Model file not found:**
- Run `python train_model.py` first
- Check `models/` directory exists

**Import errors:**
- Activate virtual environment
- Install all requirements: `pip install -r requirements.txt`

**Low accuracy:**
- Use real dataset instead of synthetic data
- Increase training data size
- Tune hyperparameters
- Try different algorithms
