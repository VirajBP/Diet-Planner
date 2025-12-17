# 🔧 Gemini API Environment Variables Setup

## 🚨 **Required Environment Variables**

### **Essential (Must Have)**
```env
# Your Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🔧 **Optional Environment Variables**

### **Project Configuration (Advanced Usage)**
```env
# Project ID (Optional - for advanced usage)
GEMINI_PROJECT_ID=your_project_id_here

# Project Name (Optional - for advanced usage)  
GEMINI_PROJECT_NAME=your_project_name_here

# Location (Optional - defaults to 'global')
GEMINI_LOCATION=global
```

### **Other App Variables (Not Gemini-related)**
```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Other API Keys
PEXELS_API_KEY=your_pexels_api_key
EDAMAM_APP_ID=your_edamam_app_id
EDAMAM_APP_KEY=your_edamam_app_key
```

## 🎯 **Do You Need Project ID/Name?**

### **For Free Tier (Most Common)**
- ❌ **Project ID**: NOT required
- ❌ **Project Name**: NOT required
- ✅ **API Key**: Required

### **For Paid Tier (Advanced Usage)**
- ✅ **Project ID**: May be required for billing
- ✅ **Project Name**: May be required for billing
- ✅ **API Key**: Required

## 🚀 **How to Get Your Gemini API Key**

### **Step 1: Visit Google AI Studio**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account

### **Step 2: Create API Key**
1. Click "Create API Key"
2. Choose "Create API Key in new project" or existing project
3. Copy the generated API key

### **Step 3: Add to Environment**
```env
GEMINI_API_KEY=AIzaSyC...your_actual_key_here
```

## 📊 **Free Tier Limits**

- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Model**: `gemini-1.5-pro`

## 🔍 **Finding Project Information (If Needed)**

### **If You Have a Paid Plan**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Note the Project ID and Project Name
4. Add to your `.env` file

### **Project ID Format**
- Usually looks like: `my-project-123456`
- Found in Google Cloud Console

### **Project Name Format**
- Usually looks like: `My Diet Planner Project`
- Human-readable name

## 🧪 **Testing Your Setup**

### **Test API Key**
```bash
cd backend
node test-gemini-improvements.js
```

### **Check Quota Status**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/chatbot/quota
```

## ⚠️ **Common Issues**

### **"API Key Not Found"**
- Check that `GEMINI_API_KEY` is set in your `.env` file
- Ensure no extra spaces or quotes around the key
- Restart your server after adding the key

### **"Quota Exceeded"**
- Free tier has daily limits
- Wait until midnight for reset
- Consider upgrading to paid plan

### **"Project Not Found"**
- Project ID/Name are optional for free tier
- Only needed for paid plans with billing
- Can be left empty for basic usage

## 🎯 **Recommended Setup for Your App**

### **Minimum Setup (Free Tier)**
```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional but recommended
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### **Advanced Setup (Paid Tier)**
```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - for billing and advanced features
GEMINI_PROJECT_ID=your_project_id_here
GEMINI_PROJECT_NAME=your_project_name_here
GEMINI_LOCATION=global

# Other app variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## 🔒 **Security Notes**

- ✅ Keep your API key secret
- ✅ Never commit `.env` files to version control
- ✅ Use environment variables in production
- ✅ Rotate API keys regularly

## 📈 **Upgrading to Paid Plan**

1. Visit [Google AI Studio Pricing](https://ai.google.dev/pricing)
2. Set up billing account
3. Note your Project ID and Project Name
4. Update your `.env` file
5. Update `config/gemini.js` with new limits

Your Gemini API should work perfectly with just the API key! 🎉 