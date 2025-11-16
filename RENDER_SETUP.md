# Render Deployment Checklist

## ✅ Environment Variables to Set on Render

### Backend Service (coins-backend)

Go to your backend service settings on Render and add these environment variables:

1. **MONGO_URI**

   ```
   mongodb+srv://ramrpk6_db_user:KXLvUEoDLXV9BSV7@cluster0.ijxmjgo.mongodb.net/coin-collector?retryWrites=true&w=majority
   ```

2. **JWT_SECRET**

   ```
   /cIhu7NjREp/WvAIyGFvR25FA30gT9aMOYh9o5ztpuM=
   ```

3. **NODE_ENV**

   ```
   production
   ```

4. **PORT** (Render automatically sets this to 10000, but you can specify)
   ```
   10000
   ```

### Frontend Service (coins-frontend)

1. **REACT_APP_API_URL**
   ```
   https://coins-backend.onrender.com/api
   ```
   ⚠️ **IMPORTANT**: Must end with `/api` (no trailing slash after /api)

## 🔧 Backend Settings

- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: ✅ Enabled

## 🎨 Frontend Settings

- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/build`
- **Rewrite Rules**:
  - Source: `/*`
  - Destination: `/index.html`

## 🧪 Testing After Deployment

1. **Test Backend Root**:

   ```
   https://coins-backend.onrender.com/
   ```

   Should return API info

2. **Test Health Check**:

   ```
   https://coins-backend.onrender.com/api/health
   ```

   Should return `{"status":"OK"}`

3. **Test Login Endpoint**:
   ```bash
   curl -X POST https://coins-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

## 🐛 Troubleshooting 404 Errors

### If you get 404 on login:

1. **Check Environment Variables**:

   - Go to Render Dashboard → Your Service → Environment
   - Verify all variables are set correctly
   - Click "Save Changes" if you made updates

2. **Check Frontend API URL**:

   - Must be: `https://coins-backend.onrender.com/api`
   - NOT: `https://coins-backend.onrender.com` (missing /api)
   - NOT: `https://coins-backend.onrender.com/api/` (extra trailing slash)

3. **Redeploy Services**:

   - Backend: Manual Deploy → Deploy latest commit
   - Frontend: Manual Deploy → Clear build cache & deploy

4. **Check Logs**:

   - Render Dashboard → Logs
   - Look for connection errors or missing env vars

5. **Verify MongoDB Access**:
   - MongoDB Atlas → Network Access
   - Add: `0.0.0.0/0` (allow from anywhere)
   - Or add Render's IP ranges

## 🔄 After Fixing Environment Variables

1. **Manually trigger a redeploy** on Render
2. **Wait for deployment to complete** (can take 2-3 minutes)
3. **Test the endpoints** using the curl commands above
4. **Clear browser cache** and try frontend again

## 📝 Common Issues

### Issue: "User already exists" but can't login

**Solution**: User might exist with wrong password. Try registering with new email.

### Issue: CORS errors in browser

**Solution**: Backend CORS is already configured for all origins. Check browser console for exact error.

### Issue: JWT errors

**Solution**: Make sure JWT_SECRET is exactly the same on Render as in your .env file.

### Issue: MongoDB connection timeout

**Solution**:

1. Check MongoDB Atlas network access allows 0.0.0.0/0
2. Verify MONGO_URI has correct credentials
3. Check if MongoDB cluster is active

## 🚀 Quick Fix Commands

If you need to update and redeploy:

```bash
# Make your fixes
git add .
git commit -m "Fix Render deployment issues"
git push origin main

# Render will auto-deploy if enabled
# Or manually trigger from Render dashboard
```
