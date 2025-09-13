# 🚀 ERP System Deployment Guide

## Frontend Deployment (Netlify)

### Step 1: Prepare for Deployment
1. The frontend is already built and ready in the `frontend/build` folder
2. The `netlify.toml` configuration file is included

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub account and select the `numetria-rosa/ERP` repository
4. Set the build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/build`
   - **Base directory**: `frontend`

### Step 3: Configure Environment Variables
In Netlify dashboard, go to Site settings > Environment variables:
- `REACT_APP_API_URL`: `https://your-backend-url.railway.app/api`

## Backend Deployment (Railway)

### Step 1: Deploy Backend to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your ERP repository
4. Set the root directory to `backend`
5. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: `production`

### Step 2: Database Setup
1. Add a PostgreSQL database to your Railway project
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `npx prisma migrate deploy`
4. Seed the database: `npm run seed`

## Alternative Backend Deployment (Render)

### Step 1: Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Set the build command: `cd backend && npm install && npx prisma generate && npx prisma migrate deploy`
5. Set the start command: `cd backend && npm start`

## Environment Variables Summary

### Frontend (Netlify)
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

### Backend (Railway/Render)
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secure-jwt-secret-here
NODE_ENV=production
PORT=4000
```

## Post-Deployment Steps

1. **Update Frontend API URL**: Replace `your-backend-url.railway.app` with your actual backend URL
2. **Test the Application**: Verify all features work correctly
3. **Set up Custom Domain** (optional): Configure your own domain in Netlify
4. **Enable HTTPS**: Both Netlify and Railway provide HTTPS by default

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure your backend allows your frontend domain
2. **API Connection**: Verify the `REACT_APP_API_URL` is correct
3. **Database Connection**: Check your `DATABASE_URL` is valid
4. **Build Failures**: Check the build logs in your deployment platform

### Support:
- Check the deployment platform logs for detailed error messages
- Ensure all environment variables are set correctly
- Verify the database is accessible from your backend service
