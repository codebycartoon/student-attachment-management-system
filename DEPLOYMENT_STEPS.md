# 🚀 Deploy Your System Online (Free)

## **Step 1: Set Up Free Database (5 minutes)**

### **Create Neon Account:**
1. Go to: https://neon.tech
2. Click "Sign up" → Use your GitHub account
3. Create new project: "student-attachment-system"
4. **Copy the connection string** (looks like this):
   ```
   postgresql://username:password@ep-cool-name.us-east-1.aws.neon.tech/neondb
   ```

## **Step 2: Deploy to Vercel (5 minutes)**

### **Create Vercel Account:**
1. Go to: https://vercel.com
2. Click "Sign up" → Use your GitHub account
3. Click "Import Project"
4. Select your `student-attachment-management-system` repository

### **Configure Deployment:**
1. **Framework Preset**: Other
2. **Root Directory**: Leave empty
3. **Build Command**: `cd backend && npm install`
4. **Output Directory**: Leave empty
5. **Install Command**: `npm install`

### **Add Environment Variables:**
In Vercel dashboard → Your Project → Settings → Environment Variables, add:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_make_it_very_long_and_random_for_production_use_12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
DATABASE_URL=postgresql://username:password@ep-cool-name.us-east-1.aws.neon.tech/neondb
```

**Replace the DATABASE_URL with your actual Neon connection string!**

## **Step 3: Initialize Production Database**

After deployment, your API will be live at: `https://your-project-name.vercel.app`

To initialize the database with tables and admin user:
1. Go to: `https://your-project-name.vercel.app/health`
2. If you see the health check, your API is working!

The database will auto-initialize when the app starts.

## **Step 4: Test Your Live System**

### **Update Frontend for Production:**
1. Open your `frontend/index.html` file
2. The frontend will automatically detect if it's running locally or online
3. Upload the frontend to a separate service or test locally pointing to your live API

### **Test Accounts (Available after deployment):**
- **Admin**: admin@system.com / admin123
- **Student**: student@university.edu / student123  
- **Company**: company@techcorp.com / company123

## **Step 5: Share Your Live System**

Your API will be live at:
```
https://your-project-name.vercel.app
```

Test endpoints:
- Health: `https://your-project-name.vercel.app/health`
- Login: `https://your-project-name.vercel.app/auth/login`
- Opportunities: `https://your-project-name.vercel.app/opportunities/active`

## **🎉 What You'll Have:**

✅ **Live API** accessible from anywhere  
✅ **Professional domain** (great for resume)  
✅ **HTTPS enabled** (secure by default)  
✅ **Free PostgreSQL database**  
✅ **Admin dashboard** with real analytics  
✅ **Zero monthly costs**  

## **🔧 Troubleshooting:**

### **Database Connection Issues:**
- Double-check your DATABASE_URL in Vercel environment variables
- Make sure you copied the complete connection string from Neon

### **Deployment Fails:**
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in package.json

### **API Not Responding:**
- Check Vercel function logs
- Verify environment variables are set correctly

---

**Ready to deploy? Start with Step 1 - create your Neon database!**

