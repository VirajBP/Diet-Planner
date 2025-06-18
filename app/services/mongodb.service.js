import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import getEnvVars from '../config/environment';

class MongoDBService {
  constructor() {
    const env = getEnvVars();
    
    // Get the API URL from environment config
    this.BASE_URL = env.apiUrl;
    
    if (__DEV__) {
      // For physical Android devices in development
      if (Platform.OS === 'android' && !Platform.isTV) {
        // Get the local IP address for Android physical devices
        let debuggerHost = Constants.manifest?.debuggerHost || Constants.expoConfig?.hostUri;
        console.log('Debug host information:', { 
          manifestDebuggerHost: Constants.manifest?.debuggerHost,
          expoConfigHostUri: Constants.expoConfig?.hostUri,
          debuggerHost
        });
        
        if (debuggerHost) {
          debuggerHost = debuggerHost.split(':').shift();
          this.BASE_URL = `http://${debuggerHost}:5000/api`;
          console.log('Development BASE_URL set to:', this.BASE_URL);
        } else {
          console.warn('Could not determine debug host. Please ensure Metro bundler is running.');
          // Fallback to localhost - though this likely won't work on physical devices
          this.BASE_URL = 'http://localhost:5000/api';
        }
      }
    }

    console.log('Environment details:', {
      platform: Platform.OS,
      baseUrl: this.BASE_URL,
      isDevelopment: __DEV__,
      manifestDebuggerHost: Constants.manifest?.debuggerHost,
      expoConfigHostUri: Constants.expoConfig?.hostUri
    });

    // Configure axios defaults
    axios.defaults.baseURL = this.BASE_URL;
    axios.defaults.timeout = 30000; // Increased timeout to 30 seconds
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    // Add response interceptor for better error handling
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        });

        // Customize error message based on the error
        if (error.message === 'Network Error') {
          error.message = `Cannot connect to server at ${this.BASE_URL}. Please check if:\n` +
                         '1. The server is running\n' +
                         '2. You are using the correct IP address (192.168.0.100)\n' +
                         '3. Your device is connected to the same network as the server\n' +
                         '4. The port 5000 is not blocked by firewall';
        } else if (error.code === 'ECONNABORTED') {
          error.message = 'Request timed out. Please check your network connection and try again.';
        }
        return Promise.reject(error);
      }
    );

    this.api = axios.create({
      baseURL: this.BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error
          const errorMessage = error.response.data.message || 'Server error';
          if (error.response.status === 403 && errorMessage.includes('premium')) {
            console.log('Premium feature access denied');
          }
          return Promise.reject(new Error(errorMessage));
        } else if (error.request) {
          // Request made but no response
          console.error('No response from server:', error.request);
          return Promise.reject(new Error('No response from server. Please check your connection.'));
        } else {
          // Error in request setup
          console.error('Request setup error:', error.message);
          return Promise.reject(new Error(error.message || 'Request failed'));
        }
      }
    );
  }

  // Token management
  setToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Auth Operations
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { 
        email: email.toLowerCase().trim(),
        password 
      });
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
      this.setToken(null);
    } catch (error) {
      this.setToken(null);
      throw error;
    }
  }

  // Profile Operations
  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      // Ensure all required fields are present
      const requiredFields = ['name', 'age', 'gender', 'height', 'weight', 'targetWeight', 'activityLevel'];
      const missingFields = requiredFields.filter(field => !profileData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate numeric fields
      const numericFields = ['age', 'height', 'weight', 'targetWeight'];
      numericFields.forEach(field => {
        profileData[field] = Number(profileData[field]);
        if (isNaN(profileData[field])) {
          throw new Error(`${field} must be a valid number`);
        }
      });

      const response = await this.api.put('/auth/profile', { profile: profileData });
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Meal Operations
  async getMeals() {
    try {
      const response = await this.api.get('/meals');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createMeal(mealData) {
    try {
      const response = await this.api.post('/meals', mealData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateMeal(mealId, mealData) {
    try {
      const response = await this.api.put(`/meals/${mealId}`, mealData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteMeal(mealId) {
    try {
      const response = await this.api.delete(`/meals/${mealId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMealSuggestions(customIngredients = null, currentWeight = null, targetWeight = null) {
    try {
      const response = await this.api.get('/meals/suggestions', {
        params: {
          customIngredients,
          currentWeight,
          targetWeight
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Water Log Operations
  async getWaterLogs() {
    try {
      const response = await this.api.get('/water-logs');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addWaterLog(logData) {
    try {
      const response = await this.api.post('/water-logs', logData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteWaterLog(logId) {
    try {
      const response = await this.api.delete(`/water-logs/${logId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Weight Log Operations
  async getWeightLogs() {
    try {
      const response = await this.api.get('/weight-logs');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addWeightLog(logData) {
    try {
      const response = await this.api.post('/weight-logs', logData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteWeightLog(logId) {
    try {
      const response = await this.api.delete(`/weight-logs/${logId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Static utility methods
  static calculateDailyCalories(profile) {
    if (!profile || !profile.weight || !profile.height || !profile.age || !profile.gender || !profile.activityLevel) {
      console.warn('Incomplete profile data for calorie calculation:', profile);
      return 2000; // Default value if profile is incomplete
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (profile.gender.toLowerCase() === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    // Apply activity level multiplier
    const activityMultipliers = {
      sedentary: 1.2,      // Little or no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      active: 1.725,       // Heavy exercise 6-7 days/week
      very_active: 1.9     // Very heavy exercise, physical job or training twice per day
    };

    const multiplier = activityMultipliers[profile.activityLevel.toLowerCase()] || 1.375;
    const totalCalories = Math.round(bmr * multiplier);

    // Adjust based on goal if available
    if (profile.goal) {
      switch (profile.goal.toLowerCase()) {
        case 'lose':
          return Math.round(totalCalories * 0.85); // 15% deficit
        case 'gain':
          return Math.round(totalCalories * 1.15); // 15% surplus
        default:
          return totalCalories;
      }
    }

    return totalCalories;
  }
}

export default MongoDBService;
export const mongodbService = new MongoDBService(); 