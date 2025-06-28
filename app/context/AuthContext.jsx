import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { mongodbService } from '../services/mongodb.service';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // If no token exists, just set loading to false and return
      if (!token) {
        setLoading(false);
        return;
      }

      // Validate token format (basic check)
      if (typeof token !== 'string' || token.length < 10) {
        console.warn('Invalid token format, clearing storage');
        await AsyncStorage.removeItem('userToken');
        setLoading(false);
        return;
      }

      // Only proceed with profile fetch if we have a valid token
      mongodbService.setToken(token);
      try {
        const userData = await mongodbService.getProfile();
        setUser(userData);
        
        // Check for trial expiry and prompt
        if (userData.premiumTrialUsed && !userData.isPremium) {
          const prompted = await AsyncStorage.getItem('premiumTrialPrompted');
          if (!prompted) {
            Alert.alert(
              'Your free premium trial has ended',
              'Upgrade to Premium to continue enjoying all features!',
              [
                { text: 'Maybe Later', style: 'cancel' },
                { text: 'Upgrade Now', onPress: () => {/* navigate to premium screen if needed */} },
              ]
            );
            await AsyncStorage.setItem('premiumTrialPrompted', 'true');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile fetch fails due to authentication issues, clear the token and user
        if (error.message.includes('Unauthorized') || error.message.includes('Invalid token') || error.response?.status === 401) {
          console.log('Token is invalid or expired, clearing authentication state');
          await AsyncStorage.removeItem('userToken');
          setUser(null);
          mongodbService.setToken(null);
        } else {
          // For other errors (network, server issues), keep the token but don't set user
          // This allows the user to retry when the connection is restored
          console.log('Network or server error, keeping token for retry');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Clear any invalid state
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      mongodbService.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      // Format email consistently
      const formattedEmail = email.toLowerCase().trim();
      
      // Validate input
      if (!formattedEmail || !password) {
        throw new Error('Please provide both email and password');
      }

      const { token, user: userData } = await mongodbService.login(formattedEmail, password);
      await AsyncStorage.setItem('userToken', token);
      mongodbService.setToken(token);
      setUser(userData);
      return userData;
    } catch (error) {
      // Clear any invalid state
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      mongodbService.setToken(null);
      throw new Error(error.response?.data?.message || error.message || 'Failed to sign in');
    }
  };

  const signUp = async (userData) => {
    try {
      // Restructure the data to match the User model
      const formattedUserData = {
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        profile: {
          name: userData.profile.name.trim(),
          age: parseInt(userData.profile.age),
          gender: userData.profile.gender.toLowerCase(),
          height: parseInt(userData.profile.height),
          weight: parseInt(userData.profile.weight),
          targetWeight: parseInt(userData.profile.targetWeight),
          activityLevel: userData.profile.activityLevel.toLowerCase(),
          goal: userData.profile.goal,
          dietaryRestrictions: userData.profile.dietaryRestrictions || [],
          stats: {
            totalCaloriesBurned: 0,
            totalWorkouts: 0,
            streakDays: 0,
            weightLogs: [],
            lastWorkout: null
          }
        }
      };

      const { token, user: newUser } = await mongodbService.register(formattedUserData);
      
      // Set token first before making any authenticated requests
      await AsyncStorage.setItem('userToken', token);
      mongodbService.setToken(token);
      
      // Now get the full profile with the token set
      const fullProfile = await mongodbService.getProfile();
      setUser(fullProfile);
      
      return fullProfile;
    } catch (error) {
      // Clear any invalid state
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      mongodbService.setToken(null);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signOut = async () => {
    try {
      await mongodbService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local state, even if server logout fails
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      mongodbService.setToken(null);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const updatedUser = await mongodbService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      mongodbService.setToken(token);
      const userData = await mongodbService.getProfile();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, clear the authentication state
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      mongodbService.setToken(null);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 