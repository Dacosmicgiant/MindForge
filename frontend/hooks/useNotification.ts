import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import notificationService from '../services/notifications';

export const useNotifications = () => {
  const router = useRouter();
const notificationListener = useRef<Notifications.Subscription | null>(null);
const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Initialize notifications
    const initializeNotifications = async () => {
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        console.log('Notification permissions granted');
      }
    };

    initializeNotifications();

    // Listen for notifications received while app is foregrounded
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // You can handle foreground notifications here
        // For example, show a custom in-app notification
      }
    );

    // Listen for notification interactions (user tapped on notification)
    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        
        const { habitId } = response.notification.request.content.data || {};
        
        if (habitId) {
          // Navigate to the specific habit or dashboard
          router.push('/(tabs)/dashboard');
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  // Helper functions for habit notifications
  const scheduleHabitReminder = async (habitId: string, habitName: string, time: string) => {
    return await notificationService.scheduleHabitReminder(habitId, habitName, time);
  };

  const cancelHabitReminder = async (habitId: string) => {
    return await notificationService.cancelHabitReminder(habitId);
  };

  const sendMotivationalNotification = async (completedHabits: number, totalHabits: number) => {
    return await notificationService.sendMotivationalNotification(completedHabits, totalHabits);
  };

  const sendStreakCelebration = async (habitName: string, streakCount: number) => {
    return await notificationService.sendStreakCelebration(habitName, streakCount);
  };

  return {
    scheduleHabitReminder,
    cancelHabitReminder,
    sendMotivationalNotification,
    sendStreakCelebration,
  };
};