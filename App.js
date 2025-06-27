import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './app/context/AuthContext';
import { MealsProvider } from './app/context/MealsContext';
import { OnboardingProvider } from './app/context/OnboardingContext';
import { ThemeProvider, useTheme } from './app/context/ThemeContext';
import RootNavigator from './app/navigation';

function AppContent() {
  const { theme } = useTheme();
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            <MealsProvider>
              <AppContent />
            </MealsProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 