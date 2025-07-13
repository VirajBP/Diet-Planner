import { useRoute } from '@react-navigation/native';
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
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const navRoute = useRoute();
  // Prefer token from deep link params, fallback to route.params
  const token = navRoute?.params?.token || route?.params?.token;

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
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

  const handleResetPassword = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset link');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await mongodbService.resetPassword(token, newPassword);
      
      Alert.alert(
        'Success', 
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Login');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: customColors.card }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: customColors.text }]}>Invalid Reset Link</Text>
          <Text style={[styles.description, { color: customColors.text }]}>
            This password reset link is invalid or has expired. Please request a new one.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: customColors.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={[styles.title, { color: customColors.text }]}>Reset Password</Text>
          <Text style={[styles.description, { color: customColors.text }]}>
            Enter your new password below.
          </Text>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: customColors.card,
              color: customColors.text,
              borderColor: customColors.border
            }]}
            placeholder="New Password"
            placeholderTextColor="#8E8E93"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: customColors.card,
              color: customColors.text,
              borderColor: customColors.border
            }]}
            placeholder="Confirm New Password"
            placeholderTextColor="#8E8E93"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: customColors.primary }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.linkText, { color: customColors.text }]}>
              Back to Login
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
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
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

export default ResetPasswordScreen; 