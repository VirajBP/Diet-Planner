# 🚀 Diet Planner App Deployment Guide

## Overview
This guide covers multiple deployment options for your Diet Planner React Native app. Choose the method that best fits your needs.

## 📱 **Option 1: Expo Application Services (EAS) - Recommended**

### **Step 1: Setup EAS**
```bash
# Install EAS CLI (already done)
npm install -g eas-cli

# Login to your Expo account
eas login

# Initialize EAS project
eas build:configure
```

### **Step 2: Configure Your Project**
1. Update `app.json` with your project details
2. Replace `"your-project-id-here"` in `app.json` with your actual Expo project ID
3. Ensure your backend server is deployed and accessible

### **Step 3: Build Your App**

#### **For Android:**
```bash
# Development build (for testing)
eas build --platform android --profile development

# Preview build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

#### **For iOS:**
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

### **Step 4: Submit to App Stores**

#### **Google Play Store:**
```bash
# Submit to Play Store
eas submit --platform android
```

#### **Apple App Store:**
```bash
# Submit to App Store
eas submit --platform ios
```

## 🌐 **Option 2: Web Deployment**

### **Deploy to Vercel (Recommended for Web)**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
# Build and deploy
vercel --prod
```

### **Deploy to Netlify**

1. **Build the web version:**
```bash
npm run web
```

2. **Deploy to Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=web-build
```

## 📦 **Option 3: Manual APK Build (Android)**

### **Step 1: Build APK Locally**
```bash
# Install Expo CLI
npm install -g @expo/cli

# Build APK
expo build:android -t apk
```

### **Step 2: Distribute APK**
- Share the APK file directly with users
- Upload to Google Drive or similar service
- Use services like Firebase App Distribution

## 🍎 **Option 4: Manual iOS Build**

### **Requirements:**
- macOS computer
- Xcode installed
- Apple Developer Account ($99/year)

### **Steps:**
```bash
# Build for iOS
expo build:ios

# Or use EAS
eas build --platform ios
```

## 🔧 **Backend Deployment**

### **Deploy Backend to Render (Free Tier Available)**

1. **Create a Render account** at render.com
2. **Connect your GitHub repository**
3. **Configure the backend service:**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables: Add your MongoDB connection string

### **Deploy Backend to Railway**

1. **Create a Railway account** at railway.app
2. **Connect your GitHub repository**
3. **Add environment variables**
4. **Deploy automatically**

### **Deploy Backend to Heroku**

1. **Create a Heroku account**
2. **Install Heroku CLI:**
```bash
npm install -g heroku
```

3. **Deploy:**
```bash
cd backend
heroku create your-app-name
git add .
git commit -m "Deploy backend"
git push heroku main
```

## 📋 **Pre-Deployment Checklist**

### **App Configuration:**
- [ ] Update app name and version in `app.json`
- [ ] Set proper bundle identifiers
- [ ] Configure app icons and splash screen
- [ ] Update backend API URLs for production
- [ ] Test automatic login functionality
- [ ] Verify all features work correctly

### **Backend Configuration:**
- [ ] Deploy backend to production server
- [ ] Update CORS settings for production
- [ ] Configure environment variables
- [ ] Set up MongoDB Atlas or production database
- [ ] Test all API endpoints

### **Security:**
- [ ] Ensure HTTPS is enabled
- [ ] Validate all user inputs
- [ ] Implement proper error handling
- [ ] Test authentication flow

## 🎯 **Recommended Deployment Strategy**

### **For MVP/Testing:**
1. Deploy backend to Render (free)
2. Use EAS preview builds for Android APK
3. Share APK directly with testers

### **For Production:**
1. Deploy backend to Railway or Heroku
2. Use EAS production builds
3. Submit to Google Play Store and Apple App Store

## 📊 **Monitoring & Analytics**

### **Add Analytics:**
```bash
# Install Expo Analytics
expo install expo-analytics

# Or use Firebase Analytics
expo install @react-native-firebase/app @react-native-firebase/analytics
```

### **Error Tracking:**
```bash
# Install Sentry
expo install @sentry/react-native
```

## 🔄 **Continuous Deployment**

### **GitHub Actions Workflow:**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy App
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy to EAS
        run: eas build --platform android --profile production
```

## 📞 **Support & Troubleshooting**

### **Common Issues:**
1. **Build fails**: Check EAS build logs
2. **App crashes**: Test on physical devices
3. **Backend connection**: Verify API URLs
4. **Authentication issues**: Test token persistence

### **Resources:**
- [EAS Documentation](https://docs.expo.dev/eas/)
- [Expo Deployment Guide](https://docs.expo.dev/distribution/introduction/)
- [React Native Deployment](https://reactnative.dev/docs/deployment)

## 🎉 **Next Steps**

1. **Choose your deployment method**
2. **Deploy your backend first**
3. **Build and test your app**
4. **Submit to app stores**
5. **Monitor and iterate**

Your Diet Planner app is now ready for deployment! 🚀 