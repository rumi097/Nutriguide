# Render Deployment Checklist

## Before You Deploy

- [ ] Create MongoDB Atlas account and cluster (free tier)
- [ ] Get MongoDB connection string from Atlas
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Create Render account

## MongoDB Atlas Setup

- [ ] Create new cluster (M0 Free tier)
- [ ] Create database user with password
- [ ] Add IP address 0.0.0.0/0 to Network Access
- [ ] Copy connection string
- [ ] Replace `<password>` and database name in connection string

## Files Created for Deployment

✅ `/render.yaml` - Render blueprint configuration
✅ `/DEPLOYMENT_GUIDE.md` - Complete deployment instructions
✅ `/backend/.env.production` - Backend env template
✅ `/ml-service/.env.production` - ML service env template
✅ `/frontend/.env.production` - Frontend env template
✅ `/.gitignore` - Git ignore file
✅ `/README_DEPLOYMENT.md` - README for deployment

## Code Updates Made

✅ Updated backend CORS to handle multiple origins
✅ Updated frontend API URL handling
✅ Updated ML service CORS configuration
✅ Fixed Flask app to bind to 0.0.0.0
✅ Ensured all services use environment variables

## Deployment Steps

### 1. Push to GitHub
```bash
cd "/Volumes/Apps & Others/Project/NutriGuide"
git init
git add .
git commit -m "Ready for Render deployment"
git remote add origin https://github.com/yourusername/nutriguide.git
git push -u origin main
```

### 2. Deploy on Render (Automated with Blueprint)

1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. Set the required environment variable:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
6. Click "Apply"
7. Wait for deployment (5-10 minutes)

### 3. Get Your URLs

After deployment, you'll have 3 URLs:
- Frontend: `https://nutriguide-frontend.onrender.com`
- Backend: `https://nutriguide-backend.onrender.com`
- ML Service: `https://nutriguide-ml-service.onrender.com`

### 4. Seed the Database

Option A - Using Render Shell:
1. Go to Backend service in Render dashboard
2. Click "Shell" tab
3. Run: `npm run seed`

Option B - From your local machine:
```bash
cd backend
export MONGODB_URI="your_atlas_connection_string"
npm run seed
```

### 5. Test Your Deployment

- [ ] Visit your frontend URL
- [ ] Test user registration
- [ ] Test login
- [ ] Test meal search
- [ ] Test analytics page
- [ ] Test progress tracking

## Post-Deployment (Optional)

- [ ] Set up custom domain
- [ ] Enable auto-deploy on git push
- [ ] Configure MongoDB Atlas backups
- [ ] Set up monitoring alerts
- [ ] Update README with live demo URL

## Troubleshooting

### Service Won't Start
1. Check logs in Render dashboard
2. Verify environment variables are set correctly
3. Ensure MongoDB Atlas allows connections from anywhere

### Frontend Can't Connect to Backend
1. Check CORS settings in backend
2. Verify VITE_API_URL is correct
3. Check browser console for errors

### Database Connection Fails
1. Verify MongoDB Atlas user credentials
2. Check Network Access allows 0.0.0.0/0
3. Ensure connection string has correct password

## Cost Estimate

**Free Tier (Current Setup)**
- 3 services × $0 = $0/month
- Services spin down after 15 min inactivity
- Perfect for portfolio/demos

**Upgrade to Always-On**
- Backend: $7/month
- ML Service: $7/month  
- Frontend: $0 (always free)
- Total: $14/month

## Support Resources

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- This Project's Deployment Guide: DEPLOYMENT_GUIDE.md

## Notes

⚠️ **Important**: 
- Don't commit .env files to git
- Keep your MongoDB password secure
- Free tier services take 30-50s to wake up after inactivity
- Check service logs if something isn't working

🎉 **Success Indicators**:
- All 3 services show "Live" status in Render
- Frontend loads without errors
- Can register and login successfully
- API calls work (check Network tab)
