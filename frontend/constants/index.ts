// App Constants
export const APP_NAME = 'Habit Tracker';
export const VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = 'https://mindforge-41ld.onrender.com/api';

// Colors
export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#F3F4F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textLight: '#FFFFFF',
  
  // Background Colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Habit Colors
  habitColors: [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6',
    '#EC4899', '#6B7280',
  ],
};

// Habit Categories
export const HABIT_CATEGORIES = [
  { id: 'health', name: 'Health', icon: 'fitness', color: '#EF4444' },
  { id: 'fitness', name: 'Fitness', icon: 'barbell', color: '#F97316' },
  { id: 'learning', name: 'Learning', icon: 'book', color: '#3B82F6' },
  { id: 'productivity', name: 'Productivity', icon: 'trending-up', color: '#8B5CF6' },
  { id: 'personal', name: 'Personal', icon: 'heart', color: '#EC4899' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

// Habit Difficulties
export const HABIT_DIFFICULTIES = [
  { id: 'easy', name: 'Easy', color: '#10B981' },
  { id: 'medium', name: 'Medium', color: '#F59E0B' },
  { id: 'hard', name: 'Hard', color: '#EF4444' },
];

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Screen Dimensions
export const SCREEN = {
  padding: 20,
  headerHeight: 60,
  tabBarHeight: 60,
};

// Time Formats
export const TIME_FORMATS = {
  display: 'h:mm A',
  input: 'HH:mm',
  date: 'MMM dd, yyyy',
  dateTime: 'MMM dd, yyyy h:mm A',
};

// Validation Rules
export const VALIDATION = {
  email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  password: {
    minLength: 6,
    maxLength: 128,
  },
  habit: {
    nameMaxLength: 100,
    descriptionMaxLength: 500,
    notesMaxLength: 200,
  },
  reminderTime: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
};

// Storage Keys
export const STORAGE_KEYS = {
  userToken: 'userToken',
  userData: 'userData',
  onboardingCompleted: 'onboardingCompleted',
  notificationPermissionAsked: 'notificationPermissionAsked',
};

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'Session expired. Please login again.',
  validation: 'Please check your input and try again.',
  server: 'Server error. Please try again later.',
  unknown: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  habitCreated: 'Habit created successfully!',
  habitUpdated: 'Habit updated successfully!',
  habitDeleted: 'Habit deleted successfully!',
  habitCompleted: 'Great job! Habit marked as completed.',
  habitUncompleted: 'Habit unmarked.',
  profileUpdated: 'Profile updated successfully!',
  loginSuccess: 'Welcome back!',
  signupSuccess: 'Account created successfully!',
};

// Motivational Messages
export const MOTIVATIONAL_MESSAGES = {
  streakMessages: [
    "You're on fire! 🔥",
    "Keep the momentum going! 💪",
    "Consistency is key! 🗝️",
    "You're building great habits! 🌟",
    "One step at a time! 👣",
  ],
  completionMessages: [
    "Excellent work today! 🎉",
    "You're making progress! 📈",
    "Keep up the great work! 💯",
    "You're unstoppable! 🚀",
    "Amazing dedication! 🏆",
  ],
  encouragementMessages: [
    "Every small step counts! 👣",
    "Progress, not perfection! ✨",
    "You've got this! 💪",
    "Building better habits! 🌱",
    "Stay consistent! 🎯",
  ],
};

// Default Values
export const DEFAULTS = {
  habit: {
    category: 'other',
    difficulty: 'medium',
    color: COLORS.primary,
    reminderTime: '',
  },
  pagination: {
    limit: 50,
    page: 1,
  },
  progress: {
    days: 7,
  },
};

// Feature Flags
export const FEATURES = {
  notifications: true,
  analytics: false,
  socialSharing: false,
  habitTemplates: false,
  goals: false,
  rewards: false,
};

export default {
  COLORS,
  HABIT_CATEGORIES,
  HABIT_DIFFICULTIES,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  ANIMATION_DURATION,
  SCREEN,
  TIME_FORMATS,
  VALIDATION,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MOTIVATIONAL_MESSAGES,
  DEFAULTS,
  FEATURES,
};