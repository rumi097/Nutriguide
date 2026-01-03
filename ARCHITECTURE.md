# NutriGuide AI - Architecture Document

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                     (React + Vite)                          │
│                  http://localhost:5173                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/REST API
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API Gateway Layer                         │
│                 (Express.js + CORS)                         │
│                  http://localhost:5000                       │
└──────┬──────────────────────────────────┬──────────────────┘
       │                                   │
       │ MongoDB                           │ HTTP
       │ Connection                        │
       │                                   │
┌──────▼──────────┐              ┌────────▼──────────────────┐
│   Database      │              │   ML Service              │
│   (MongoDB)     │              │   (Flask + Python)        │
│   Port: 27017   │              │   http://localhost:5001   │
└─────────────────┘              └───────────────────────────┘
```

### Technology Stack

```
Frontend:
├── React 18 (UI Library)
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── Framer Motion (Animations)
├── React Router (Routing)
├── Zustand (State Management)
├── Axios (HTTP Client)
└── React Hook Form (Forms)

Backend:
├── Node.js (Runtime)
├── Express.js (Web Framework)
├── MongoDB (Database)
├── Mongoose (ODM)
├── JWT (Authentication)
├── bcryptjs (Password Hashing)
└── Express Validator (Validation)

ML Service:
├── Python 3.x
├── Flask (Web Framework)
├── NumPy (Numerical Computing)
├── Pandas (Data Analysis)
├── Scikit-learn (Machine Learning)
└── Joblib (Model Serialization)
```

---

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── Layout.jsx              # Main app layout with sidebar
│   ├── PrivateRoute.jsx        # Protected route wrapper
│   └── AdminRoute.jsx          # Admin-only route wrapper
│
├── pages/
│   ├── LandingPage.jsx         # Public homepage
│   ├── LoginPage.jsx           # Authentication
│   ├── RegisterPage.jsx        # User registration
│   ├── DashboardPage.jsx       # Main dashboard
│   ├── MealsPage.jsx           # Meal browser
│   ├── ProgressPage.jsx        # Progress tracking
│   ├── ProfilePage.jsx         # User settings
│   └── AdminDashboard.jsx      # Admin panel
│
├── services/
│   ├── authService.js          # Authentication API calls
│   ├── userService.js          # User API calls
│   ├── nutritionService.js     # Nutrition API calls
│   ├── progressService.js      # Progress API calls
│   └── mealService.js          # Meal API calls
│
├── store/
│   └── authStore.js            # Global auth state (Zustand)
│
└── utils/
    └── api.js                  # Axios instance with interceptors
```

### Backend Architecture

```
backend/
├── models/
│   ├── User.model.js           # User schema
│   ├── Meal.model.js           # Meal schema
│   └── Progress.model.js       # Progress schema
│
├── controllers/
│   ├── auth.controller.js      # Authentication logic
│   ├── user.controller.js      # User management
│   ├── nutrition.controller.js # Nutrition calculations
│   ├── meal.controller.js      # Meal operations
│   ├── progress.controller.js  # Progress tracking
│   └── admin.controller.js     # Admin operations
│
├── routes/
│   ├── auth.routes.js          # Auth endpoints
│   ├── user.routes.js          # User endpoints
│   ├── nutrition.routes.js     # Nutrition endpoints
│   ├── meal.routes.js          # Meal endpoints
│   ├── progress.routes.js      # Progress endpoints
│   └── admin.routes.js         # Admin endpoints
│
├── middleware/
│   ├── auth.middleware.js      # JWT verification
│   ├── validation.middleware.js # Input validation
│   └── error.middleware.js     # Error handling
│
└── server.js                   # Express app entry point
```

---

## Data Flow

### User Registration Flow

```
1. User fills registration form (Frontend)
   ↓
2. Form validated (React Hook Form)
   ↓
3. POST /api/auth/register (Backend)
   ↓
4. Validate input (Express Validator)
   ↓
5. Hash password (bcryptjs)
   ↓
6. Create user in MongoDB
   ↓
7. Request ML prediction (Flask API)
   ↓
8. Calculate BMI, BMR, TDEE, macros (ML Service)
   ↓
9. Update user with targets (Backend)
   ↓
10. Generate JWT token
   ↓
11. Return user + token (Frontend)
   ↓
12. Store in Zustand + localStorage
   ↓
13. Redirect to dashboard
```

### Nutrition Recommendation Flow

```
1. User requests recommendations
   ↓
2. GET /api/nutrition/recommendations
   ↓
3. Verify JWT token (Auth Middleware)
   ↓
4. Get user data from MongoDB
   ↓
5. POST to ML Service /predict
   ↓
6. ML model processes features:
   - Age, Gender, Height, Weight
   - Calculate BMI, BMR
   - Apply activity multiplier
   - Adjust for fitness goal
   ↓
7. Return predictions:
   - Daily calories
   - Macro breakdown
   - Health recommendations
   ↓
8. Backend sends to frontend
   ↓
9. Display in dashboard UI
```

### Progress Logging Flow

```
1. User logs a meal
   ↓
2. POST /api/progress/log-meal
   ↓
3. Get or create today's progress doc
   ↓
4. Add meal to progress.meals array
   ↓
5. Update daily nutrition totals
   ↓
6. Calculate compliance percentages
   ↓
7. Save to MongoDB
   ↓
8. Return updated progress
   ↓
9. Update frontend state
   ↓
10. Show success notification
```

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...",  // hashed
  age: 25,
  gender: "male",
  height: 175,
  weight: 70,
  bmi: 22.86,
  activityLevel: "moderate",
  fitnessGoal: "maintain_weight",
  dailyCalorieTarget: 2400,
  macronutrients: {
    protein: 180,
    carbs: 240,
    fats: 80
  },
  dietaryPreferences: ["none"],
  allergies: [],
  role: "user",
  isActive: true,
  profileComplete: true,
  createdAt: ISODate("2026-01-02T10:00:00Z"),
  updatedAt: ISODate("2026-01-02T10:00:00Z")
}
```

### Meals Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Grilled Chicken Breast",
  description: "High protein, low fat meal",
  category: "lunch",
  cuisine: "american",
  nutrition: {
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fats: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74
  },
  servingSize: "100g",
  dietaryTags: ["high_protein", "low_carb"],
  allergens: [],
  ingredients: [
    { name: "Chicken breast", quantity: "100", unit: "g" }
  ],
  prepTime: 5,
  cookTime: 15,
  popularity: 150,
  rating: 4.5,
  isActive: true,
  source: "database",
  createdAt: ISODate("2026-01-01T00:00:00Z"),
  updatedAt: ISODate("2026-01-01T00:00:00Z")
}
```

### Progress Collection

```javascript
{
  _id: ObjectId("..."),
  user: ObjectId("..."),  // Reference to Users
  date: ISODate("2026-01-02T00:00:00Z"),
  weight: 70,
  nutrition: {
    calories: 1850,
    protein: 145,
    carbohydrates: 180,
    fats: 60,
    fiber: 25,
    water: 2000
  },
  meals: [
    {
      mealId: ObjectId("..."),
      mealName: "Oatmeal with Berries",
      category: "breakfast",
      servings: 1,
      calories: 350,
      protein: 12,
      carbohydrates: 55,
      fats: 8,
      consumedAt: ISODate("2026-01-02T08:30:00Z")
    },
    {
      mealId: ObjectId("..."),
      mealName: "Grilled Chicken Salad",
      category: "lunch",
      servings: 1,
      calories: 450,
      protein: 35,
      carbohydrates: 30,
      fats: 18,
      consumedAt: ISODate("2026-01-02T13:00:00Z")
    }
  ],
  targets: {
    calories: 2400,
    protein: 180,
    carbohydrates: 240,
    fats: 80
  },
  compliance: {
    calorieCompliance: 77,
    macroCompliance: 80
  },
  createdAt: ISODate("2026-01-02T00:00:00Z"),
  updatedAt: ISODate("2026-01-02T14:30:00Z")
}
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/me            # Get current user
POST   /api/auth/logout        # Logout user
```

### Users
```
GET    /api/users/profile      # Get profile
PUT    /api/users/profile      # Update profile
GET    /api/users/dashboard    # Get dashboard data
DELETE /api/users/account      # Delete account
```

### Nutrition
```
GET    /api/nutrition/recommendations  # Get AI recommendations
POST   /api/nutrition/meal-plan        # Generate meal plan
GET    /api/nutrition/calculate        # Calculate custom
```

### Meals
```
GET    /api/meals              # List meals (filtered)
GET    /api/meals/:id          # Get meal by ID
GET    /api/meals/search/recommendations  # Get recommendations
POST   /api/meals              # Create meal (admin)
PUT    /api/meals/:id          # Update meal (admin)
DELETE /api/meals/:id          # Delete meal (admin)
```

### Progress
```
GET    /api/progress/today     # Today's progress
POST   /api/progress/log-meal  # Log meal
PUT    /api/progress/update-weight  # Update weight
GET    /api/progress/history   # Get history
GET    /api/progress/analytics # Get analytics
DELETE /api/progress/meal/:id  # Remove meal
```

### Admin
```
GET    /api/admin/users        # List all users
GET    /api/admin/users/:id    # Get user by ID
PUT    /api/admin/users/:id    # Update user
DELETE /api/admin/users/:id    # Delete user
GET    /api/admin/dashboard    # Dashboard stats
GET    /api/admin/analytics    # System analytics
POST   /api/admin/meals/bulk   # Bulk create meals
```

---

## Security Implementation

### Authentication
- JWT tokens with 7-day expiration
- Tokens stored in localStorage
- Automatic token refresh on API calls
- Logout clears token and state

### Authorization
- Role-based access control (user/admin)
- Protected routes with middleware
- Admin-only endpoints secured

### Password Security
- bcryptjs with salt rounds (10)
- Passwords never returned in API responses
- Password complexity requirements

### Input Validation
- express-validator on all inputs
- Type checking and sanitization
- Custom validation rules
- Error messages returned clearly

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests/15 minutes)
- MongoDB injection prevention

---

## ML Model Architecture

### Model Pipeline

```
Input Features
    ↓
[Age, Gender, Height, Weight, Activity, Goal]
    ↓
Feature Engineering
    ↓
- Calculate BMI = Weight / (Height/100)²
- Calculate BMR (Mifflin-St Jeor):
  * Male: 10W + 6.25H - 5A + 5
  * Female: 10W + 6.25H - 5A - 161
- Encode categorical features
- Create interaction features
    ↓
Feature Scaling (StandardScaler)
    ↓
ML Model (Gradient Boosting)
    ↓
Prediction: Daily Calorie Target
    ↓
Post-processing
    ↓
- Calculate TDEE = BMR × Activity Multiplier
- Apply Goal Adjustment (±500 cal)
- Calculate Macro Distribution
  * Protein: 25-35% (÷4 for grams)
  * Carbs: 35-45% (÷4 for grams)
  * Fats: 25-30% (÷9 for grams)
    ↓
Output: Personalized Nutrition Plan
```

### Model Training

```python
# Features (X)
- age
- gender (encoded)
- height
- weight
- bmi
- bmr
- activity_level (encoded)
- fitness_goal (encoded)

# Target (y)
- daily_calories

# Algorithms Tested
1. Linear Regression (baseline)
2. Random Forest Regressor
3. Gradient Boosting Regressor (selected)

# Evaluation Metrics
- Mean Absolute Error (MAE): ~75 calories
- R² Score: ~0.92
- 85% predictions within ±150 calories
```

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────┐
│                  CDN (CloudFlare)                │
│              Static Assets Caching               │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Load Balancer (NGINX)               │
│           SSL Termination + Routing              │
└──────┬─────────────────────────────┬────────────┘
       │                             │
┌──────▼──────────┐         ┌────────▼───────────┐
│  Frontend App   │         │   Backend API      │
│  (React Build)  │         │   (Node.js PM2)    │
│  AWS S3/Vercel  │         │   AWS EC2/Heroku   │
└─────────────────┘         └────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
             ┌──────▼──────┐  ┌──────▼──────┐ ┌──────▼──────┐
             │   MongoDB    │  │  ML Service  │ │Redis Cache  │
             │  (Atlas)     │  │  (Flask)     │ │  (Optional) │
             │              │  │  AWS Lambda  │ │             │
             └──────────────┘  └──────────────┘ └─────────────┘
```

---

This architecture ensures:
- **Scalability**: Microservices can scale independently
- **Maintainability**: Clear separation of concerns
- **Security**: Multiple layers of protection
- **Performance**: Caching and optimization strategies
- **Reliability**: Error handling and fallback mechanisms
