# 🥗 Smart Diet Planner App

A personalized health and nutrition mobile app built with React Native that helps users track calories, plan meals, log water intake, and achieve their fitness goals — tailored based on user preferences and health data.

---

## 🚀 Features

### 🔓 Free Features
- 📲 **User Authentication** (Login/Register with Firebase)
- 👤 **Profile Setup** (Age, Gender, Height, Weight, Activity Level, Goal)
- 🔢 **Calorie Calculator** – Estimates daily calorie needs
- 🍽️ **Meal Suggestions** – Based on dietary restrictions (vegetarian, keto, etc.)
- 💧 **Water Tracker** – Log and visualize daily water intake
- 📊 **Dashboard** – Displays today's intake, goal, and progress
- 🎨 **Dark/Light Theme Support**

### 🔒 Premium Features
- 🛒 **Custom Grocery-Based Meal Planning**
- 🧾 **Custom Ingredient Suggestions**
- 🔔 **Hydration Reminders**
- 📈 **Monthly Water Intake Analytics**

---

## 🛠 Tech Stack

- **Frontend**: React Native (with Expo SDK), React Navigation
- **UI Components**: React Native Paper, React Native Vector Icons
- **Backend**: Node.js + Express (for API logic)
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth
- **State Management**: React Context API
- **Deployment**: Expo Go / Android Emulator / Physical device

---

## 🧑‍💻 Installation & Setup

### Prerequisites
- Node.js
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- MongoDB Atlas database connection
- Firebase project setup

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/diet-planner-app.git
   cd diet-planner-app
Install dependencies

npm install
Set environment variables
Create a .env file with:

MONGO_URI=your_mongo_db_connection_string
FIREBASE_API_KEY=your_firebase_api_key
Start Expo

npx expo start
Run the backend server

cd backend
npm install
npm run dev
📱 Screens in the App
✅ Login / Register

✅ Onboarding (optional)

✅ Dashboard

✅ Calorie Calculator

✅ Water Tracker

✅ Meal Suggestions

✅ Premium Screen

✅ Profile

✅ Settings

📂 Folder Structure
.
├── assets/
├── backend/
├── components/
│   └── ui/
├── context/
│   └── ThemeContext.jsx
│   └── AuthContext.jsx
├── navigation/
├── screens/
│   ├── DashboardScreen.jsx
│   ├── MealScreen.jsx
│   ├── WaterTrackerScreen.jsx
│   ├── CalorieCalculatorScreen.jsx
│   └── ...
├── App.jsx
└── README.md
🌟 Future Plans
AI meal generation using GPT APIs

Sync with wearables like Fitbit

Export diet logs to PDF

Community meal sharing

🤝 Contribution
Feel free to fork, contribute, or report issues!
We welcome feature ideas and bug fixes.

📧 Contact
Created by Viraj Pradhan
📩 viraj.pradhan04@gmail.com
📍 VIT Chennai

📜 License
This project is licensed under the MIT License.
