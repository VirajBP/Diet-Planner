import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { OnboardingProvider } from '../context/OnboardingContext';
import { ThemeProvider } from '../context/ThemeContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MealScreen from '../screens/MealScreen';
import MealSuggestionsScreen from '../screens/MealSuggestionsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PremiumScreen from '../screens/PremiumScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import WeightLogScreen from '../screens/WeightLogScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const paperTheme = usePaperTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          tabBarActiveTintColor: paperTheme.colors.primary,
          tabBarInactiveTintColor: paperTheme.colors.onSurface,
          backgroundColor: paperTheme.colors.surface,
          borderTopColor: paperTheme.colors.outline,
        },
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
    </Tab.Navigator>
  );
}

function AuthStack() {
  const paperTheme = usePaperTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: paperTheme.colors.background
        }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const paperTheme = usePaperTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: paperTheme.colors.background
        }
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="WeightLog" component={WeightLogScreen} />
      <Stack.Screen name="MealSuggestions" component={MealSuggestionsScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const paperTheme = usePaperTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: paperTheme.colors.background
        }
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Main" component={MainStack} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AuthProvider>
            <OnboardingProvider>
              <RootNavigator />
            </OnboardingProvider>
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 