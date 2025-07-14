// Reminder: For iOS, ensure UIBackgroundModes in app.json includes both 'fetch' and 'location' for background tracking.
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
    this.pollingInterval = null;
  }

  async initialize(onStepUpdateCallback = null) {
    if (this.isInitialized) return;
    this.onStepUpdate = onStepUpdateCallback;
    try {
      // Check BackgroundFetch availability
      const fetchStatus = await BackgroundFetch.getStatusAsync();
      if (fetchStatus !== BackgroundFetch.Status.Available) {
        console.warn('BackgroundFetch is not available:', fetchStatus);
      }
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
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        console.warn('Location permission not granted, background tracking may be limited');
      }
      if (Platform.OS === 'ios') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission not granted');
        }
      }
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
      // Prevent duplicate task definitions
      if (!TaskManager.isTaskDefined || !TaskManager.isTaskDefined(BACKGROUND_STEP_TASK)) {
        TaskManager.defineTask(BACKGROUND_STEP_TASK, async () => {
          try {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 1);
            let steps = 0;
            try {
              const result = await Pedometer.getStepCountAsync(start, end);
              steps = result.steps;
            } catch (err) {
              console.error('Pedometer.getStepCountAsync failed in background:', err);
              // Retry fallback
              try {
                await new Promise(res => setTimeout(res, 2000));
                const result = await Pedometer.getStepCountAsync(start, end);
                steps = result.steps;
              } catch (retryErr) {
                console.error('Retry failed for Pedometer.getStepCountAsync:', retryErr);
                return BackgroundFetch.BackgroundFetchResult.Failed;
              }
            }
            await this.updateStepData(steps);
            return BackgroundFetch.BackgroundFetchResult.NewData;
          } catch (error) {
            console.error('Background task error:', error);
            return BackgroundFetch.BackgroundFetchResult.Failed;
          }
        });
      }
      await BackgroundFetch.registerTaskAsync(BACKGROUND_STEP_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      await BackgroundFetch.setMinimumIntervalAsync(15 * 60); // Enforce periodic execution
      console.log('Background task registered successfully');
    } catch (error) {
      if (error.message && error.message.includes('Task already defined')) {
        // Ignore duplicate definition error
        console.warn('Background task already defined.');
      } else {
        console.error('Failed to register background task:', error);
        throw error;
      }
    }
  }

  async startStepTracking() {
    try {
      // Start watching step count
      this.subscription = Pedometer.watchStepCount(result => {
        this.handleStepUpdate(result.steps);
      });
      // Fallback polling every 30s if watchStepCount is not reliable
      if (!this.pollingInterval) {
        this.pollingInterval = setInterval(async () => {
          try {
            const end = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const { steps } = await Pedometer.getStepCountAsync(start, end);
            this.handleStepUpdate(steps);
          } catch (err) {
            console.error('Fallback polling: Pedometer.getStepCountAsync failed:', err);
          }
        }, 30000);
      }
      console.log('Step tracking started');
    } catch (error) {
      console.error('Failed to start step tracking:', error);
      throw error;
    }
  }

  async handleStepUpdate(newStepCount) {
    try {
      // Persist lastStepCount in AsyncStorage
      const lastStepCountStored = await AsyncStorage.getItem('lastStepCount');
      let lastStepCount = lastStepCountStored ? parseInt(lastStepCountStored) : this.lastStepCount;
      const stepDifference = newStepCount - lastStepCount;
      if (stepDifference > 0) {
        this.currentSteps = newStepCount;
        this.dailySteps += stepDifference;
        this.lastStepCount = newStepCount;
        await AsyncStorage.setItem('lastStepCount', newStepCount.toString());
        await this.saveStepData();
        if (this.onStepUpdate) {
          this.onStepUpdate(this.dailySteps);
        }
      }
    } catch (error) {
      console.error('Error handling step update:', error);
    }
  }

  async loadStepData() {
    try {
      const stepData = await AsyncStorage.getItem(STEP_DATA_KEY);
      const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);
      const lastStepCountStored = await AsyncStorage.getItem('lastStepCount');
      if (stepData) {
        const data = JSON.parse(stepData);
        const today = new Date().toDateString();
        const lastUpdateDate = lastUpdate ? new Date(parseInt(lastUpdate)).toDateString() : null;
        if (lastUpdateDate !== today) {
          this.dailySteps = 0;
          this.currentSteps = 0;
          this.lastStepCount = lastStepCountStored ? parseInt(lastStepCountStored) : 0;
        } else {
          this.dailySteps = data.dailySteps || 0;
          this.currentSteps = data.currentSteps || 0;
          this.lastStepCount = lastStepCountStored ? parseInt(lastStepCountStored) : (data.lastStepCount || 0);
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
      const lastStepCountStored = await AsyncStorage.getItem('lastStepCount');
      let lastStepCount = lastStepCountStored ? parseInt(lastStepCountStored) : this.lastStepCount;
      const stepDifference = newStepCount - lastStepCount;
      if (stepDifference > 0) {
        this.dailySteps += stepDifference;
        this.currentSteps = newStepCount;
        this.lastStepCount = newStepCount;
        await AsyncStorage.setItem('lastStepCount', newStepCount.toString());
        await this.saveStepData();
      }
      // Always save lastUpdate
      await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
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
    await AsyncStorage.setItem('lastStepCount', '0');
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
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
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