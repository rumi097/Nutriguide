# NutriGuide Backend API

## Overview
Node.js + Express.js backend API for NutriGuide AI. Provides RESTful endpoints for user management, nutrition tracking, and meal recommendations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- MongoDB connection string
- JWT secret key
- ML service URL

4. Start server:
```bash
npm run dev
```

Server runs on: http://localhost:5000

## Project Structure

```
backend/
├── controllers/       # Business logic
├── models/           # MongoDB schemas
├── routes/           # API routes
├── middleware/       # Authentication, validation
└── server.js         # Entry point
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login    - Login user
GET  /api/auth/me       - Get current user (protected)
POST /api/auth/logout   - Logout user (protected)
```

### User
```
GET    /api/users/profile   - Get user profile
PUT    /api/users/profile   - Update profile
GET    /api/users/dashboard - Get dashboard data
DELETE /api/users/account   - Delete account
```

### Nutrition
```
GET  /api/nutrition/recommendations - Get AI recommendations
POST /api/nutrition/meal-plan       - Generate meal plan
GET  /api/nutrition/calculate       - Calculate nutrition needs
```

### Meals
```
GET    /api/meals              - Get all meals (with filters)
GET    /api/meals/:id          - Get meal by ID
GET    /api/meals/search/recommendations - Get recommendations
POST   /api/meals              - Create meal (admin)
PUT    /api/meals/:id          - Update meal (admin)
DELETE /api/meals/:id          - Delete meal (admin)
```

### Progress
```
GET    /api/progress/today     - Get today's progress
POST   /api/progress/log-meal  - Log a meal
PUT    /api/progress/update-weight - Update weight
GET    /api/progress/history   - Get progress history
GET    /api/progress/analytics - Get analytics
DELETE /api/progress/meal/:id  - Remove logged meal
```

### Admin
```
GET    /api/admin/users          - Get all users
GET    /api/admin/users/:id      - Get user by ID
PUT    /api/admin/users/:id      - Update user
DELETE /api/admin/users/:id      - Delete user
GET    /api/admin/dashboard      - Get admin dashboard
GET    /api/admin/analytics      - Get system analytics
POST   /api/admin/meals/bulk     - Bulk create meals
```

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Environment Variables

Required variables in `.env`:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `JWT_EXPIRE` - Token expiration (e.g., "7d")
- `ML_SERVICE_URL` - URL of ML service
- `FRONTEND_URL` - Frontend URL for CORS

## Development

```bash
npm run dev   # Start with nodemon
npm start     # Start without nodemon
```
