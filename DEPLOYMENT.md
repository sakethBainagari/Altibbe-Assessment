# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (linked to GitHub)
- MongoDB Atlas account (for production database)
- Gemini API key

## 📋 Pre-Deployment Checklist

### 1. **Database Setup (MongoDB Atlas)**
```bash
# Create production database cluster
# Update connection string in environment variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/altibbe-production
```

### 2. **Environment Variables Setup**
Create these environment variables in Vercel dashboard:

**Backend Environment Variables:**
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-for-production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/altibbe-production
PORT=3000
```

**Frontend Environment Variables:**
```
VITE_API_URL=https://your-app-name.vercel.app/api
VITE_AI_SERVICE_URL=https://your-ai-service.vercel.app
```

### 3. **AI Service Deployment (Separate)**
Since Vercel doesn't support Python/Flask directly, deploy AI service to:
- **Railway** (recommended): Easy Python deployment
- **Heroku**: Classic platform
- **Google Cloud Run**: Serverless containers
- **Digital Ocean App Platform**: Simple deployment

## 🚀 Deployment Steps

### Step 1: Deploy AI Service First
1. Deploy `ai-service/` folder to Railway/Heroku
2. Set environment variable: `GEMINI_API_KEY=your_key_here`
3. Note the deployed URL (e.g., `https://your-ai-service.railway.app`)

### Step 2: Update Frontend Configuration
```bash
# Update frontend/.env.production
VITE_AI_SERVICE_URL=https://your-ai-service.railway.app
```

### Step 3: Deploy to Vercel
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## 🔧 Vercel Configuration

The `vercel.json` file is already configured with:
- Frontend build configuration
- Backend API routes
- Environment variables
- Function settings

## 🧪 Testing Deployment

After deployment, test these endpoints:
- `https://your-app.vercel.app/` - Frontend
- `https://your-app.vercel.app/api/health` - Backend health
- `https://your-ai-service.railway.app/health` - AI service health

## 🔒 Security Considerations

1. **Environment Variables**: Never commit .env files
2. **JWT Secret**: Use strong, unique secret for production
3. **MongoDB**: Use production-grade cluster with auth
4. **CORS**: Configure for production domains only
5. **Rate Limiting**: Already configured in backend

## 📊 Performance Optimization

1. **Frontend**: Already using Vite for optimized builds
2. **Backend**: Express with compression middleware
3. **Database**: MongoDB with proper indexing
4. **AI Service**: Caching implemented for repeated requests

## 🐛 Troubleshooting

**Common Issues:**
- **Build Failures**: Check TypeScript errors
- **API Errors**: Verify environment variables
- **CORS Issues**: Update allowed origins
- **AI Service**: Ensure external service is running

**Logs Access:**
- Vercel: Function logs in dashboard
- Railway: Real-time logs in dashboard
- MongoDB Atlas: Database logs
