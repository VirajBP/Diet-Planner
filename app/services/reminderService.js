import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class ReminderService {
  constructor() {
    this.reminders = [];
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing reminder service:', error);
      return false;
    }
  }

  async scheduleReminder(reminder) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Parse time (format: "HH:MM")
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      // Create notification content
      const notificationContent = {
        title: reminder.title,
        body: reminder.message || `Time for your ${reminder.type} reminder!`,
        data: { reminderId: reminder._id, type: reminder.type },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };

      // Schedule for each selected day
      const scheduledNotifications = [];
      
      for (const day of reminder.days) {
        const dayIndex = this.getDayIndex(day);
        if (dayIndex !== -1) {
          const trigger = {
            hour: hours,
            minute: minutes,
            weekday: dayIndex + 1, // 1 = Sunday, 2 = Monday, etc.
            repeats: true,
          };

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: notificationContent,
            trigger,
          });

          scheduledNotifications.push({
            notificationId,
            day,
            time: reminder.time,
          });
        }
      }

      // Store reminder mapping
      await this.storeReminderMapping(reminder._id, scheduledNotifications);
      
      return scheduledNotifications;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  async cancelReminder(reminderId) {
    try {
      const mapping = await this.getReminderMapping(reminderId);
      if (mapping) {
        for (const notification of mapping.notifications) {
          await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
        }
        await this.removeReminderMapping(reminderId);
      }
    } catch (error) {
      console.error('Error canceling reminder:', error);
      throw error;
    }
  }

  async updateReminder(reminder) {
    try {
      // Cancel existing notifications
      await this.cancelReminder(reminder._id);
      
      // Schedule new notifications
      return await this.scheduleReminder(reminder);
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  async cancelAllReminders() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('reminderMappings');
    } catch (error) {
      console.error('Error canceling all reminders:', error);
      throw error;
    }
  }

  // Helper methods
  getDayIndex(day) {
    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
    };
    return dayMap[day.toLowerCase()] || -1;
  }

  async storeReminderMapping(reminderId, notifications) {
    try {
      const mappings = await this.getReminderMappings();
      mappings[reminderId] = { notifications };
      await AsyncStorage.setItem('reminderMappings', JSON.stringify(mappings));
    } catch (error) {
      console.error('Error storing reminder mapping:', error);
    }
  }

  async getReminderMapping(reminderId) {
    try {
      const mappings = await this.getReminderMappings();
      return mappings[reminderId];
    } catch (error) {
      console.error('Error getting reminder mapping:', error);
      return null;
    }
  }

  async getReminderMappings() {
    try {
      const mappings = await AsyncStorage.getItem('reminderMappings');
      return mappings ? JSON.parse(mappings) : {};
    } catch (error) {
      console.error('Error getting reminder mappings:', error);
      return {};
    }
  }

  async removeReminderMapping(reminderId) {
    try {
      const mappings = await this.getReminderMappings();
      delete mappings[reminderId];
      await AsyncStorage.setItem('reminderMappings', JSON.stringify(mappings));
    } catch (error) {
      console.error('Error removing reminder mapping:', error);
    }
  }

  // Test notification
  async sendTestNotification() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Reminder',
          body: 'This is a test notification from your diet planner!',
          sound: true,
        },
        trigger: { seconds: 5 },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
}

export default new ReminderService(); 