// services/notifications.js - Fixed with Working Trigger Formats
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
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationToken = null;
    this.notificationListeners = [];
    this.scheduledNotificationIds = new Set(); // Track our scheduled notifications
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

      // Clean up any existing listeners first
      this.cleanupListeners();

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

  // Clean up existing listeners to prevent duplicates
  cleanupListeners() {
    if (this.notificationListeners.length > 0) {
      console.log('🧹 Cleaning up existing notification listeners');
      this.notificationListeners.forEach(listener => {
        listener.remove();
      });
      this.notificationListeners = [];
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

      console.log('🔐 Notification permission status:', finalStatus);

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
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Habit Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
          sound: true,
          enableVibrate: true,
        });
        console.log('✅ Android notification channel configured');
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
    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification.request.content.title);
    });

    // Handle notification tapped by user
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response.notification.request.content.title);
      const data = response.notification.request.content.data;
      
      if (data.habitId) {
        console.log('Navigate to habit:', data.habitId);
        // TODO: Add navigation logic here
      }
    });

    // Store listeners for cleanup
    this.notificationListeners = [receivedListener, responseListener];
  }

  // FIXED: Calculate next daily occurrence for a given time
  calculateNextDailyTime(hours, minutes) {
    const now = new Date();
    const nextOccurrence = new Date();
    
    nextOccurrence.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (nextOccurrence <= now) {
      nextOccurrence.setDate(nextOccurrence.getDate() + 1);
    }
    
    return nextOccurrence;
  }

  // FIXED: Schedule habit reminder using WORKING trigger format
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

      // Calculate next occurrence
      const nextTime = this.calculateNextDailyTime(hours, minutes);
      const secondsUntil = Math.floor((nextTime - new Date()) / 1000);

      console.log(`📅 Scheduling habit reminder for "${habit.name}"`);
      console.log(`🕐 Target time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      console.log(`📅 Next occurrence: ${nextTime.toLocaleString()}`);
      console.log(`⏱️ Seconds until: ${secondsUntil}`);

      // Use the WORKING trigger format: { type: 'timeInterval', seconds: X }
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Habit Reminder',
          body: `Time for: ${habit.name}`,
          data: {
            habitId: habit._id,
            habitName: habit.name,
            type: 'habit_reminder',
            scheduledTime: habit.reminderTime,
            scheduledFor: nextTime.toISOString(),
          },
          sound: true,
          priority: Notifications.AndroidImportance.HIGH,
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.max(60, secondsUntil), // At least 60 seconds from now
        },
      });

      // Track this notification ID
      this.scheduledNotificationIds.add(notificationId);

      // Store notification mapping
      await this.storeNotificationMapping(habit._id, notificationId, {
        scheduledTime: habit.reminderTime,
        nextOccurrence: nextTime.toISOString(),
        habitName: habit.name
      });

      console.log(`✅ Scheduled habit reminder for "${habit.name}"`);
      console.log(`📋 Notification ID: ${notificationId}`);
      
      // Verify the notification was actually scheduled
      const verification = await this.verifyNotificationScheduled(notificationId);
      if (verification.found) {
        console.log(`✅ Verification: Notification is properly scheduled`);
        
        // Schedule the next day's notification after this one fires
        this.scheduleNextDayReminder(habit, nextTime);
        
      } else {
        console.log(`⚠️ Verification failed: Notification may not be scheduled properly`);
        this.scheduledNotificationIds.delete(notificationId);
      }
      
      return notificationId;

    } catch (error) {
      console.error('❌ Error scheduling habit reminder:', error);
      return null;
    }
  }

  // Schedule the next day's reminder (to simulate daily repetition)
  async scheduleNextDayReminder(habit, currentTime) {
    try {
      const nextDay = new Date(currentTime);
      nextDay.setDate(nextDay.getDate() + 1);
      const secondsUntil = Math.floor((nextDay - new Date()) / 1000);

      console.log(`📅 Pre-scheduling next day for "${habit.name}" at ${nextDay.toLocaleString()}`);

      const nextDayId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Habit Reminder',
          body: `Time for: ${habit.name}`,
          data: {
            habitId: habit._id,
            habitName: habit.name,
            type: 'habit_reminder',
            scheduledTime: habit.reminderTime,
            scheduledFor: nextDay.toISOString(),
            isNextDay: true,
          },
          sound: true,
          priority: Notifications.AndroidImportance.HIGH,
        },
        trigger: {
          type: 'timeInterval',
          seconds: secondsUntil,
        },
      });

      this.scheduledNotificationIds.add(nextDayId);
      console.log(`✅ Pre-scheduled next day reminder: ${nextDayId}`);

      return nextDayId;
    } catch (error) {
      console.error('❌ Error scheduling next day reminder:', error);
      return null;
    }
  }

  // ADDED: Verify notification was actually scheduled
  async verifyNotificationScheduled(notificationId) {
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      const found = allScheduled.find(n => n.identifier === notificationId);
      
      return {
        found: !!found,
        notification: found,
        totalScheduled: allScheduled.length
      };
    } catch (error) {
      console.error('❌ Error verifying notification:', error);
      return { found: false, totalScheduled: 0 };
    }
  }

  // Cancel a habit reminder
  async cancelHabitReminder(habitId) {
    try {
      const notificationId = await this.getNotificationId(habitId);
      
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeNotificationMapping(habitId);
        this.scheduledNotificationIds.delete(notificationId);
        console.log(`✅ Cancelled reminder for habit: ${habitId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error cancelling habit reminder:', error);
      return false;
    }
  }

  // Update habit reminder
  async updateHabitReminder(habit) {
    try {
      console.log(`🔄 Updating reminder for habit: ${habit.name}`);
      await this.cancelHabitReminder(habit._id);
      
      if (habit.reminderTime && habit.isActive && !habit.isArchived) {
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
      const habitsWithReminders = habits.filter(h => 
        h.reminderTime && 
        h.isActive && 
        !h.isArchived &&
        h.reminderTime.trim() !== ''
      );
      
      console.log(`📋 Found ${habitsWithReminders.length} habits with valid reminders`);
      
      if (habitsWithReminders.length === 0) {
        console.log('📋 No habits to schedule');
        return [];
      }
      
      for (const habit of habitsWithReminders) {
        console.log(`⏰ Scheduling: ${habit.name} at ${habit.reminderTime}`);
        
        const notificationId = await this.scheduleHabitReminder(habit);
        if (notificationId) {
          results.push({ 
            habitId: habit._id, 
            habitName: habit.name,
            notificationId,
            scheduledTime: habit.reminderTime
          });
          console.log(`✅ Successfully scheduled: ${habit.name}`);
        } else {
          console.log(`❌ Failed to schedule: ${habit.name}`);
        }
        
        // Small delay between scheduling
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`✅ Scheduling complete: ${results.length}/${habitsWithReminders.length} successful`);
      
      // Final verification
      const finalVerification = await this.getScheduledNotifications();
      console.log(`📊 Final verification: ${finalVerification.length} total scheduled notifications`);
      
      return results;
    } catch (error) {
      console.error('❌ Error scheduling all habit reminders:', error);
      return [];
    }
  }

  // Cancel all habit reminders with complete cleanup
  async cancelAllHabitReminders() {
    try {
      console.log('🧹 Cancelling all habit reminders...');
      
      // Method 1: Cancel stored mappings
      const mappings = await this.getNotificationMappings();
      let cancelledFromMappings = 0;
      
      for (const [habitId, data] of Object.entries(mappings)) {
        try {
          const notificationId = typeof data === 'string' ? data : data.notificationId;
          await Notifications.cancelScheduledNotificationAsync(notificationId);
          this.scheduledNotificationIds.delete(notificationId);
          cancelledFromMappings++;
          console.log(`✅ Cancelled stored notification for habit: ${habitId}`);
        } catch (error) {
          console.log(`⚠️ Could not cancel stored notification:`, error.message);
        }
      }
      
      // Method 2: Cancel all habit-related notifications by content
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      let cancelledByContent = 0;
      
      for (const notification of allScheduled) {
        if (notification.content.data?.type === 'habit_reminder' || 
            notification.content.title?.includes('Habit Reminder')) {
          try {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            this.scheduledNotificationIds.delete(notification.identifier);
            cancelledByContent++;
            console.log(`✅ Cancelled habit notification: ${notification.identifier}`);
          } catch (error) {
            console.log(`⚠️ Could not cancel notification ${notification.identifier}:`, error.message);
          }
        }
      }
      
      // Clear storage and tracking
      await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      this.scheduledNotificationIds.clear();
      
      const totalCancelled = cancelledFromMappings + cancelledByContent;
      console.log(`✅ Cleanup complete: ${totalCancelled} notifications cancelled`);
      
      // Final verification
      const remaining = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📊 Remaining notifications: ${remaining.length}`);
      
      return {
        success: true,
        cancelledFromMappings,
        cancelledByContent,
        totalCancelled,
        remainingCount: remaining.length
      };
      
    } catch (error) {
      console.error('❌ Error cancelling all reminders:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send immediate notification (for testing)
  async sendImmediateNotification(title, body, data = {}) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Service not initialized, cannot send notification');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            ...data,
            timestamp: new Date().toISOString(),
            type: 'immediate'
          },
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

  // FIXED: Test scheduled notification using WORKING trigger format
  async sendTestScheduledNotification(minutesFromNow = 2) {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ Service not initialized');
        return null;
      }

      if (minutesFromNow < 1) {
        console.log('⚠️ Cannot schedule notification for less than 1 minute');
        return null;
      }

      const testTime = new Date();
      testTime.setMinutes(testTime.getMinutes() + minutesFromNow);
      const secondsUntil = minutesFromNow * 60;

      console.log(`📅 Scheduling test notification for ${testTime.toLocaleString()}`);
      console.log(`⏱️ Seconds until fire: ${secondsUntil}`);

      // Use WORKING trigger format
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Scheduled Notification',
          body: `This test was scheduled for ${testTime.toLocaleTimeString()}. If you see this at the right time, scheduling works perfectly!`,
          data: { 
            type: 'test_scheduled',
            scheduledFor: testTime.toISOString(),
            testId: Date.now()
          },
          sound: true,
        },
        trigger: {
          type: 'timeInterval',
          seconds: secondsUntil,
        },
      });

      console.log(`✅ Scheduled test notification for ${minutesFromNow} minute(s) from now`);
      console.log(`📋 Test notification ID: ${notificationId}`);
      
      // Verify it was scheduled
      const verification = await this.verifyNotificationScheduled(notificationId);
      console.log(`📊 Test notification verification:`, verification);
      
      return {
        notificationId,
        scheduledTime: testTime.toLocaleTimeString(),
        scheduledFor: `${minutesFromNow} minute(s) from now`,
        verified: verification.found,
        willFireAt: testTime.toISOString()
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

  // Store notification ID mapping with metadata
  async storeNotificationMapping(habitId, notificationId, metadata = {}) {
    try {
      const mappings = await this.getNotificationMappings();
      mappings[habitId] = {
        notificationId,
        ...metadata,
        storedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(mappings));
      console.log(`💾 Stored notification mapping: ${habitId} -> ${notificationId}`);
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
      console.log(`🗑️ Removed notification mapping for habit: ${habitId}`);
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
    const mapping = mappings[habitId];
    
    // Handle both old string format and new object format
    if (typeof mapping === 'string') {
      return mapping;
    } else if (mapping && mapping.notificationId) {
      return mapping.notificationId;
    }
    
    return null;
  }

  // Get scheduled notifications with detailed analysis
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      
      console.log(`📅 Currently scheduled notifications: ${notifications.length}`);
      
      // Categorize and log details
      let habitNotifications = 0;
      let testNotifications = 0;
      let otherNotifications = 0;
      
      notifications.forEach((notif, index) => {
        const trigger = notif.trigger;
        const data = notif.content.data || {};
        
        console.log(`📅 ${index + 1}. "${notif.content.title}"`);
        console.log(`     📋 ID: ${notif.identifier}`);
        console.log(`     ⏰ Trigger:`, trigger);
        console.log(`     📊 Data:`, data);
        
        if (trigger.type === 'timeInterval' && trigger.seconds) {
          const fireTime = new Date(Date.now() + (trigger.seconds * 1000));
          console.log(`     ⏱️ Will fire at: ${fireTime.toLocaleString()}`);
        } else if (trigger.type === 'date' && trigger.value) {
          const fireTime = new Date(trigger.value);
          console.log(`     📅 Will fire at: ${fireTime.toLocaleString()}`);
        }
        
        // Categorize
        if (data.type === 'habit_reminder') habitNotifications++;
        else if (data.type?.includes('test')) testNotifications++;
        else otherNotifications++;
      });
      
      console.log(`📊 Summary: ${habitNotifications} habit reminders, ${testNotifications} test notifications, ${otherNotifications} other`);
      
      return notifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Check notification settings and system status
  async getNotificationSettings() {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      const scheduledNotifications = await this.getScheduledNotifications();
      const mappings = await this.getNotificationMappings();
      
      return {
        permissions: permissions.status,
        canAskAgain: permissions.canAskAgain,
        scheduledCount: scheduledNotifications.length,
        habitNotificationCount: scheduledNotifications.filter(n => 
          n.content.data?.type === 'habit_reminder'
        ).length,
        storedMappings: Object.keys(mappings).length,
        trackedNotifications: this.scheduledNotificationIds.size,
        initialized: this.isInitialized,
        platform: Platform.OS,
        isDevice: Device.isDevice,
      };
    } catch (error) {
      console.error('❌ Error getting notification settings:', error);
      return null;
    }
  }

  // Complete system diagnostic
  async debugNotificationSystem() {
    console.log('🔍 DEBUG: Running complete notification system diagnostic...');
    
    try {
      const permissions = await Notifications.getPermissionsAsync();
      const scheduled = await this.getScheduledNotifications();
      const mappings = await this.getNotificationMappings();
      
      console.log('🔍 DEBUG: System status:', {
        initialized: this.isInitialized,
        permissions: permissions.status,
        platform: Platform.OS,
        isDevice: Device.isDevice,
        scheduledCount: scheduled.length,
        mappingCount: Object.keys(mappings).length,
        trackedCount: this.scheduledNotificationIds.size
      });
      
      console.log('🔍 DEBUG: Stored mappings:', mappings);
      console.log('🔍 DEBUG: Tracked notification IDs:', Array.from(this.scheduledNotificationIds));
      
      return {
        permissions,
        scheduled,
        mappings,
        systemStatus: {
          initialized: this.isInitialized,
          platform: Platform.OS,
          isDevice: Device.isDevice,
          trackedNotifications: this.scheduledNotificationIds.size
        }
      };
      
    } catch (error) {
      console.error('🔍 DEBUG: Error during diagnostic:', error);
      return { error: error.message };
    }
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