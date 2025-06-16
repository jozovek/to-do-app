# Todo App Deployment Guide

This guide will help you deploy your full-stack todo app with the backend on Render and frontend on Netlify.

## Phase 1: Set Up MongoDB Atlas (Database)

### Step 1: Create Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" (green button)
3. Sign up with email or Google account
4. Complete the signup process

### Step 2: Create Project & Cluster
1. After login, click "Create a project"
2. Name it "todo-app" → Click "Next"
3. Skip adding members → Click "Create Project"
4. Click "Build a Database" (big green button)
5. Choose **"M0 Sandbox"** (FREE tier - $0/month)
6. Select **AWS** and a region close to you
7. Cluster Name: "todo-cluster" (or whatever you prefer)
8. Click "Create Cluster"

### Step 3: Database User (Security)
1. You'll see "Security Quickstart" while cluster creates
2. Choose "Username and Password"
3. Username: `todouser` (or your choice)
4. Click "Autogenerate Secure Password" 
5. **COPY THE PASSWORD** - save it in a text file temporarily
6. Click "Create User"

### Step 4: Network Access
1. Next screen: "Where would you like to connect from?"
2. Click "Add My Current IP Address" 
3. **Also click "Add a Different IP Address"**
4. Enter: `0.0.0.0/0` (allows Render to connect)
5. Click "Finish and Close"

### Step 5: Get Connection String
1. Wait for cluster to finish (3-5 minutes)
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and "4.1 or later"
5. Copy the connection string (looks like):
   ```
   mongodb+srv://todouser:<password>@todo-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you saved earlier

### Step 6: Test Connection Locally (Optional but Recommended)
1. Temporarily update your `backend/.env` file with the new connection string
2. Run `cd backend && npm start`
3. If you see "Connected to MongoDB", it's working!
4. You can revert back to local MongoDB for development if you want

**Result**: You'll have a cloud MongoDB connection string that starts with `mongodb+srv://`

## Phase 2: Deploy Backend to Render

1. **Push Code to GitHub**
   - Make sure all your changes are committed and pushed to GitHub
   - Your repository should include the updated backend files

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with your GitHub account

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your todo-app repository

4. **Configure Service Settings**
   - **Name**: `todo-app-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Set Environment Variables**
   Click "Advanced" and add these environment variables:
   
   - **MONGODB_URI**: Your MongoDB Atlas connection string from Phase 1
   - **JWT_SECRET**: Generate a strong secret (use a password generator, 32+ characters)
   - **NODE_ENV**: `production`
   - **FRONTEND_URL**: `https://your-netlify-app-name.netlify.app` (you'll update this after deploying frontend)

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Note your backend URL (e.g., `https://todo-app-backend-xxxx.onrender.com`)

## Phase 3: Update and Deploy Frontend

1. **Create Environment File for Frontend**
   Create `.env` in your project root (not in backend folder):
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   Replace `your-backend-url` with your actual Render backend URL.

2. **Update Netlify Deployment**
   - Go to your Netlify dashboard
   - Find your todo app
   - Go to "Site settings" → "Environment variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

3. **Redeploy Frontend**
   - In Netlify, go to "Deploys"
   - Click "Trigger deploy" → "Deploy site"
   - Wait for deployment to complete

4. **Update Backend CORS Settings**
   - Go back to Render dashboard
   - Find your backend service
   - Go to "Environment"
   - Update `FRONTEND_URL` to your actual Netlify URL
   - The service will automatically redeploy

## Phase 4: Testing

1. **Test Backend API**
   - Visit your Render backend URL directly
   - You should see: `{"message": "Todo API is running"}`

2. **Test Full Application**
   - Visit your Netlify frontend URL
   - Try registering a new user
   - Try logging in
   - Check browser console for any errors

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure `FRONTEND_URL` in Render matches your Netlify URL exactly
   - Check that both URLs use `https://`

2. **Database Connection Errors**
   - Verify MongoDB Atlas connection string is correct
   - Make sure you replaced `<password>` with actual password
   - Check that IP whitelist includes 0.0.0.0/0

3. **API Not Found (404 errors)**
   - Verify `VITE_API_URL` environment variable is set correctly in Netlify
   - Make sure it ends with `/api`
   - Check that Render backend is running

4. **Cold Start Delays**
   - Render free tier "spins down" after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds
   - This is normal for free tier

## Environment Variables Summary

### Render (Backend):
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Strong random secret
- `NODE_ENV`: `production`
- `FRONTEND_URL`: Your Netlify app URL

### Netlify (Frontend):
- `VITE_API_URL`: Your Render backend URL + `/api`

## Success Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Render and running
- [ ] Frontend environment variables set in Netlify
- [ ] Frontend redeployed with new environment variables
- [ ] CORS configured correctly
- [ ] Registration and login working
- [ ] No console errors in browser

Your app should now be fully deployed and working!
