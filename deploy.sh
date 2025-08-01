#!/bin/bash

echo "🚀 Vdoct Deployment Script"
echo "=========================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Git remote 'origin' not found. Please add your GitHub repository:"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

echo "✅ Git repository found"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Prepare for deployment - $(date)"
git push origin main

echo ""
echo "🎉 Code pushed to GitHub successfully!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🌐 Deploy Backend to Render:"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repository"
echo "   - Set Root Directory: Vdoct/backend"
echo "   - Add environment variables (see env.example)"
echo ""
echo "2. ⚡ Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Set Root Directory: Vdoct/frontend"
echo "   - Add environment variables:"
echo "     VITE_API_URL=https://your-backend-url.onrender.com"
echo "     VITE_SOCKET_URL=https://your-backend-url.onrender.com"
echo ""
echo "3. 🔧 Deploy Admin Panel to Vercel:"
echo "   - Create another Vercel project"
echo "   - Set Root Directory: Vdoct/admin"
echo "   - Add same environment variables as frontend"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 Useful Links:"
echo "   - Render: https://render.com"
echo "   - Vercel: https://vercel.com"
echo "   - MongoDB Atlas: https://mongodb.com/atlas"
echo "   - Cloudinary: https://cloudinary.com" 