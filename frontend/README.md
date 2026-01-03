# NutriGuide Frontend

## Overview
React + Vite frontend for NutriGuide AI. Modern, responsive UI with smooth animations and real-time data visualization.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=NutriGuide AI
```

4. Start development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout.jsx     # Main layout wrapper
│   │   ├── PrivateRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── pages/             # Page components
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── MealsPage.jsx
│   │   ├── ProgressPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── AdminDashboard.jsx
│   ├── services/          # API services
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── nutritionService.js
│   │   ├── progressService.js
│   │   └── mealService.js
│   ├── store/             # State management
│   │   └── authStore.js   # Zustand store
│   ├── utils/             # Utilities
│   │   └── api.js         # Axios instance
│   ├── App.jsx            # Main app
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── tailwind.config.js     # Tailwind config
├── vite.config.js         # Vite config
└── package.json
```

## Technologies

- **React 18** - UI library
- **Vite** - Build tool (faster than CRA)
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Pages

### Public Pages
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Protected Pages (require login)
- `/dashboard` - User dashboard
- `/meals` - Meal database
- `/progress` - Progress tracking
- `/profile` - User profile

### Admin Pages (require admin role)
- `/admin` - Admin dashboard

## State Management

Uses Zustand for global state:

```javascript
import { useAuthStore } from './store/authStore'

// In component:
const { user, isAuthenticated, logout } = useAuthStore()
```

## API Integration

Services are organized by domain:

```javascript
// Example: Login
import { authService } from './services/authService'

const login = async (credentials) => {
  const response = await authService.login(credentials)
  // Handle response
}
```

## Styling

### Tailwind CSS
Utility-first approach:
```jsx
<div className="bg-primary-600 text-white rounded-lg p-4">
  Content
</div>
```

### Custom Classes (in index.css)
```css
.gradient-text    # Gradient text effect
.glass            # Glass morphism
.card-hover       # Card hover animation
.custom-scrollbar # Styled scrollbar
```

## Animations

### Framer Motion
```jsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## Forms

### React Hook Form
```jsx
import { useForm } from 'react-hook-form'

const { register, handleSubmit, formState: { errors } } = useForm()

<input
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email'
    }
  })}
/>
```

## Routing

### Protected Routes
```jsx
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <DashboardPage />
    </PrivateRoute>
  }
/>
```

### Admin Routes
```jsx
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
```

## Performance Optimization

1. **Code Splitting**: React Router lazy loading
2. **Image Optimization**: WebP format, lazy loading
3. **Bundle Size**: Tree shaking with Vite
4. **Caching**: Service worker (future enhancement)

## Responsive Design

Mobile-first approach with Tailwind breakpoints:
```jsx
// Mobile: base styles
// Tablet: md: prefix
// Desktop: lg: prefix

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  ...
</div>
```

## Icons

Using Lucide React:
```jsx
import { Home, User, Settings } from 'lucide-react'

<Home className="h-5 w-5" />
```

## Notifications

Using React Hot Toast:
```jsx
import toast from 'react-hot-toast'

toast.success('Operation successful!')
toast.error('Something went wrong')
toast.loading('Processing...')
```

## Environment Variables

Access via `import.meta.env`:
```javascript
const API_URL = import.meta.env.VITE_API_URL
```

## Build for Production

```bash
npm run build
```

Output in `dist/` folder. Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. **Hot Reload**: Vite provides instant HMR
2. **DevTools**: Use React DevTools extension
3. **Network**: Check API calls in Network tab
4. **Console**: Monitor for warnings/errors
5. **Lighthouse**: Run audits for performance

## Component Guidelines

1. **One component per file**
2. **Use functional components**
3. **Props validation** (optional: PropTypes/TypeScript)
4. **Consistent naming** (PascalCase for components)
5. **Extract reusable logic** to custom hooks
6. **Keep components small** (<200 lines)

## Future Enhancements

1. **TypeScript** migration
2. **Unit tests** (Vitest/Jest)
3. **E2E tests** (Playwright/Cypress)
4. **PWA** support
5. **Dark mode**
6. **Internationalization** (i18n)
7. **Accessibility** improvements (ARIA)
