# Deployment Guide

## Prerequisites

1. **GitHub Account**: Create a repository for your project
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Set up a MongoDB database (if not already done)

## Step 1: Push Code to GitHub

### Option 1: Using the deployment script (Recommended)

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:

- Initialize git if needed
- Prompt for your GitHub repository URL
- Ask for a commit message
- Commit and push your changes

### Option 2: Manual setup

```bash
# Initialize git repository
git init

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Stage all files
git add .

# Commit changes
git commit -m "Initial commit"

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Render

### Backend API Deployment

1. **Create a new Web Service** on Render

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `coins-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Plan**: Free

2. **Add Environment Variables**:

   - `NODE_ENV` = `production`
   - `PORT` = `5001`
   - `MONGODB_URI` = `your-mongodb-connection-string`
   - `JWT_SECRET` = `your-secret-key` (generate with `openssl rand -base64 32`)

3. **Enable Auto-Deploy**:
   - ✅ Auto-Deploy from `main` branch

### Frontend Deployment

1. **Create a new Static Site** on Render

   - Click "New +" → "Static Site"
   - Connect the same GitHub repository
   - Configure:
     - **Name**: `coins-frontend`
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/build`
     - **Plan**: Free

2. **Add Environment Variable**:

   - `REACT_APP_API_URL` = `https://coins-backend.onrender.com` (use your backend URL)

3. **Configure Rewrites** (for React Router):
   - Add rewrite rule: `/*` → `/index.html`

## Step 3: Update Frontend API Configuration

After deploying, update your frontend API URL:

```javascript
// frontend/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
```

## Step 4: Verify Deployment

1. Visit your frontend URL (e.g., `https://coins-frontend.onrender.com`)
2. Test user registration/login
3. Test adding/viewing coins
4. Check browser console for any errors

## Automatic Deployment

Once configured, any push to the `main` branch will:

1. ✅ Trigger GitHub Actions workflow
2. ✅ Automatically deploy to Render
3. ✅ Build and restart both frontend and backend

## Troubleshooting

### Backend Issues

- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs in Render dashboard

### Frontend Issues

- Ensure `REACT_APP_API_URL` points to backend
- Check CORS settings in backend
- Verify build completes without errors

### Database Issues

- Whitelist Render's IP addresses in MongoDB Atlas
- Or set MongoDB to allow connections from anywhere (0.0.0.0/0)

## Useful Commands

```bash
# Quick commit and push
./deploy.sh

# Check git status
git status

# View recent commits
git log --oneline -5

# Force push (use carefully)
git push -f origin main
```

## CORS Configuration

Make sure your backend allows requests from your frontend domain:

```javascript
// backend/server.js
const allowedOrigins = [
  "http://localhost:3000",
  "https://coins-frontend.onrender.com", // Add your Render frontend URL
];
```

## Database Seeding

After first deployment, seed your database:

```bash
# SSH into Render backend or run locally pointing to production DB
node backend/scripts/initDatabase.js
node backend/scripts/seedLocations.js
```

## Support

For issues:

- GitHub: Check Actions tab for build errors
- Render: Check deployment logs in dashboard
- MongoDB: Check Atlas logs and network access

---

**Note**: Free tier services on Render may spin down after inactivity and take 30-60 seconds to restart on the first request.
