// services/notifications.js - Working Notification Service
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_STORAGE_KEY = 'mindforge_notifications';

// Notification behavior configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationToken = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      console.log('🔔 Initializing notification service...');
      
      if (!Device.isDevice) {
        console.log('⚠️ Notifications only work on physical devices');
        return false;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('❌ Notification permissions denied');
        return false;
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notification Permission',
          'Enable notifications in Settings to receive habit reminders.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habit-reminders', {
          name: 'Habit Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
          sound: true,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  // Set up notification event listeners
  setupNotificationListeners() {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
    });

    // Handle notification tapped by user
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      const data = response.notification.request.content.data;
      
      if (data.habitId) {
        console.log('Navigate to habit:', data.habitId);
      }
    });
  }

  // SIMPLIFIED: Schedule notification with daily repetition
  async scheduleHabitReminder(habit) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Notification service not initialized');
        return null;
      }

      if (!habit.reminderTime) {
        console.log('⚠️ No reminder time set for habit:', habit.name);
        return null;
      }

      // Parse reminder time (format: "HH:MM")
      const [hours, minutes] = habit.reminderTime.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.log('⚠️ Invalid reminder time format:', habit.reminderTime);
        return null;
      }

      // Cancel existing notification for this habit first
      await this.cancelHabitReminder(habit._id);

      // Schedule daily notification using the simplest working approach
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Habit Reminder',
          body: `Time for: ${habit.name}`,
          data: {
            habitId: habit._id,
            habitName: habit.name,
            type: 'habit_reminder'
          },
          sound: true,
          priority: Notifications.AndroidImportance.HIGH,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      // Store notification mapping
      await this.storeNotificationMapping(habit._id, notificationId);

      console.log(`✅ Scheduled daily reminder for "${habit.name}" at ${habit.reminderTime}`);
      console.log(`📋 Notification ID: ${notificationId}`);
      
      return notificationId;

    } catch (error) {
      console.error('❌ Error scheduling habit reminder:', error);
      return null;
    }
  }

  // Cancel a habit reminder
  async cancelHabitReminder(habitId) {
    try {
      const notificationId = await this.getNotificationId(habitId);
      
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeNotificationMapping(habitId);
        console.log(`✅ Cancelled reminder for habit: ${habitId}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error cancelling habit reminder:', error);
      return false;
    }
  }

  // Update habit reminder
  async updateHabitReminder(habit) {
    try {
      await this.cancelHabitReminder(habit._id);
      
      if (habit.reminderTime) {
        return await this.scheduleHabitReminder(habit);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error updating habit reminder:', error);
      return null;
    }
  }

  // Schedule reminders for multiple habits
  async scheduleAllHabitReminders(habits) {
    try {
      console.log('🔄 Starting to schedule habit reminders...');
      
      const results = [];
      const habitsWithReminders = habits.filter(h => h.reminderTime && h.isActive && !h.isArchived);
      
      console.log(`📋 Found ${habitsWithReminders.length} habits with reminders to schedule`);
      
      for (const habit of habitsWithReminders) {
        console.log(`⏰ Scheduling: ${habit.name} at ${habit.reminderTime}`);
        const notificationId = await this.scheduleHabitReminder(habit);
        if (notificationId) {
          results.push({ habitId: habit._id, notificationId });
        }
        
        // Small delay between scheduling
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`✅ Successfully scheduled ${results.length} habit reminders`);
      
      // Verify what's actually scheduled
      const scheduled = await this.getScheduledNotifications();
      console.log(`📊 Total scheduled notifications: ${scheduled.length}`);
      
      return results;
    } catch (error) {
      console.error('❌ Error scheduling all habit reminders:', error);
      return [];
    }
  }

  // Cancel all habit reminders
  async cancelAllHabitReminders() {
    try {
      console.log('🧹 Cancelling all habit reminders...');
      
      // Get all stored mappings
      const mappings = await this.getNotificationMappings();
      
      // Cancel each one individually
      for (const [habitId, notificationId] of Object.entries(mappings)) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
          console.log(`✅ Cancelled notification ${notificationId} for habit ${habitId}`);
        } catch (error) {
          console.log(`⚠️ Could not cancel notification ${notificationId}:`, error.message);
        }
      }
      
      // Clear storage
      await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      
      console.log('✅ Cancelled all habit reminders');
      return true;
    } catch (error) {
      console.error('❌ Error cancelling all reminders:', error);
      return false;
    }
  }

  // Send immediate notification (for testing or completion celebrations)
  async sendImmediateNotification(title, body, data = {}) {
    try {
      if (!this.isInitialized) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });

      console.log('✅ Sent immediate notification:', title);
      return notificationId;
    } catch (error) {
      console.error('❌ Error sending immediate notification:', error);
      return null;
    }
  }

  // Test notification with specific time (for debugging)
  async sendTestScheduledNotification(minutesFromNow = 1) {
    try {
      if (!this.isInitialized) return null;

      const testTime = new Date();
      testTime.setMinutes(testTime.getMinutes() + minutesFromNow);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Scheduled Notification',
          body: `This test notification was scheduled for ${testTime.toLocaleTimeString()}`,
          data: { type: 'test_scheduled' },
          sound: true,
        },
        trigger: {
          seconds: minutesFromNow * 60,
        },
      });

      console.log(`✅ Scheduled test notification for ${minutesFromNow} minute(s) from now`);
      console.log(`📋 Test notification ID: ${notificationId}`);
      
      return {
        notificationId,
        scheduledTime: testTime.toLocaleTimeString(),
        scheduledFor: `${minutesFromNow} minute(s) from now`
      };
    } catch (error) {
      console.error('❌ Error sending test scheduled notification:', error);
      return null;
    }
  }

  // Celebrate habit completion
  async celebrateHabitCompletion(habit) {
    const celebrationMessages = [
      `🎉 Great job completing "${habit.name}"!`,
      `✨ You're building amazing habits! "${habit.name}" done!`,
      `🌟 Consistency pays off! "${habit.name}" completed!`,
      `💪 Keep it up! Another "${habit.name}" in the books!`,
      `🏆 Habit champion! "${habit.name}" completed!`,
    ];

    const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
    
    return await this.sendImmediateNotification(
      'Habit Completed! 🎯',
      message,
      {
        type: 'habit_completion',
        habitId: habit._id,
        habitName: habit.name
      }
    );
  }

  // Streak milestone notification
  async notifyStreakMilestone(habit, streak) {
    const milestones = {
      7: '🔥 One week streak! You\'re on fire!',
      14: '💎 Two weeks strong! Keep going!',
      30: '🏆 One month streak! Incredible dedication!',
      50: '⭐ 50-day streak! You\'re a habit master!',
      100: '💯 100-day streak! Legendary achievement!',
    };

    if (milestones[streak]) {
      return await this.sendImmediateNotification(
        `${streak}-Day Streak! 🎉`,
        `"${habit.name}": ${milestones[streak]}`,
        {
          type: 'streak_milestone',
          habitId: habit._id,
          streak: streak
        }
      );
    }
  }

  // Store notification ID mapping
  async storeNotificationMapping(habitId, notificationId) {
    try {
      const mappings = await this.getNotificationMappings();
      mappings[habitId] = notificationId;
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(mappings));
    } catch (error) {
      console.error('❌ Error storing notification mapping:', error);
    }
  }

  // Remove notification mapping
  async removeNotificationMapping(habitId) {
    try {
      const mappings = await this.getNotificationMappings();
      delete mappings[habitId];
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(mappings));
    } catch (error) {
      console.error('❌ Error removing notification mapping:', error);
    }
  }

  // Get notification mappings
  async getNotificationMappings() {
    try {
      const mappings = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      return mappings ? JSON.parse(mappings) : {};
    } catch (error) {
      console.error('❌ Error getting notification mappings:', error);
      return {};
    }
  }

  // Get notification ID for habit
  async getNotificationId(habitId) {
    const mappings = await this.getNotificationMappings();
    return mappings[habitId] || null;
  }

  // Get scheduled notifications with detailed logging
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      
      console.log(`📅 Scheduled notifications: ${notifications.length}`);
      
      // Log details for debugging
      notifications.forEach((notif, index) => {
        console.log(`📅 ${index + 1}. "${notif.content.title}" - Trigger:`, notif.trigger);
      });
      
      return notifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Check notification settings
  async getNotificationSettings() {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      const scheduledNotifications = await this.getScheduledNotifications();
      
      return {
        permissions: permissions.status,
        canAskAgain: permissions.canAskAgain,
        scheduledCount: scheduledNotifications.length,
        token: this.notificationToken,
        initialized: this.isInitialized,
      };
    } catch (error) {
      console.error('❌ Error getting notification settings:', error);
      return null;
    }
  }

  // Debug function to check what's scheduled
  async debugScheduledNotifications() {
    console.log('🔍 DEBUG: Checking scheduled notifications...');
    const notifications = await this.getScheduledNotifications();
    
    notifications.forEach((notif, index) => {
      console.log(`🔍 DEBUG ${index + 1}:`, {
        id: notif.identifier,
        title: notif.content.title,
        body: notif.content.body,
        trigger: notif.trigger,
        data: notif.content.data
      });
    });
    
    return notifications;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export utility functions
export const initializeNotifications = () => notificationService.initialize();
export const scheduleHabitReminder = (habit) => notificationService.scheduleHabitReminder(habit);
export const cancelHabitReminder = (habitId) => notificationService.cancelHabitReminder(habitId);
export const updateHabitReminder = (habit) => notificationService.updateHabitReminder(habit);
export const celebrateCompletion = (habit) => notificationService.celebrateHabitCompletion(habit);
export const notifyStreak = (habit, streak) => notificationService.notifyStreakMilestone(habit, streak);

export default notificationService;

// Hook for using notifications in components
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [isReady, setIsReady] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const init = async () => {
      const success = await notificationService.initialize();
      setIsReady(success);
      
      if (success) {
        const notificationSettings = await notificationService.getNotificationSettings();
        setSettings(notificationSettings);
      }
    };

    init();
  }, []);

  const refreshSettings = async () => {
    const notificationSettings = await notificationService.getNotificationSettings();
    setSettings(notificationSettings);
  };

  return {
    isReady,
    settings,
    refreshSettings,
    service: notificationService,
  };
};