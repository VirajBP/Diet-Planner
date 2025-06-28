import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const isDark = theme.dark;
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
  const customColors = isDark ? FRESH_CALM_DARK:FRESH_CALM_LIGHT

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // Navigation will happen automatically based on authentication state
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.card }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Image
            source={require('../assets/logo.png')}
            style={[styles.logo, { tintColor: customColors.text }]}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: customColors.text }]}>Welcome Back!</Text>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: customColors.card,
              color: customColors.text,
              borderColor: customColors.border
            }]}
            placeholder="Email"
            placeholderTextColor={customColors.text}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: customColors.card,
              color: customColors.text,
              borderColor: customColors.border
            }]}
            placeholder="Password"
            placeholderTextColor={customColors.text}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: customColors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: customColors.dark}]}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.linkText, { color: customColors.text }]}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
  },
});

export default LoginScreen; 