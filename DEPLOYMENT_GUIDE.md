# NutriGuide AI - Render Deployment Guide

## Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Render Account** - Sign up at https://render.com (free)
3. **MongoDB Atlas Account** - Sign up at https://www.mongodb.com/atlas (free tier)

## Step-by-Step Deployment

### Part 1: Set Up MongoDB Atlas (Database)

1. **Create MongoDB Atlas Cluster**
   - Go to https://www.mongodb.com/atlas
   - Sign up/Login
   - Create a new FREE cluster (M0)
   - Choose a region close to Oregon (Render's free tier region)

2. **Configure Database Access**
   - Go to "Database Access" in Atlas
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"

3. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - This is necessary for Render to connect

4. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `nutriguide`
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nutriguide?retryWrites=true&w=majority`

### Part 2: Push Code to GitHub

```bash
# Initialize git if you haven't already
cd "/Volumes/Apps & Others/Project/NutriGuide"
git init
git add .
git commit -m "Initial commit - Ready for Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/nutriguide.git
git branch -M main
git push -u origin main
```

### Part 3: Deploy on Render

#### Option A: Using Blueprint (Automated - Recommended)

1. **Create New Blueprint Instance**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file

2. **Configure Environment Variables**
   - Render will prompt you to set `MONGODB_URI`
   - Paste your MongoDB Atlas connection string
   - Other variables will be auto-generated

3. **Deploy**
   - Click "Apply"
   - Wait for all 3 services to deploy (5-10 minutes)

#### Option B: Manual Deployment

**1. Deploy Backend API**
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - Name: `nutriguide-backend`
     - Environment: `Node`
     - Region: `Oregon (US West)`
     - Branch: `main`
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=5002
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_secure_random_string
     JWT_EXPIRE=7d
     ```
   - Click "Create Web Service"

**2. Deploy ML Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - Name: `nutriguide-ml-service`
     - Environment: `Python 3`
     - Region: `Oregon (US West)`
     - Branch: `main`
     - Root Directory: `ml-service`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `python app.py`
   - Environment Variables:
     ```
     FLASK_ENV=production
     PORT=5001
     MODEL_PATH=models/nutrition_model.pkl
     SCALER_PATH=models/scaler.pkl
     ```
   - Click "Create Web Service"

**3. Deploy Frontend**
   - Click "New" → "Static Site"
   - Connect your GitHub repo
   - Settings:
     - Name: `nutriguide-frontend`
     - Branch: `main`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://nutriguide-backend.onrender.com
     ```
   - Click "Create Static Site"

### Part 4: Update Service URLs

After all services are deployed:

1. **Get Service URLs**
   - Backend: `https://nutriguide-backend.onrender.com`
   - ML Service: `https://nutriguide-ml-service.onrender.com`
   - Frontend: `https://nutriguide-frontend.onrender.com`

2. **Update Backend Environment Variables**
   - Go to Backend service → Environment
   - Add/Update:
     ```
     FRONTEND_URL=https://nutriguide-frontend.onrender.com
     ML_SERVICE_URL=https://nutriguide-ml-service.onrender.com
     ```
   - Click "Save Changes" (will trigger redeploy)

3. **Update ML Service Environment Variables**
   - Go to ML Service → Environment
   - Add:
     ```
     CORS_ORIGINS=https://nutriguide-backend.onrender.com,https://nutriguide-frontend.onrender.com
     ```

4. **Update Frontend Environment Variables**
   - Already set during creation, but verify:
     ```
     VITE_API_URL=https://nutriguide-backend.onrender.com
     ```

### Part 5: Seed the Database

1. **Access Backend Service Shell**
   - Go to Backend service in Render
   - Click "Shell" tab
   - Run: `cd backend && npm run seed`

2. **Or run locally with production database**
   ```bash
   # In your local backend folder
   cd backend
   export MONGODB_URI="your_atlas_connection_string"
   npm run seed
   ```

## Testing Your Deployment

1. Visit your frontend URL: `https://nutriguide-frontend.onrender.com`
2. Try to register a new account
3. Login and test the features
4. Check the Analytics page
5. Test meal recommendations

## Important Notes

### Free Tier Limitations

- **Spin Down**: Free services spin down after 15 minutes of inactivity
- **Spin Up**: Takes 30-50 seconds when someone accesses it
- **Monthly Limit**: 750 hours/month per service (enough for one always-on service)

### Upgrading to Paid Plans

If you want services always available:
- Backend: $7/month (Starter plan)
- ML Service: $7/month (Starter plan)
- Frontend: Free (static sites are always free)
- Total: $14/month for always-on backend services

## Troubleshooting

### Backend Won't Start
- Check MONGODB_URI is correct
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check logs in Render dashboard

### Frontend Shows Connection Error
- Verify VITE_API_URL is correct
- Check backend is running
- Look at browser console for CORS errors

### ML Service Errors
- Verify models folder is included in git
- Check Python version (should be 3.9+)
- Review build logs for missing dependencies

### CORS Errors
- Ensure backend FRONTEND_URL matches your frontend URL
- Verify ML service CORS_ORIGINS includes backend URL
- Check all URLs use https:// (not http://)

## Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Check response times and uptime
- **Alerts**: Set up email alerts for failures

## Cost Summary

**Free Tier (Total: $0/month)**
- All 3 services on free tier
- Services spin down after inactivity
- Perfect for portfolio/demo projects

**Paid Tier (Total: $14/month)**
- Backend + ML Service: Always on
- No spin-down delays
- Better for production use

## Next Steps

1. Set up custom domain (optional)
2. Enable automatic deploys on git push
3. Set up MongoDB Atlas backups
4. Configure monitoring and alerts
5. Add SSL certificates (automatic on Render)

## Support

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- GitHub Issues: Your repo's issues page
