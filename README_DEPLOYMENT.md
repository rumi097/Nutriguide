# NutriGuide AI

Smart Diet & Meal Recommendation System powered by Machine Learning

🌐 **Live Demo**: [Your Render URL here]

## Features

- 🍽️ Personalized meal recommendations
- 📊 Nutrition tracking & analytics
- 🎯 Goal-based diet planning
- 📈 Progress visualization
- 🤖 ML-powered predictions
- 👥 Admin dashboard

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB
- **ML Service**: Python, Flask, scikit-learn
- **Database**: MongoDB Atlas
- **Deployment**: Render

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nutriguide.git
cd nutriguide
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# ML Service
cd ../ml-service
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Backend - create backend/.env
cp backend/.env.example backend/.env
# Edit with your MongoDB URI and secrets

# Frontend - create frontend/.env
cp frontend/.env.example frontend/.env
# Edit with your API URL

# ML Service - create ml-service/.env
cp ml-service/.env.example ml-service/.env
```

4. Seed the database:
```bash
cd backend
npm run seed
```

5. Start the services:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - ML Service
cd ml-service
python app.py

# Terminal 3 - Frontend
cd frontend
npm run dev
```

6. Open http://localhost:5173 in your browser

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions on Render.

## License

MIT License - feel free to use for your projects!

## Author

Your Name - [Your GitHub Profile](https://github.com/yourusername)
