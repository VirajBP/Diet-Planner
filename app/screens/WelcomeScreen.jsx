import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

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

const WelcomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../assets/logo.png')}
          style={[styles.logo, { tintColor: customColors.text }]}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: customColors.text }]}>
          Welcome to DietPlanner
        </Text>
        <Text style={[styles.subtitle, { color: customColors.text }]}>
          Your personal nutrition and wellness companion
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: customColors.primary }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.buttonText, { color: customColors.dark ? '#000000' : '#FFFFFF' }]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: customColors.primary }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.buttonText, { color: customColors.dark ? '#000000' : '#FFFFFF' }]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    padding: 20,
    width: '100%',
  },
  button: {
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen; 