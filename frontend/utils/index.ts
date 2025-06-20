import { MOTIVATIONAL_MESSAGES } from '../constants';

// Date Utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time: string): string => {
  if (!time || !time.includes(':')) return time;
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const targetDate = new Date(date);
  
  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  );
};

export const isYesterday = (date: Date | string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = new Date(date);
  
  return (
    yesterday.getDate() === targetDate.getDate() &&
    yesterday.getMonth() === targetDate.getMonth() &&
    yesterday.getFullYear() === targetDate.getFullYear()
  );
};

export const getDaysAgo = (date: Date | string): number => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = Math.abs(today.getTime() - targetDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// String Utilities
export const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const generateInitials = (name: string): string => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Number Utilities
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Color Utilities
export const getContrastColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Validation Utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateReminderTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Habit Utilities
export const calculateStreakMessage = (streak: number): string => {
  if (streak === 0) return "Let's start building a streak!";
  if (streak === 1) return "Great start! 🌱";
  if (streak < 7) return `${streak} days strong! 💪`;
  if (streak < 30) return `${streak} days streak! 🔥`;
  if (streak < 100) return `${streak} days! You're unstoppable! 🚀`;
  return `${streak} days! Habit master! 👑`;
};

export const getCompletionRateColor = (rate: number): string => {
  if (rate >= 90) return '#10B981'; // Green
  if (rate >= 70) return '#F59E0B'; // Yellow
  if (rate >= 50) return '#F97316'; // Orange
  return '#EF4444'; // Red
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return '#10B981';
    case 'medium':
      return '#F59E0B';
    case 'hard':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

// Random Utilities
export const getRandomMotivationalMessage = (type: 'streak' | 'completion' | 'encouragement' = 'encouragement'): string => {
  const messages = MOTIVATIONAL_MESSAGES[`${type}Messages`] || MOTIVATIONAL_MESSAGES.encouragementMessages;
  return messages[Math.floor(Math.random() * messages.length)];
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Delay Utility
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Error Handling
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

// Storage Utilities
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) || fallback;
  } catch {
    return fallback;
  }
};

// Platform Utilities
export const isIOS = (): boolean => {
  return require('react-native').Platform.OS === 'ios';
};

export const isAndroid = (): boolean => {
  return require('react-native').Platform.OS === 'android';
};

// Analytics Helpers (for future use)
export const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
  // Placeholder for analytics tracking
  console.log('Track Event:', eventName, properties);
};

export const trackScreen = (screenName: string, properties?: Record<string, any>): void => {
  // Placeholder for screen tracking
  console.log('Track Screen:', screenName, properties);
};

// Export all utilities as default
export default {
  // Date
  formatDate,
  formatTime,
  isToday,
  isYesterday,
  getDaysAgo,
  getStartOfDay,
  getEndOfDay,
  
  // String
  capitalizeFirst,
  truncateText,
  generateInitials,
  
  // Number
  formatPercentage,
  clamp,
  
  // Color
  getContrastColor,
  hexToRgba,
  
  // Validation
  validateEmail,
  validatePassword,
  validateReminderTime,
  
  // Habit
  calculateStreakMessage,
  getCompletionRateColor,
  getDifficultyColor,
  
  // Random
  getRandomMotivationalMessage,
  shuffleArray,
  
  // Utility
  debounce,
  delay,
  getErrorMessage,
  safeJsonParse,
  isIOS,
  isAndroid,
  trackEvent,
  trackScreen,
};