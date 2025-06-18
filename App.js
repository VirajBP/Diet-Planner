import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './app/context/AuthContext';
import { OnboardingProvider } from './app/context/OnboardingContext';
import { ThemeProvider, useTheme } from './app/context/ThemeContext';
import Navigation from './app/navigation';

const ThemedApp = () => {
  const { theme, isDark } = useTheme();

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Navigation />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <ThemedApp />
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 