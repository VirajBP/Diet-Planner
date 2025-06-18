import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Provider as PaperProvider } from 'react-native-paper';
import Navigation from './navigation';
import { ThemeProvider, useTheme } from './context/ThemeContext'; // make sure the path is correct

// Font loader moved out for clarity
const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'AntDesign': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf'),
      'Entypo': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf'),
      'Feather': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),
      'FontAwesome': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf'),
      'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
      'MaterialIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
      'MaterialCommunityIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
    });
  } catch (error) {
    console.warn('Error loading fonts:', error);
  }
};

function Main() {
  const { theme } = useTheme(); // ✅ Use dynamic theme from context
  return (
    <PaperProvider theme={theme}>
      <Navigation />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}

export default function App() {
  React.useEffect(() => {
    loadFonts();
  }, []);

  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
}
