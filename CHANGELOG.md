# Changelog

All notable changes to the NutriGuide AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Recipe recommendation system using collaborative filtering
- Meal photo recognition with computer vision
- Mobile app (React Native)
- Multi-language support (i18n)
- Social features (share progress, challenges)
- Integration with fitness trackers

## [1.0.0] - 2026-01-05

### Added
- 🎉 Initial release of NutriGuide AI
- 🤖 ML model trained on 230K+ real Kaggle recipes (99.87% accuracy)
- 👤 User authentication with JWT (login, register, logout)
- 📊 Personalized calorie and macronutrient recommendations
- 🍽️ Meal database with 500+ real nutritional data
- 🔍 Advanced meal search with filtering (dietary, allergens, calories)
- 📈 Progress tracking with visual analytics
- 👨‍💼 Admin dashboard for user and meal management
- 🎨 Beautiful responsive UI with Tailwind CSS and Framer Motion
- 📱 Mobile-responsive design
- 🔐 Role-based access control (Admin/User)
- 📝 Comprehensive documentation

### Features

#### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Framer Motion animations
- Zustand state management
- React Router DOM for navigation
- Recharts for data visualization
- React Hot Toast for notifications
- React Hook Form for form handling

#### Backend
- Node.js + Express.js REST API
- MongoDB with Mongoose ODM
- JWT authentication
- bcrypt password hashing
- Express validation middleware
- Helmet security headers
- Morgan HTTP logging
- CORS configuration

#### ML Service
- Python Flask API
- Gradient Boosting Regressor (MAE: 5.62 cal, R²: 0.9987)
- 14 engineered features
- Real Kaggle dataset training
- NumPy, Pandas, Scikit-learn stack

#### Pages & Features
- Landing page with hero section
- User registration and login
- Dashboard with personalized insights
- Meal search and filtering
- Progress tracking with charts
- User profile management
- Analytics visualization
- Admin panel

### Technical Highlights
- Test MAE: 5.62 calories (exceptionally accurate)
- Test R²: 0.9987 (99.87% prediction accuracy)
- 5,000 training samples generated
- 500 diverse meals in database
- Basal Metabolic Rate (BMR) calculation
- Body Mass Index (BMI) calculation
- Activity level multipliers
- Goal-based adjustments (lose/maintain/gain)

### Documentation
- Comprehensive README.md
- Architecture documentation
- Deployment guides
- API documentation
- ML training reports
- Quick start guide
- Setup guide

## Version History Notes

### Versioning Scheme

We use [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backwards-compatible)
- **PATCH** version for backwards-compatible bug fixes

### Release Types

- **🎉 Major Release (x.0.0)**: Significant new features or breaking changes
- **✨ Minor Release (1.x.0)**: New features, no breaking changes
- **🐛 Patch Release (1.0.x)**: Bug fixes and minor improvements

## How to Contribute to Changelog

When creating a PR, add your changes under the `[Unreleased]` section in the appropriate category:

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

### Example Entry

```markdown
## [Unreleased]

### Added
- New meal recommendation algorithm (#123) @contributor-name
- Dark mode toggle (#124) @contributor-name

### Fixed
- Fixed calorie calculation bug (#125) @contributor-name
```

---

[Unreleased]: https://github.com/rumi097/NutriGuide/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rumi097/NutriGuide/releases/tag/v1.0.0
