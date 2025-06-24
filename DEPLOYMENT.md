# Deployment Guide - College Album to Render

This guide will walk you through deploying your College Album application to Render.

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Credit Card**: Required for Render account verification (free tier available)

## Step 1: Prepare Your Repository

The configuration files have been created for you:
- `backend/render.yaml` - Backend service configuration
- `frontend/render.yaml` - Frontend static site configuration
- Updated `backend/app/database.py` - Database configuration for production
- Updated `backend/app/main.py` - CORS configuration for production
- Updated `frontend/package.json` - Homepage configuration

## Step 2: Deploy Backend

### Option A: Using render.yaml (Recommended)

1. Go to your Render dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `backend/render.yaml` file
5. Click "Apply" to create both the web service and database

### Option B: Manual Setup

1. **Create PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `college-album-db`
   - Database: `collegealbum`
   - User: `collegealbum`
   - Plan: Free
   - Click "Create Database"

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `college-album-backend`
     - **Environment**: `Python`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Root Directory**: `backend`

3. **Add Environment Variables**:
   - `DATABASE_URL`: Copy from your PostgreSQL database settings
   - `ENVIRONMENT`: `production`
   - `PYTHON_VERSION`: `3.9.18`

## Step 3: Deploy Frontend

### Option A: Using render.yaml

1. Go to your Render dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Render will automatically detect the `frontend/render.yaml` file
5. Update the `REACT_APP_API_URL` environment variable to point to your backend URL

### Option B: Manual Setup

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `college-album-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Root Directory**: `frontend`

4. **Add Environment Variable**:
   - `REACT_APP_API_URL`: `https://your-backend-url.onrender.com`

## Step 4: Update URLs

After deployment, you'll need to update the URLs in your configuration:

1. **Backend URL**: Note your backend service URL (e.g., `https://college-album-backend.onrender.com`)
2. **Frontend Environment Variable**: Update the `REACT_APP_API_URL` in your frontend service to point to your backend URL
3. **CORS Configuration**: The backend is already configured to allow requests from common frontend URLs

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Try uploading a photo and creating an entry
3. Test the search and filter functionality
4. Verify that images are loading correctly

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check that `DATABASE_URL` is correctly set
   - Ensure the database is created and accessible

2. **CORS Errors**:
   - Verify the frontend URL is in the allowed origins list
   - Check that `REACT_APP_API_URL` is correctly set

3. **Build Failures**:
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt` and `package.json`

4. **Image Upload Issues**:
   - Verify the `entries` directory is being created
   - Check file permissions

### Environment Variables Checklist

**Backend**:
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `ENVIRONMENT` - Set to `production`
- ✅ `PYTHON_VERSION` - Set to `3.9.18`

**Frontend**:
- ✅ `REACT_APP_API_URL` - Backend service URL

## Cost Considerations

- **Free Tier**: Both services and database are free for basic usage
- **Limitations**: 
  - Services sleep after 15 minutes of inactivity
  - Database has 1GB storage limit
  - 750 hours/month for free tier

## Next Steps

1. **Custom Domain**: Add a custom domain in Render settings
2. **SSL Certificate**: Automatically provided by Render
3. **Monitoring**: Use Render's built-in monitoring and logs
4. **Backups**: Set up database backups for production use

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check build logs and service logs in your Render dashboard 