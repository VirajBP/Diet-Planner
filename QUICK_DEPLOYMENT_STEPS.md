# 🚀 Quick Deployment Steps for Diet Planner App

## **Step 1: Deploy Your Backend First**

### **Option A: Deploy to Render (Free)**
1. Go to [render.com](https://render.com) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `diet-planner-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: Add your MongoDB connection string
5. Click "Create Web Service"

### **Option B: Deploy to Railway (Free)**
1. Go to [railway.app](https://railway.app) and create an account
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `backend`
5. Add environment variables for MongoDB
6. Deploy

## **Step 2: Update Your App Configuration**

1. **Update `app/config/environment.js`:**
```javascript
// Replace localhost with your deployed backend URL
const API_URL = 'https://your-backend-url.onrender.com/api';
// or
const API_URL = 'https://your-backend-url.railway.app/api';
```

2. **Update `app.json` with your details:**
```json
{
  "expo": {
    "name": "Diet Planner",
    "slug": "diet-planner-app",
    "owner": "your-expo-username"
  }
}
```

## **Step 3: Deploy Your App**

### **For Android APK (Quick Testing):**

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Build APK:**
```bash
eas build --platform android --profile preview
```

4. **Download and Share APK:**
- The build will provide a download link
- Share this APK with testers

### **For Google Play Store:**

1. **Build Production Version:**
```bash
eas build --platform android --profile production
```

2. **Submit to Play Store:**
```bash
eas submit --platform android
```

### **For iOS App Store:**

1. **Build for iOS:**
```bash
eas build --platform ios --profile production
```

2. **Submit to App Store:**
```bash
eas submit --platform ios
```

## **Step 4: Web Deployment (Optional)**

### **Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```

### **Deploy to Netlify:**
```bash
npm run web
npm install -g netlify-cli
netlify deploy --prod --dir=web-build
```

## **🎯 Recommended Quick Start:**

1. **Deploy backend to Render** (5 minutes)
2. **Update API URLs** in your app
3. **Build Android APK** with EAS (10 minutes)
4. **Share APK** with testers
5. **Submit to Play Store** when ready

## **📱 Testing Your Deployment:**

1. **Test Backend:**
   - Visit your backend URL + `/api/health`
   - Should return a success message

2. **Test App:**
   - Install APK on Android device
   - Test login/register functionality
   - Verify all features work

## **🔧 Troubleshooting:**

### **Backend Issues:**
- Check Render/Railway logs
- Verify MongoDB connection
- Test API endpoints with Postman

### **App Issues:**
- Check EAS build logs
- Verify API URLs are correct
- Test on physical device

### **Common Errors:**
- **CORS errors**: Update backend CORS settings
- **Network errors**: Check API URLs
- **Build fails**: Check EAS build logs

## **📞 Need Help?**

1. Check the full `DEPLOYMENT_GUIDE.md`
2. Visit [Expo Documentation](https://docs.expo.dev)
3. Check [Render Documentation](https://render.com/docs)
4. Check [Railway Documentation](https://docs.railway.app)

## **🎉 You're Ready to Deploy!**

Follow these steps and your Diet Planner app will be live in no time! 🚀 