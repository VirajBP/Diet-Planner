import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import MealScreen from '../screens/MealScreen';
import MealSuggestionsScreen from '../screens/MealSuggestionsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { theme } = useTheme();
  const paperTheme = usePaperTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: paperTheme.colors.background }
      }}
    >
      <Stack.Screen name="Meals" component={MealScreen} />
      <Stack.Screen 
        name="MealSuggestions" 
        component={MealSuggestionsScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 