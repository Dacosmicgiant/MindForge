import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface ScheduledNotification {
  id: string;
  habitId: string;
  habitName: string;
  time: string; // HH:MM format
}

class NotificationService {
  private scheduledNotifications: ScheduledNotification[] = [];

  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
        sound: 'default',
      });
    }

    return true;
  }

  async scheduleHabitReminder(
    habitId: string,
    habitName: string,
    reminderTime: string // HH:MM format
  ): Promise<string | null> {
    try {
      // Parse the time
      const [hours, minutes] = reminderTime.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error('Invalid time format:', reminderTime);
        return null;
      }

      // Cancel existing notification for this habit
      await this.cancelHabitReminder(habitId);

      // Schedule the notification using daily trigger
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Habit Reminder',
          body: `Time to complete: ${habitName}`,
          data: { habitId, habitName },
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'habit-reminders',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });

      // Store the scheduled notification
      const scheduledNotification: ScheduledNotification = {
        id: notificationId,
        habitId,
        habitName,
        time: reminderTime,
      };

      this.scheduledNotifications = this.scheduledNotifications.filter(
        n => n.habitId !== habitId
      );
      this.scheduledNotifications.push(scheduledNotification);

      console.log(`Scheduled daily reminder for ${habitName} at ${reminderTime}`);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  // Alternative method using Calendar trigger
  async scheduleHabitReminderWithCalendar(
    habitId: string,
    habitName: string,
    reminderTime: string // HH:MM format
  ): Promise<string | null> {
    try {
      // Parse the time
      const [hours, minutes] = reminderTime.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error('Invalid time format:', reminderTime);
        return null;
      }

      // Cancel existing notification for this habit
      await this.cancelHabitReminder(habitId);

      // Schedule the notification using calendar trigger
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Habit Reminder',
          body: `Time to complete: ${habitName}`,
          data: { habitId, habitName },
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'habit-reminders',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      // Store the scheduled notification
      const scheduledNotification: ScheduledNotification = {
        id: notificationId,
        habitId,
        habitName,
        time: reminderTime,
      };

      this.scheduledNotifications = this.scheduledNotifications.filter(
        n => n.habitId !== habitId
      );
      this.scheduledNotifications.push(scheduledNotification);

      console.log(`Scheduled calendar reminder for ${habitName} at ${reminderTime}`);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelHabitReminder(habitId: string): Promise<void> {
    try {
      const notification = this.scheduledNotifications.find(n => n.habitId === habitId);
      
      if (notification) {
        await Notifications.cancelScheduledNotificationAsync(notification.id);
        this.scheduledNotifications = this.scheduledNotifications.filter(
          n => n.habitId !== habitId
        );
        console.log(`Cancelled reminder for habit ${habitId}`);
      }
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllHabitReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications = [];
      console.log('Cancelled all habit reminders');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async sendImmediateNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          ...(Platform.OS === 'android' && {
            channelId: 'habit-reminders',
          }),
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send immediate notification:', error);
    }
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return [...this.scheduledNotifications];
  }

  getScheduledNotificationForHabit(habitId: string): ScheduledNotification | undefined {
    return this.scheduledNotifications.find(n => n.habitId === habitId);
  }

  async updateHabitReminder(
    habitId: string,
    habitName: string,
    newTime: string
  ): Promise<string | null> {
    // Cancel existing and schedule new
    await this.cancelHabitReminder(habitId);
    return this.scheduleHabitReminder(habitId, habitName, newTime);
  }

  // Listen for notification interactions
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Send motivational notifications
  async sendMotivationalNotification(completedHabits: number, totalHabits: number): Promise<void> {
    const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
    
    let title = '🎉 Great Progress!';
    let body = '';

    if (completionRate === 100) {
      body = 'Amazing! You completed all your habits today! 🏆';
    } else if (completionRate >= 75) {
      body = `You're doing great! ${completedHabits}/${totalHabits} habits completed today! 💪`;
    } else if (completionRate >= 50) {
      body = `Good progress! ${completedHabits}/${totalHabits} habits done. Keep going! 🌟`;
    } else if (completionRate > 0) {
      body = `You've started strong with ${completedHabits} habits. Don't stop now! 🚀`;
    } else {
      title = '🌅 Ready to Start?';
      body = 'It\'s a new day! Time to work on your habits and build momentum! 💫';
    }

    await this.sendImmediateNotification(title, body);
  }

  // Send streak celebration
  async sendStreakCelebration(habitName: string, streakCount: number): Promise<void> {
    let title = '🔥 Streak Milestone!';
    let body = '';

    if (streakCount === 7) {
      body = `One week streak with "${habitName}"! You're building momentum! 🎯`;
    } else if (streakCount === 30) {
      body = `30-day streak with "${habitName}"! You're unstoppable! 🏆`;
    } else if (streakCount === 100) {
      body = `100-day streak with "${habitName}"! You're a habit master! 👑`;
    } else if (streakCount % 10 === 0 && streakCount >= 10) {
      body = `${streakCount}-day streak with "${habitName}"! Keep the fire burning! 🔥`;
    }

    if (body) {
      await this.sendImmediateNotification(title, body);
    }
  }

  // Get all scheduled notifications (for debugging)
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Test notification method for debugging
  async testNotification(): Promise<void> {
    await this.sendImmediateNotification(
      'Test Notification',
      'This is a test notification to verify the service is working!'
    );
  }

  // Schedule a notification for testing (5 seconds from now)
  async scheduleTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Scheduled Notification',
          body: 'This notification was scheduled 5 seconds ago!',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
        },
      });
      console.log('Test notification scheduled for 5 seconds from now');
    } catch (error) {
      console.error('Failed to schedule test notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;