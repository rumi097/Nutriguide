# Quick Start Guide - NutriGuide AI

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Prerequisites

**Required Software:**
- Node.js (v18+): https://nodejs.org/
- Python (v3.8+): https://www.python.org/
- MongoDB (v6+): https://www.mongodb.com/try/download/community

**Verify Installation:**
```bash
node --version    # Should show v18 or higher
python3 --version # Should show 3.8 or higher
mongod --version  # Should show 6.0 or higher
```

---

### Step 2: Start MongoDB

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
```cmd
net start MongoDB
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongosh --eval "db.version()"
```

---

### Step 3: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file (required!)
# Update these values:
# MONGODB_URI=mongodb://localhost:27017/nutriguide
# JWT_SECRET=your_super_secret_key_here_change_this

# Start backend server
npm run dev
```

**✅ Backend should be running on: http://localhost:5000**

Test backend:
```bash
curl http://localhost:5000/api/health
```

---

### Step 4: ML Service Setup

**Open a new terminal:**

```bash
# Navigate to ml-service folder
cd ml-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Train the ML model (takes ~1 minute)
python train_model.py

# Start ML service
python app.py
```

**✅ ML Service should be running on: http://localhost:5001**

Test ML service:
```bash
curl http://localhost:5001/health
```

---

### Step 5: Frontend Setup

**Open a new terminal:**

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

**✅ Frontend should be running on: http://localhost:5173**

---

## 🎯 Test the Application

### 1. Open your browser

Navigate to: **http://localhost:5173**

### 2. Create an account

Click "Get Started" or "Sign Up" and fill in the registration form:

**Example Test User:**
- Name: John Doe
- Email: john@example.com
- Password: Test123
- Age: 25
- Gender: Male
- Height: 175 cm
- Weight: 70 kg
- Activity Level: Moderate
- Fitness Goal: Maintain Weight

### 3. Explore the Dashboard

After registration, you'll be redirected to your personalized dashboard showing:
- Daily calorie target (calculated by AI)
- Macronutrient breakdown
- BMI and health insights
- Progress tracking

### 4. Test API Endpoints

**Get Nutrition Recommendations:**
```bash
# First, login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test123"}'

# Use the token to get recommendations
curl -X GET http://localhost:5000/api/nutrition/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS:
brew services start mongodb-community
# Windows:
net start MongoDB
# Linux:
sudo systemctl start mongod
```

### Python Module Not Found

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Find process using the port
# macOS/Linux:
lsof -ti:5000
kill -9 <PID>

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env file
```

### Frontend Build Error

**Error:** `Cannot find module`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Testing ML Predictions

### Test with cURL:

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "activity_level": "moderate",
    "fitness_goal": "lose_weight"
  }'
```

### Expected Response:

```json
{
  "success": true,
  "daily_calories": 1900,
  "macronutrients": {
    "protein": 166,
    "carbs": 166,
    "fats": 63
  },
  "bmi": 22.86,
  "bmr": 1680,
  "tdee": 2604,
  "recommendations": [
    "Your BMI is in the healthy range. Maintain your current lifestyle.",
    "Aim for 1-2 lbs weight loss per week through diet and exercise.",
    "Drink at least 8-10 glasses of water daily."
  ]
}
```

---

## 🎓 For Academic Presentation

### Demo Flow:

1. **Introduction (2 min)**
   - Show landing page
   - Explain project objectives

2. **User Registration (3 min)**
   - Register a new user
   - Show AI calculating personalized targets

3. **Dashboard Overview (3 min)**
   - Display health metrics
   - Explain BMI, BMR, TDEE calculations

4. **ML Model Explanation (4 min)**
   - Show model training process
   - Explain features and algorithms
   - Display accuracy metrics

5. **API Demonstration (3 min)**
   - Show API endpoints in Postman/Thunder Client
   - Demonstrate authentication flow

6. **Database (2 min)**
   - Show MongoDB Compass
   - Explain schema design

7. **Code Walkthrough (3 min)**
   - Backend architecture
   - Frontend components
   - ML service integration

---

## 📁 Project Checklist

- [x] Backend API with Express.js
- [x] MongoDB database with schemas
- [x] JWT authentication
- [x] ML model training script
- [x] Flask API for predictions
- [x] React frontend with Vite
- [x] Tailwind CSS styling
- [x] Framer Motion animations
- [x] User registration/login
- [x] Dashboard with health insights
- [x] Progress tracking
- [x] Meal database
- [x] Admin panel structure
- [x] API documentation
- [x] Comprehensive README
- [x] Code comments

---

## 🚀 Next Steps

### For Development:
1. Implement full meal database with real data
2. Add progress charts (Recharts components)
3. Complete profile editing functionality
4. Build admin panel features
5. Add unit tests
6. Implement meal photo recognition (future)

### For Production:
1. Replace synthetic ML data with Kaggle dataset
2. Optimize ML model hyperparameters
3. Add Docker containers
4. Set up CI/CD pipeline
5. Deploy to cloud (AWS/Azure/Heroku)
6. Add monitoring and logging

### For Report:
1. Create system architecture diagrams
2. Document ER diagrams for database
3. Add use case diagrams
4. Screenshot all features
5. Document ML model performance
6. Write test cases and results

---

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review error messages in terminal
3. Check browser console (F12)
4. Verify all services are running
5. Ensure MongoDB is accessible

---

## 🎉 Success!

If all three services are running:
- ✅ Backend: http://localhost:5000
- ✅ ML Service: http://localhost:5001  
- ✅ Frontend: http://localhost:5173

**You're ready to go! Open http://localhost:5173 in your browser.**

---

**Good luck with your project presentation! 🎓**
