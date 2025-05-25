# Yooli Backend Deployment Guide

This guide explains how to deploy the Yooli NestJS backend to various platforms.

## Overview

The Yooli backend is a NestJS application that builds to the `dist/` directory. It's an API server, not a static site, so it requires Node.js runtime for deployment.

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure these environment variables are set in your deployment platform:

```bash
# Database
MONGODB_URI=mongodb+srv://your-connection-string

# JWT
JWT_SECRET=your-jwt-secret-key

# TURN Server (Open Relay Project)
OPEN_RELAY_API_KEY=your-api-key
OPEN_RELAY_APP_NAME=your-app-name
OPEN_RELAY_USERNAME=your-username
OPEN_RELAY_PASSWORD=your-password

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# App Configuration
NODE_ENV=production
PORT=3000
```

### 2. Build the Application
```bash
npm run build
```

## Deployment Options

### Option 1: Vercel (Recommended for Serverless)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configuration**: Uses `vercel.json` (already created)

4. **Environment Variables**: Set in Vercel dashboard or CLI:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   # ... add all other variables
   ```

### Option 2: Railway

1. **Connect GitHub Repository**:
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will auto-detect NestJS

2. **Environment Variables**: Add in Railway dashboard

3. **Deploy**: Automatic on git push

### Option 3: Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**:
   ```bash
   heroku create yooli-backend
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI=your-connection-string
   heroku config:set JWT_SECRET=your-secret
   # ... set all other variables
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create App**: Go to DigitalOcean App Platform
2. **Connect Repository**: Link your GitHub repository
3. **Configure Build**:
   - Build Command: `npm run build`
   - Run Command: `npm run start:prod`
4. **Set Environment Variables**: In app settings

### Option 5: Docker (Self-hosted)

1. **Build Docker Image**:
   ```bash
   docker build -t yooli-backend .
   ```

2. **Run Container**:
   ```bash
   docker run -p 3000:3000 \
     -e MONGODB_URI=your-connection-string \
     -e JWT_SECRET=your-secret \
     yooli-backend
   ```

3. **Docker Compose** (with MongoDB):
   ```yaml
   version: '3.8'
   services:
     backend:
       build: .
       ports:
         - "3000:3000"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/yooli
         - JWT_SECRET=your-secret
       depends_on:
         - mongo
     
     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
   
   volumes:
     mongo_data:
   ```

### Option 6: AWS (EC2/ECS/Lambda)

#### EC2:
1. Launch EC2 instance with Node.js
2. Clone repository and build
3. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name yooli-backend
   ```

#### ECS:
1. Push Docker image to ECR
2. Create ECS service with the image
3. Configure load balancer and auto-scaling

#### Lambda:
1. Use Serverless Framework or AWS SAM
2. Configure API Gateway integration

## Post-Deployment

### 1. Test Endpoints
```bash
# Health check
curl https://your-domain.com/api/v1/health

# TURN server test
curl https://your-domain.com/api/v1/turn/test
```

### 2. Update Frontend Configuration
Update frontend API URLs to point to your deployed backend:

```typescript
// frontend/services/config.ts
const API_URL = 'https://your-backend-domain.com/api/v1';
```

### 3. Configure CORS
Ensure your backend allows requests from your frontend domain:

```typescript
// src/main.ts
app.enableCors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:3000', // for development
  ],
  credentials: true,
});
```

### 4. Set up Monitoring
- Configure logging (Winston, Pino)
- Set up error tracking (Sentry)
- Monitor performance (New Relic, DataDog)

## Troubleshooting

### Common Issues

1. **"No Output Directory named 'public' found"**
   - This error occurs when deploying to static site platforms
   - Use serverless platforms (Vercel, Netlify Functions) or VPS/containers instead

2. **Environment Variables Not Loading**
   - Ensure all required environment variables are set
   - Check variable names match exactly
   - Verify .env file is not committed to git

3. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check network access (whitelist deployment platform IPs)
   - Ensure database is accessible from deployment platform

4. **Build Failures**
   - Check Node.js version compatibility (>=18.0.0)
   - Ensure all dependencies are installed
   - Verify TypeScript compilation succeeds locally

5. **CORS Errors**
   - Configure CORS to allow your frontend domain
   - Check if credentials are required
   - Verify preflight requests are handled

### Debug Commands

```bash
# Check build output
npm run build
ls -la dist/

# Test locally
npm run start:prod

# Check environment variables
node -e "console.log(process.env)"

# Test database connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('DB Error:', err));
"
```

## Performance Optimization

### 1. Enable Compression
```typescript
// Already configured in main.ts
app.use(compression());
```

### 2. Add Caching
```typescript
// Add Redis for caching
import { CacheModule } from '@nestjs/cache-manager';
```

### 3. Database Optimization
- Add database indexes
- Use connection pooling
- Implement query optimization

### 4. Security
```typescript
// Already configured in main.ts
app.use(helmet());
```

## Scaling Considerations

1. **Horizontal Scaling**: Deploy multiple instances behind a load balancer
2. **Database Scaling**: Use MongoDB Atlas with auto-scaling
3. **Caching**: Implement Redis for session and data caching
4. **CDN**: Use CloudFront or similar for static assets
5. **Monitoring**: Set up comprehensive logging and monitoring

Your NestJS backend is now ready for production deployment! 🚀 