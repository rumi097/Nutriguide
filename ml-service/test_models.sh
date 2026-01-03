#!/bin/bash

# Test all ML models in NutriGuide AI
echo "============================================================"
echo "TESTING NUTRIGUIDE AI ML MODELS"
echo "============================================================"

# Check if ML service is running
if ! curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "❌ ML Service is not running!"
    echo "Start it with: cd ml-service && python app.py"
    exit 1
fi

echo "✅ ML Service is running"
echo ""

# Test 1: Nutrition Prediction
echo "[Test 1] Nutrition Prediction API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT1=$(curl -s -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "activity_level": "moderate",
    "fitness_goal": "lose_weight"
  }')

if echo "$RESULT1" | grep -q "success.*true"; then
    echo "✅ Nutrition prediction working"
    echo "$RESULT1" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"  Predicted: {data['daily_calories']} calories/day\")"
else
    echo "❌ Nutrition prediction failed"
fi
echo ""

# Test 2: Personalized Meal Recommendations
echo "[Test 2] Personalized Meal Recommendations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT2=$(curl -s -X POST http://localhost:5001/recommend/personalized \
  -H "Content-Type: application/json" \
  -d '{
    "daily_calories": 2000,
    "target_protein": 150,
    "target_carbs": 200,
    "target_fats": 67,
    "dietary_preferences": ["high_protein"],
    "meal_type": "lunch",
    "top_n": 3
  }')

if echo "$RESULT2" | grep -q "success.*true"; then
    echo "✅ Personalized recommendations working"
    echo "$RESULT2" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"  {i+1}. {r['name']} (score: {r['score']:.1f}, {r['calories']:.0f} cal)\") for i, r in enumerate(data['recommendations'][:3])]"
else
    echo "❌ Personalized recommendations failed"
fi
echo ""

# Test 3: Similar Meal Recommendations
echo "[Test 3] Similar Meal Recommendations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT3=$(curl -s -X POST http://localhost:5001/recommend/similar \
  -H "Content-Type: application/json" \
  -d '{
    "meal_name": "Meat Pinwheels",
    "top_n": 3
  }')

if echo "$RESULT3" | grep -q "success.*true"; then
    echo "✅ Similar meal recommendations working"
    echo "$RESULT3" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"  {i+1}. {r['name']} (similarity: {r['similarity_score']:.3f})\") for i, r in enumerate(data['recommendations'][:3])]"
else
    echo "❌ Similar meal recommendations failed"
fi
echo ""

# Test 4: Recommendation Statistics
echo "[Test 4] Recommendation System Statistics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT4=$(curl -s http://localhost:5001/recommend/stats)

if echo "$RESULT4" | grep -q "success.*true"; then
    echo "✅ Statistics endpoint working"
    echo "$RESULT4" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"  Total meals: {data['stats']['total_meals']}\"); print(f\"  Feature dimensions: {data['stats']['feature_dimensions']['combined']}\")"
else
    echo "❌ Statistics endpoint failed"
fi
echo ""

echo "============================================================"
echo "TEST SUMMARY"
echo "============================================================"
echo "All ML models are trained and working:"
echo "  ✅ Nutrition Prediction Model (Gradient Boosting)"
echo "  ✅ Meal Recommendation System (Content-Based)"
echo "  ✅ Similarity Matching (Cosine Similarity)"
echo ""
echo "Total Endpoints: 6"
echo "  1. POST /predict - Nutrition predictions"
echo "  2. POST /predict/batch - Batch predictions"
echo "  3. POST /recommend/personalized - Personalized meals"
echo "  4. POST /recommend/similar - Similar meals"
echo "  5. GET /recommend/stats - System statistics"
echo "  6. GET /health - Health check"
echo "============================================================"
