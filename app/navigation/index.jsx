import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { setStatusBarBackgroundColor, setStatusBarStyle } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';

// Import screens
import SplashScreen from '../components/SplashScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import CalorieCalculatorScreen from '../screens/CalorieCalculatorScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MealScreen from '../screens/MealScreen';
import MealSuggestionsScreen from '../screens/MealSuggestionsScreen';
import NutritionSearchScreen from '../screens/NutritionSearchScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PremiumScreen from '../screens/PremiumScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProgressStatisticsScreen from '../screens/ProgressStatistics';
import RegisterScreen from '../screens/RegisterScreen';
import RemindersScreen from '../screens/RemindersScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import WeightLogScreen from '../screens/WeightLogScreen';
import WelcomeScreen from '../screens/WelcomeScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['nutripulse://'],
  config: {
    screens: {
      Auth: {
        screens: {
          ResetPassword: 'reset-password',
        },
      },
      ResetPassword: 'reset-password',
      // Add other screens if you want to support more deep links
    },
  },
};

// Fresh & Calm (Mint Theme)
const FRESH_CALM_LIGHT = {
  primary: '#2ECC71', // Mint Green
  secondary: '#A3E4D7',
  background: '#FDFEFE',
  surface: '#FFFFFF',
  text: '#1C1C1C',
  card: '#FFFFFF',
  border: '#A3E4D7',
  error: '#FF5252',
};
const FRESH_CALM_DARK = {
  primary: '#27AE60',
  secondary: '#48C9B0',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FAFAFA',
  card: '#1E1E1E',
  border: '#48C9B0',
  error: '#FF5252',
};

function TabNavigator() {
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: customColors.card,
          borderTopColor: customColors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: customColors.primary,
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#B0B0B0',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Meals"
        component={MealScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
        
      />
      <Tab.Screen
        name="Water"
        component={WaterTrackerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="water" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercise"
        component={ExerciseScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: customColors.background,
          borderBottomWidth: 1,
          borderBottomColor: customColors.border,
        },
        headerTintColor: customColors.text,
        contentStyle: {
          backgroundColor: customColors.background
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: customColors.card,
          borderBottomWidth: 1,
          borderBottomColor: customColors.border,
        },
        headerTintColor: customColors.text,
        contentStyle: {
          backgroundColor: customColors.background
        },
        navigationBarColor: customColors.card,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="WeightLog" component={WeightLogScreen} />
      <Stack.Screen name="MealSuggestions" component={MealSuggestionsScreen} />
      <Stack.Screen name="NutritionSearch" component={NutritionSearchScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="CalorieCalculator" component={CalorieCalculatorScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen}/>
      <Stack.Screen name="ProgressStatistics" component={ProgressStatisticsScreen}/>
      <Stack.Screen name="Exercise" component={ExerciseScreen}/>
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { theme, isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  const colorScheme = useColorScheme();
  const { user, loading: authLoading } = useAuth();
  const { hasSeenOnboarding, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Set status bar style and background color dynamically
    setStatusBarStyle(isDark ? 'light' : 'dark');
    setStatusBarBackgroundColor(isDark ? '#121212' : '#FDFEFE', true);
  }, [isDark, colorScheme]);

  // Show splash screen while checking authentication and onboarding status
  if (authLoading || onboardingLoading) {
    return <SplashScreen />;
  }

  // Render the appropriate navigator based on state
  if (!hasSeenOnboarding) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: customColors.card,
            borderBottomWidth: 1,
            borderBottomColor: customColors.border,
          },
          headerTintColor: customColors.text,
          contentStyle: {
            backgroundColor: customColors.background
          },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  if (user) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: customColors.card,
            borderBottomWidth: 1,
            borderBottomColor: customColors.border,
          },
          headerTintColor: customColors.text,
          contentStyle: {
            backgroundColor: customColors.background
          },
        }}
      >
        <Stack.Screen name="Main" component={MainStack} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: customColors.card,
          borderBottomWidth: 1,
          borderBottomColor: customColors.border,
        },
        headerTintColor: customColors.text,
        contentStyle: {
          backgroundColor: customColors.background
        },
      }}
    >
      <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AppNavigation() {
  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default AppNavigation; 