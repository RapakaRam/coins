# Quick Start Guide

## 🚀 Running Locally

### 1. Setup Backend

```bash
cd backend

# Copy local environment file
cp .env.local .env

# Install dependencies
npm install

# Initialize database (first time only)
node scripts/initDatabase.js
node scripts/seedLocations.js

# Start backend server
npm start
```

Backend will run on: `http://localhost:5001`

### 2. Setup Frontend

```bash
cd frontend

# Copy local environment file
cp .env.local .env

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend will open on: `http://localhost:3000`

## 🌐 Running in Production (Render)

### Environment Variables

#### Backend (coins-backend)

Set these in Render Dashboard → coins-backend → Environment:

```
MONGO_URI=mongodb+srv://ramrpk6_db_user:KXLvUEoDLXV9BSV7@cluster0.ijxmjgo.mongodb.net/coin-collector?retryWrites=true&w=majority
JWT_SECRET=/cIhu7NjREp/WvAIyGFvR25FA30gT9aMOYh9o5ztpuM=
NODE_ENV=production
PORT=10000
```

#### Frontend (coins-frontend)

Set this in Render Dashboard → coins-frontend → Environment:

```
REACT_APP_API_URL=https://coins-backend.onrender.com/api
```

### Deploy to Render

```bash
# Commit and push changes
git add .
git commit -m "Your commit message"
git push origin main

# Render will auto-deploy both services
```

## 📝 Environment Files

- **`.env.local`** - Local development (use this)
- **`.env.production`** - Production reference (values set in Render Dashboard)
- **`.env`** - Active environment file (git-ignored, copy from .env.local)

## 🔄 Switching Environments

### For Local Development:

```bash
# Backend
cd backend
cp .env.local .env

# Frontend
cd frontend
cp .env.local .env
```

### To Test Production Settings Locally:

```bash
# Backend
cd backend
cp .env.production .env

# Frontend
cd frontend
cp .env.production .env
```

## 🛠️ Common Commands

```bash
# Run backend
cd backend && npm start

# Run frontend
cd frontend && npm start

# Deploy to GitHub + Render
./deploy.sh

# Seed database
cd backend && node scripts/seedLocations.js

# Debug coins
cd backend && node scripts/debugCoins.js
```

## ✅ Checklist

- [ ] MongoDB cluster is running
- [ ] `.env` file exists in backend (copied from `.env.local`)
- [ ] `.env` file exists in frontend (copied from `.env.local`)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database initialized and seeded
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000

## 🐛 Troubleshooting

### Backend won't start

```bash
cd backend
cp .env.local .env
npm install
npm start
```

### Frontend API errors

```bash
cd frontend
cp .env.local .env
npm install
npm start
```

### Database connection errors

- Check MongoDB Atlas is running
- Verify MONGO_URI in `.env`
- Check network access in MongoDB Atlas (allow 0.0.0.0/0)

### Production 404 errors

- Verify environment variables are set in Render Dashboard
- Redeploy frontend after setting REACT_APP_API_URL
- Clear browser cache or try incognito mode
