import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import getEnvVars from '../config/environment';

class MongoDBService {
  constructor() {
    const env = getEnvVars();
    this.BASE_URL = env.apiUrl;

    console.log('Environment details:', {
      platform: Platform.OS,
      baseUrl: this.BASE_URL,
      isDevelopment: __DEV__,
      manifestDebuggerHost: Constants.manifest?.debuggerHost,
      expoConfigHostUri: Constants.expoConfig?.hostUri
    });

    // Configure axios defaults with better error handling
    axios.defaults.baseURL = this.BASE_URL;
    axios.defaults.timeout = 15000; // Increased timeout to 15 seconds
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

        // Don't throw errors for network issues in production
        if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
          console.warn('Network error - continuing without backend connection');
          // Return a mock response to prevent crashes
          return Promise.resolve({
            data: { message: 'Backend unavailable', offline: true },
            status: 503
          });
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
          const token = await AsyncStorage.getItem('userToken');
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
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      // Always lowercase and trim email before sending
      const formattedEmail = email.toLowerCase().trim();
      const response = await this.api.post('/auth/login', {
        email: formattedEmail,
        password: password.trim()
      });
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      const formattedEmail = email.toLowerCase().trim();
      const response = await this.api.post('/auth/forgot-password', {
        email: formattedEmail
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }
      const response = await this.api.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async register(userData) {
    try {
      // Always lowercase and trim email before sending
      userData.email = userData.email.toLowerCase().trim();
      userData.password = userData.password.trim();
      const response = await this.api.post('/auth/register', userData);
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      // Since the backend doesn't actually invalidate tokens, 
      // we just clear the token locally
      this.setToken(null);
      return { message: 'Logged out successfully' };
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
      // Get date 7 days ago
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);
      const from = sevenDaysAgo.toISOString().split('T')[0];
      const to = today.toISOString().split('T')[0];
      const response = await this.api.get(`/meals?from=${from}&to=${to}`);
      // The backend returns grouped meals by date
      return response.data;
    } catch (error) {
      console.error('Error fetching meals:', error);
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
      console.log(logId);
      const response = await this.api.delete(`/weight-logs/${logId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Nutrition Search Operations
  async searchNutrition(query) {
    try {
      const response = await this.api.get(`/nutrition/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMealInfo(mealId) {
    try {
      const response = await this.api.get(`/nutrition/meal/${mealId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAllMeals() {
    try {
      const response = await this.api.get('/nutrition/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSearchSuggestions(query) {
    try {
      const response = await this.api.get(`/nutrition/suggestions?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reminders Operations
  async getReminders() {
    try {
      const response = await this.api.get('/reminders');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createReminder(reminderData) {
    try {
      const response = await this.api.post('/reminders', reminderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateReminder(reminderId, reminderData) {
    try {
      const response = await this.api.put(`/reminders/${reminderId}`, reminderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteReminder(reminderId) {
    try {
      const response = await this.api.delete(`/reminders/${reminderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async toggleReminder(reminderId) {
    try {
      const response = await this.api.patch(`/reminders/${reminderId}/toggle`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.put('/users/password', {
        currentPassword,
        newPassword
      });
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

  async getMealPackageSuggestions(goal = null, tags = [], calories = null) {
    try {
      const params = {};
      if (goal) params.goal = goal;
      if (tags && tags.length) params.tags = tags.join(',');
      if (calories) params.calories = calories;
      console.log('Calling /mealPackages/recommend with params:', params);
      const response = await this.api.get('/mealPackages/recommend', { params });
      console.log('Meal packages response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getMealPackageSuggestions:', error);
      throw error;
    }
  }

  async getPredefinedMeals({ mealType, limit = 5, offset = 0, ingredient = '' } = {}) {
    try {
      const params = { mealType, limit, offset };
      if (ingredient) params.ingredient = ingredient;
      const response = await this.api.get('/meals/predefined', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getExerciseVideos({ tag = '', name = '' } = {}) {
    try {
      const params = {};
      if (tag) params.tag = tag;
      if (name) params.name = name;
      const response = await this.api.get('/exercise-videos', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exercise videos:', error);
      throw error;
    }
  }
}

export default MongoDBService;
export const mongodbService = new MongoDBService(); 