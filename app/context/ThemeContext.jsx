import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const { LightTheme: AdaptedLightTheme, DarkTheme: AdaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...AdaptedLightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...AdaptedLightTheme.colors,
    primary: '#007AFF',
    secondary: '#0A84FF',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceVariant: '#E5E5EA',
    text: '#000000',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    card: '#FFFFFF',
    border: '#C6C6C8',
    notification: '#FF3B30',
    placeholder: '#8E8E93',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#3C3C43',
    onSurfaceVariant: '#3C3C43',
    onSurfaceDisabled: '#3C3C434D',
    outline: '#3C3C434D',
    primaryContainer: '#E5F1FF',
    onPrimaryContainer: '#003166',
    inputBackground: '#F2F2F7',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...AdaptedDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...AdaptedDarkTheme.colors,
    primary: '#0A84FF',
    secondary: '#64D2FF',
    background: '#000000',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    text: '#FFFFFF',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FFD60A',
    card: '#1C1C1E',
    border: '#38383A',
    notification: '#FF453A',
    placeholder: '#8E8E93',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    onSurface: '#EBEBF0',
    onSurfaceVariant: '#EBEBF0',
    onSurfaceDisabled: '#EBEBF54D',
    outline: '#48484A',
    primaryContainer: '#003166',
    onPrimaryContainer: '#E5F1FF',
    inputBackground: '#2C2C2E',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
};

const ThemeContext = createContext({
  theme: CombinedDefaultTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    // Update theme when system theme changes
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDark ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 