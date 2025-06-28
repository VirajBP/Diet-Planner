import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV = {
  dev: {
    apiUrl: Platform.select({
      ios: 'http://localhost:5000/api',
      android: 'http://10.0.2.2:5000/api', // Default Android emulator localhost
    }),
    enableUpdates: true, // Enable updates in development
    bundlerHost: Platform.select({
      ios: 'localhost',
      android: '10.0.2.2', // Default Android emulator localhost
    }),
  },
  staging: {
    apiUrl: 'https://your-staging-backend.onrender.com/api', // Replace with your staging backend URL
    enableUpdates: true,
  },
  prod: {
    apiUrl: 'https://your-production-backend.onrender.com/api', // Replace with your production backend URL
    enableUpdates: true,
  },
};

const getEnvVars = () => {
  // What is the current environment?
  if (__DEV__) {
    return ENV.dev;
  }
  
  // For production builds, check if we're in staging or prod
  const channel = Constants.expoConfig?.extra?.eas?.releaseChannel;
  if (channel === 'staging') {
    return ENV.staging;
  }
  
  // Default to production environment
  return ENV.prod;
};

export default getEnvVars; 