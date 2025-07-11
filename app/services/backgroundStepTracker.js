import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

const BACKGROUND_STEP_TASK = 'background-step-tracking';
const STEP_DATA_KEY = 'step_tracker_data';
const LAST_UPDATE_KEY = 'step_tracker_last_update';

class BackgroundStepTracker {
  constructor() {
    this.isInitialized = false;
    this.currentSteps = 0;
    this.dailySteps = 0;
    this.lastStepCount = 0;
    this.subscription = null;
    this.onStepUpdate = null;
  }

  async initialize(onStepUpdateCallback = null) {
    if (this.isInitialized) return;
    
    this.onStepUpdate = onStepUpdateCallback;
    
    try {
      // Load saved data
      await this.loadStepData();
      
      // Register background task
      await this.registerBackgroundTask();
      
      // Request permissions
      await this.requestPermissions();
      
      // Start step tracking
      await this.startStepTracking();
      
      this.isInitialized = true;
      console.log('Background step tracker initialized');
    } catch (error) {
      console.error('Failed to initialize background step tracker:', error);
      throw error;
    }
  }

  async requestPermissions() {
    try {
      // Request location permission (required for background step tracking on iOS)
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        console.warn('Location permission not granted, background tracking may be limited');
      }

      // Request background location permission for iOS
      if (Platform.OS === 'ios') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission not granted');
        }
      }

      // Check pedometer availability
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer is not available on this device');
      }

      return isAvailable;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async registerBackgroundTask() {
    try {
      // Define the background task
      TaskManager.defineTask(BACKGROUND_STEP_TASK, async () => {
        try {
          // Get current step count
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 1); // Last 24 hours
          
          const { steps } = await Pedometer.getStepCountAsync(start, end);
          
          // Update stored data
          await this.updateStepData(steps);
          
          // Return success
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('Background task error:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      // Register the task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_STEP_TASK, {
        minimumInterval: 60 * 15, // 15 minutes minimum
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Background task registered successfully');
    } catch (error) {
      console.error('Failed to register background task:', error);
      throw error;
    }
  }

  async startStepTracking() {
    try {
      // Start watching step count
      this.subscription = Pedometer.watchStepCount(result => {
        this.handleStepUpdate(result.steps);
      });

      console.log('Step tracking started');
    } catch (error) {
      console.error('Failed to start step tracking:', error);
      throw error;
    }
  }

  async handleStepUpdate(newStepCount) {
    try {
      // Calculate steps since last update
      const stepDifference = newStepCount - this.lastStepCount;
      
      if (stepDifference > 0) {
        this.currentSteps = newStepCount;
        this.dailySteps += stepDifference;
        
        // Save to storage
        await this.saveStepData();
        
        // Notify callback
        if (this.onStepUpdate) {
          this.onStepUpdate(this.dailySteps);
        }
      }
      
      this.lastStepCount = newStepCount;
    } catch (error) {
      console.error('Error handling step update:', error);
    }
  }

  async loadStepData() {
    try {
      const stepData = await AsyncStorage.getItem(STEP_DATA_KEY);
      const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);
      
      if (stepData) {
        const data = JSON.parse(stepData);
        const today = new Date().toDateString();
        const lastUpdateDate = lastUpdate ? new Date(parseInt(lastUpdate)).toDateString() : null;
        
        // Reset daily steps if it's a new day
        if (lastUpdateDate !== today) {
          this.dailySteps = 0;
          this.currentSteps = 0;
          this.lastStepCount = 0;
        } else {
          this.dailySteps = data.dailySteps || 0;
          this.currentSteps = data.currentSteps || 0;
          this.lastStepCount = data.lastStepCount || 0;
        }
      }
    } catch (error) {
      console.error('Error loading step data:', error);
    }
  }

  async saveStepData() {
    try {
      const data = {
        dailySteps: this.dailySteps,
        currentSteps: this.currentSteps,
        lastStepCount: this.lastStepCount,
        lastUpdate: Date.now(),
      };
      
      await AsyncStorage.setItem(STEP_DATA_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving step data:', error);
    }
  }

  async updateStepData(newStepCount) {
    try {
      const stepDifference = newStepCount - this.lastStepCount;
      if (stepDifference > 0) {
        this.dailySteps += stepDifference;
        this.currentSteps = newStepCount;
        this.lastStepCount = newStepCount;
        await this.saveStepData();
      }
    } catch (error) {
      console.error('Error updating step data:', error);
    }
  }

  async getCurrentSteps() {
    return this.dailySteps;
  }

  async resetSteps() {
    this.dailySteps = 0;
    this.currentSteps = 0;
    this.lastStepCount = 0;
    await this.saveStepData();
    
    if (this.onStepUpdate) {
      this.onStepUpdate(0);
    }
  }

  async stopTracking() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_STEP_TASK);
    } catch (error) {
      console.error('Error unregistering background task:', error);
    }
    
    this.isInitialized = false;
  }

  async getStepHistory() {
    try {
      const stepData = await AsyncStorage.getItem(STEP_DATA_KEY);
      return stepData ? JSON.parse(stepData) : null;
    } catch (error) {
      console.error('Error getting step history:', error);
      return null;
    }
  }
}

// Create singleton instance
const backgroundStepTracker = new BackgroundStepTracker();

export default backgroundStepTracker; 