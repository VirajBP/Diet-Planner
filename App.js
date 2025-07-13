import React from 'react';
import { Alert, Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './app/context/AuthContext';
import { MealsProvider } from './app/context/MealsContext';
import { OnboardingProvider } from './app/context/OnboardingContext';
import { ThemeProvider, useTheme } from './app/context/ThemeContext';
import AppNavigation from './app/navigation';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed with error:', error);
    console.error('Error info:', errorInfo);
    Alert.alert(
      'App Error',
      'The app encountered an error. Please restart the app.',
      [{ text: 'OK' }]
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
            Something went wrong. Please restart the app.
          </Text>
          <Text style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
            Error: {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { theme } = useTheme();
  return (
    <PaperProvider theme={theme}>
      <AppNavigation />
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
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </MealsProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
} 