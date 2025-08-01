# 🚀 Vdoct Deployment Guide: Vercel + Render

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - [vercel.com](https://vercel.com)
3. **Render Account** - [render.com](https://render.com)
4. **MongoDB Atlas** - [mongodb.com/atlas](https://mongodb.com/atlas)
5. **Cloudinary Account** - [cloudinary.com](https://cloudinary.com)

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Repository Structure
```
Vdoct/
├── backend/          # Deploy to Render
├── frontend/         # Deploy to Vercel
├── admin/           # Deploy to Vercel
└── README.md
```

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### 2.2 Connect Repository
1. Connect your GitHub repository
2. Select the repository
3. Configure the service:
   - **Name**: `vdoct-backend`
   - **Root Directory**: `Vdoct/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2.3 Environment Variables
Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/vdoct?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-backend-url.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-app.vercel.app
ADMIN_URL=https://your-admin-app.vercel.app
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://your-app-name.onrender.com`

## ⚡ Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"

### 3.2 Deploy Frontend (Patient App)
1. Import your GitHub repository
2. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Vdoct/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**:
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

4. Deploy and note the URL: `https://your-frontend-app.vercel.app`

### 3.3 Deploy Admin Panel
1. Create another Vercel project
2. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Vdoct/admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**:
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

4. Deploy and note the URL: `https://your-admin-app.vercel.app`

## 🔄 Step 4: Update Environment Variables

### 4.1 Update Backend (Render)
Go back to Render dashboard and update:
```env
FRONTEND_URL=https://your-frontend-app.vercel.app
ADMIN_URL=https://your-admin-app.vercel.app
GOOGLE_REDIRECT_URI=https://your-backend-url.onrender.com/api/auth/google/callback
```

### 4.2 Redeploy Backend
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend
```bash
curl https://your-backend-url.onrender.com/api/health
```

### 5.2 Test Frontend
1. Visit: `https://your-frontend-app.vercel.app`
2. Test registration/login
3. Test appointment booking

### 5.3 Test Admin Panel
1. Visit: `https://your-admin-app.vercel.app`
2. Test admin login
3. Test doctor management

## 🔧 Step 6: Configure External Services

### 6.1 MongoDB Atlas
1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Update `MONGODB_URI` in Render

### 6.2 Cloudinary
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Update Cloudinary variables in Render

### 6.3 Payment Gateways
1. **Razorpay**: Create account and get API keys
2. **Stripe**: Create account and get secret key
3. Update payment variables in Render

### 6.4 Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Update Google variables in Render

## 🚨 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Update backend CORS configuration in `server.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-app.vercel.app',
    'https://your-admin-app.vercel.app'
  ],
  credentials: true
}));
```

### Issue 2: WebSocket Connection Failed
**Solution**: Ensure Socket.IO is properly configured for production:
```javascript
const io = new Server(server, {
  cors: {
    origin: [
      'https://your-frontend-app.vercel.app',
      'https://your-admin-app.vercel.app'
    ],
    credentials: true
  }
});
```

### Issue 3: Environment Variables Not Working
**Solution**: 
1. Check variable names match exactly
2. Redeploy after adding variables
3. Restart the service

### Issue 4: Build Failures
**Solution**:
1. Check package.json scripts
2. Ensure all dependencies are in dependencies (not devDependencies)
3. Check for syntax errors

## 📊 Monitoring & Maintenance

### 1. Render Dashboard
- Monitor logs in Render dashboard
- Check resource usage
- Set up alerts

### 2. Vercel Dashboard
- Monitor build status
- Check analytics
- Set up custom domains

### 3. MongoDB Atlas
- Monitor database performance
- Set up backups
- Check connection status

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, random secret
3. **CORS**: Only allow your frontend domains
4. **HTTPS**: All services use HTTPS by default
5. **Rate Limiting**: Consider adding rate limiting to API

## 🎉 Success!

Your Vdoct application is now deployed and accessible at:
- **Frontend**: `https://your-frontend-app.vercel.app`
- **Admin Panel**: `https://your-admin-app.vercel.app`
- **Backend API**: `https://your-backend-url.onrender.com`

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Check Vercel build logs
3. Verify environment variables
4. Test locally first
5. Check browser console for errors 