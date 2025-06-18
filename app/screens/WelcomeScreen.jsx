import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const WelcomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../assets/logo.png')}
          style={[styles.logo, { tintColor: theme.colors.text }]}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to DietPlanner
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Your personal nutrition and wellness companion
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.buttonText, { color: theme.dark ? '#000000' : '#FFFFFF' }]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.buttonText, { color: theme.dark ? '#000000' : '#FFFFFF' }]}>
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