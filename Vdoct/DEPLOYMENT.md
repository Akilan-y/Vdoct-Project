# Vdoct Deployment Guide - Vercel

## 🚀 Complete Project Deployment

This guide will help you deploy the entire Vdoct project (Frontend + Admin Panel + Backend) to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab**: Your code should be in a Git repository
3. **Environment Variables**: Prepare your environment variables

## 🔧 Environment Variables Setup

### Required Environment Variables

Create a `.env` file in the root directory or set these in Vercel dashboard:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Admin URL (for CORS)
ADMIN_URL=https://your-admin-domain.vercel.app
```

## 🚀 Deployment Steps

### Option 1: Monorepo Deployment (Recommended)

1. **Push to Git**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Set the root directory to `/Vdoct`
   - Configure environment variables
   - Deploy!

3. **URL Structure**:
   - **Main App**: `https://your-project.vercel.app`
   - **Admin Panel**: `https://your-project.vercel.app/admin`
   - **API**: `https://your-project.vercel.app/api`

### Option 2: Separate Deployments

If you prefer separate deployments:

#### Frontend Deployment
```bash
cd Vdoct/frontend
vercel --prod
```

#### Admin Panel Deployment
```bash
cd Vdoct/admin
vercel --prod
```

#### Backend Deployment
```bash
cd Vdoct/backend
vercel --prod
```

## 🔧 Configuration Files

### Root vercel.json
- Handles routing between frontend, admin, and backend
- Configures build processes
- Sets up API routes

### Build Process
1. **Frontend**: Builds React app with Vite
2. **Admin**: Builds React admin panel
3. **Backend**: Deploys Node.js server

## 🌐 URL Structure After Deployment

```
https://your-project.vercel.app/          # Main frontend
https://your-project.vercel.app/admin     # Admin panel
https://your-project.vercel.app/api/*     # Backend API
```

## 🔄 Update API URLs

After deployment, update your frontend and admin API calls to use the new URLs:

### Frontend (src/context/AppContext.jsx)
```javascript
const API_BASE_URL = 'https://your-project.vercel.app/api';
```

### Admin (src/context/AdminContext.jsx)
```javascript
const API_BASE_URL = 'https://your-project.vercel.app/api';
```

## ✅ Post-Deployment Checklist

1. ✅ Environment variables configured
2. ✅ Database connection working
3. ✅ File uploads working (Cloudinary)
4. ✅ Authentication working
5. ✅ CORS configured properly
6. ✅ All routes accessible
7. ✅ Logo changes visible

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version (>=18.0.0)
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **API Errors**:
   - Verify MongoDB connection string
   - Check CORS configuration
   - Ensure JWT secret is set

3. **File Upload Issues**:
   - Verify Cloudinary credentials
   - Check file size limits

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for errors

## 🎉 Success!

Once deployed, your Vdoct platform will be live with:
- ✅ New logos in browser tabs
- ✅ Full-stack functionality
- ✅ Admin panel access
- ✅ Patient portal
- ✅ Doctor management
- ✅ Appointment system 