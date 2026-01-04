# NutriGuide - Vercel + Render Deployment Guide

**Frontend**: Vercel (free, unlimited, blazing fast)  
**Backend**: Render Web Service (free tier if available, or starter)  
**Database**: MongoDB Atlas (free M0)  
**ML Service**: Not deployed (app uses formula fallback)

---

## Step 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/atlas
2. Create a **free M0 cluster** (shared)
3. **Database Access**:
   - Add new user with username/password
   - Role: "Read and write to any database"
4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string:
     ```
     mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/nutriguide?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Replace database name with `nutriguide`

---

## Step 2: Deploy Backend on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click **New +** → **Web Service**
3. **Connect your GitHub repository** (`rumi097/Nutriguide`)
4. **Configure the service**:
   - **Name**: `nutriguide-backend`
   - **Region**: Choose closest to you (Oregon, Frankfurt, etc.)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select "Free" or "Starter" (whatever is available)

5. **Add Environment Variables** (click "Advanced" or go to Environment tab):
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/nutriguide?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_random_string_min_32_chars
   JWT_EXPIRE=7d
   ```
   
   **Generate a secure JWT_SECRET**:
   ```bash
   # Run in your terminal:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. Click **Create Web Service**
7. Wait for deployment (3-5 minutes)
8. **Copy your backend URL**: `https://nutriguide-backend-xxxx.onrender.com`

---

## Step 3: Seed the Database

After backend is deployed, seed meals into MongoDB:

**Option A: From Render Shell** (if available on your plan)
1. Go to your backend service → **Shell** tab
2. Run:
   ```bash
   cd backend
   npm run seed
   ```

**Option B: From your local machine**
1. Open terminal on your Mac
2. Run:
   ```bash
   cd "/Volumes/Apps & Others/Project/NutriGuide/backend"
   export MONGODB_URI="mongodb+srv://USER:PASS@cluster.mongodb.net/nutriguide?..."
   npm run seed
   ```

You should see: "✅ Database seeded successfully"

---

## Step 4: Deploy Frontend on Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**:
   - Sign in with GitHub
   - Select `rumi097/Nutriguide`
3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (click "Edit")
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Key: `VITE_API_URL`
   - Value: `https://nutriguide-backend-xxxx.onrender.com` (your backend URL, NO trailing slash)
   - Click "Add"

5. Click **Deploy**
6. Wait for deployment (~2 minutes)
7. **Copy your frontend URL**: `https://nutriguide-xxxxx.vercel.app`

---

## Step 5: Update Backend CORS

Your backend needs to allow requests from your Vercel frontend:

1. Go to **Render Dashboard** → Your backend service
2. Go to **Environment** tab
3. **Add/Update** this variable:
   ```
   FRONTEND_URL=https://nutriguide-xxxxx.vercel.app
   ```
   (Use your actual Vercel URL)
4. Click **Save Changes** (this will trigger a redeploy, ~1 minute)

---

## Step 6: Test Your Deployment

1. **Open your Vercel URL**: `https://nutriguide-xxxxx.vercel.app`
2. Click **Register** and create an account
3. Fill in health data (age, weight, height, etc.)
4. After registration, you should see:
   - Daily calorie target calculated
   - Macronutrient recommendations
   - Dashboard with your profile
5. Try the **Meals** page to see recommended meals
6. Check **Progress** page to track your data
7. Try **Analytics** to see visualizations

---

## Verification Checklist

- [ ] Backend health: `https://nutriguide-backend-xxxx.onrender.com/api/health` returns success
- [ ] Frontend loads without errors
- [ ] Can register a new account
- [ ] Can login with the account
- [ ] Dashboard shows calorie/macro targets
- [ ] Meals page shows food database
- [ ] No CORS errors in browser console (F12 → Console)

---

## Important Notes

### Render Free Tier Limitations
- **Spin down**: Services sleep after 15 min of inactivity
- **Spin up**: Takes 30-50 seconds on first request after sleep
- **Monthly hours**: 750 hours/month (plenty for demo/portfolio)

### Vercel Free Tier
- **Unlimited** bandwidth and deployments
- **Always on** (no spin down)
- **100 GB** bandwidth/month
- **Fast** global CDN

### ML Service (Not Deployed)
The app works perfectly without the ML service:
- Uses **Mifflin-St Jeor equation** for calorie calculation
- Uses **database filtering** for meal recommendations
- All features work, just without AI predictions

If you want ML predictions later, you can deploy `ml-service` to another platform (Railway, Koyeb, etc.) and add `ML_SERVICE_URL` to backend env vars.

---

## Troubleshooting

### "Network Error" on Frontend
- Check backend URL in Vercel env vars (no trailing `/api`)
- Verify backend is running: visit `/api/health`
- Check browser console for CORS errors

### CORS Errors
- Make sure `FRONTEND_URL` in backend matches your Vercel URL exactly
- No trailing slashes
- Use `https://` (not `http://`)

### Backend Won't Start
- Check `MONGODB_URI` is correct
- Verify MongoDB Atlas allows `0.0.0.0/0`
- Check Render logs for errors

### Database Connection Failed
- Verify MongoDB user password is correct
- Check network access whitelist
- Make sure connection string has database name `nutriguide`

---

## Your Deployment URLs

After deployment, update these:

- **Frontend**: `https://nutriguide-xxxxx.vercel.app`
- **Backend**: `https://nutriguide-backend-xxxx.onrender.com`
- **Backend API Health**: `https://nutriguide-backend-xxxx.onrender.com/api/health`

---

## Redeployment

**Frontend** (Vercel):
- Auto-deploys on every push to `main` branch
- Or manually: Vercel Dashboard → Deployments → Redeploy

**Backend** (Render):
- Auto-deploys on every push to `main` branch
- Or manually: Render Dashboard → Manual Deploy → Deploy latest commit

---

## Cost Summary

- **Frontend (Vercel)**: $0/month (unlimited)
- **Backend (Render)**: $0/month (free tier) or $7/month (starter)
- **Database (MongoDB Atlas)**: $0/month (M0 free tier)
- **Total**: $0-7/month

---

## Need Help?

If you encounter issues:
1. Check Render logs: Dashboard → Service → Logs
2. Check Vercel logs: Dashboard → Deployments → [latest] → Build Logs
3. Check browser console: F12 → Console tab
4. Verify all environment variables are set correctly
