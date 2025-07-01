# Vdoct Deployment Guide - Vercel

## 🚀 Complete Project Deployment

This guide will help you deploy the entire Vdoct project (Frontend + Admin Panel + Backend) to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab**: Your code should be in a Git repository
3. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com) for image storage
4. **Environment Variables**: Prepare your environment variables

## 🔧 Environment Variables Setup

### Required Environment Variables

Create a `.env` file in the root directory or set these in Vercel dashboard:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://Akill:3ZKDb2QZL5vjK6Pq@cluster0.rat0lii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret
JWT_SECRET=mysecretkey12345678

# Cloudinary Configuration (REQUIRED for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Credentials
ADMIN_EMAIL=admin@vdoct.com
ADMIN_PASSWORD=admin123

# Frontend URL (for CORS)
FRONTEND_URL=https://your-project.vercel.app

# Admin URL (for CORS)
ADMIN_URL=https://your-project.vercel.app/admin
```

## 🖼️ Cloudinary Setup

1. **Sign up at [cloudinary.com](https://cloudinary.com)**
2. **Get your credentials** from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. **Replace the placeholder values** in your environment variables

## 🚀 Deployment Steps

### Option 1: Monorepo Deployment (Recommended)

1. **Push to Git**:
   ```bash
   git add .
   git commit -m "Updated to use Cloudinary for image storage"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Set the root directory to `/Vdoct`
   - Configure environment variables (especially Cloudinary)
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
2. ✅ Cloudinary credentials set
3. ✅ Database connection working
4. ✅ File uploads working (Cloudinary)
5. ✅ Authentication working
6. ✅ CORS configured properly
7. ✅ All routes accessible
8. ✅ Logo changes visible

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
   - Check file size limits (5MB)
   - Ensure Cloudinary account is active

4. **Image Display Issues**:
   - Check if Cloudinary URLs are correct
   - Verify image format support (jpg, jpeg, png, gif, webp)
   - Check CORS for image loading

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for errors
5. Verify Cloudinary dashboard for uploads

## 🎉 Success!

Once deployed, your Vdoct platform will be live with:
- ✅ New logos in browser tabs
- ✅ Full-stack functionality
- ✅ Admin panel access
- ✅ Patient portal
- ✅ Doctor management
- ✅ Appointment system
- ✅ Cloudinary image storage 