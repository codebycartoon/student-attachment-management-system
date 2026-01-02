# 🚀 Deployment Guide

## Option 1: Railway (Recommended - Easiest)

### Prerequisites
- GitHub account with your project pushed
- Railway account (free): https://railway.app

### Steps:

1. **Go to Railway.app and sign up/login**
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select your `student-attachment-management-system` repository**
4. **Railway will auto-detect Node.js and deploy**

### Add PostgreSQL Database:
1. **In your Railway project, click "New" → "Database" → "PostgreSQL"**
2. **Railway will create a database and provide connection details**
3. **Go to your backend service → "Variables" tab**
4. **Add these environment variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_for_production_make_it_long_and_random
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=*
   ```
5. **Railway automatically sets database variables (DB_HOST, DB_NAME, etc.)**

### Initialize Database:
1. **Go to your backend service → "Deploy" tab**
2. **Click "View Logs" to see deployment**
3. **Once deployed, go to "Settings" → "Deploy"**
4. **Set "Build Command": `npm run deploy-setup`** (this runs init-db and seed-data)

### Your Live URL:
Railway will give you a URL like: `https://your-app-name.railway.app`

## Option 2: Render (Alternative)

### Steps:
1. **Go to Render.com and sign up**
2. **Click "New" → "Web Service"**
3. **Connect your GitHub repository**
4. **Settings:**
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
5. **Add PostgreSQL database from Render dashboard**
6. **Set environment variables in Render dashboard**

## Option 3: Heroku (Classic)

### Steps:
1. **Install Heroku CLI**
2. **Login**: `heroku login`
3. **Create app**: `heroku create your-app-name`
4. **Add PostgreSQL**: `heroku addons:create heroku-postgresql:mini`
5. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret_key
   ```
6. **Deploy**: `git push heroku main`

## Environment Variables Needed

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_for_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*

# Database (usually auto-set by hosting provider)
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## Post-Deployment Testing

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-app.railway.app/health

# API info
curl https://your-app.railway.app/

# Register a user
curl -X POST https://your-app.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"student"}'
```

## Troubleshooting

### Common Issues:
1. **Database connection fails**: Check environment variables
2. **App crashes on startup**: Check logs for missing dependencies
3. **CORS errors**: Make sure CORS_ORIGIN is set correctly

### Checking Logs:
- **Railway**: Project → Service → "View Logs"
- **Render**: Dashboard → Service → "Logs"
- **Heroku**: `heroku logs --tail`

## Success Indicators

✅ **Health endpoint returns 200**: `https://your-app.railway.app/health`
✅ **API info loads**: `https://your-app.railway.app/`
✅ **User registration works**: Test with curl or Postman
✅ **Database has sample data**: Admin login works

---

**Once deployed, you'll have a live API that anyone can access and test!** 🌟