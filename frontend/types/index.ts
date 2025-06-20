// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Habit Types
export interface Habit {
  _id: string;
  name: string;
  description: string;
  userId: string;
  reminderTime?: string;
  isActive: boolean;
  isArchived: boolean;
  streak: number;
  longestStreak: number;
  totalCompletions: number;
  category: HabitCategory;
  difficulty: HabitDifficulty;
  color: string;
  completionRecords: CompletionRecord[];
  completedToday: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompletionRecord {
  date: string;
  completed: boolean;
  notes: string;
}

export interface HabitProgress {
  habitId: string;
  habitName: string;
  days: number;
  history: Array<{
    date: string;
    completed: boolean;
    notes: string;
  }>;
  statistics: {
    completedDays: number;
    totalDays: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
  };
}

export interface HabitStats {
  totalActiveHabits: number;
  archivedHabits: number;
  habitsCompletedToday: number;
  todayCompletionRate: number;
  weeklyCompletionRate: number;
  longestStreakOverall: number;
  categoriesUsed: number;
}

// API Types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  user?: User;
  habits?: Habit[];
  habit?: Habit;
  token?: string;
  progress?: HabitProgress;
  stats?: HabitStats;
  errors?: string[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalHabits: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  message: string;
  errors?: string[];
  statusCode?: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
}

export interface HabitForm {
  name: string;
  description?: string;
  reminderTime?: string;
  category: HabitCategory;
  difficulty: HabitDifficulty;
  color: string;
}

export interface UpdateProfileRequest {
  name?: string;
  profilePicture?: string;
}

// Enum Types
export type HabitCategory = 'health' | 'fitness' | 'learning' | 'productivity' | 'personal' | 'other';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';

// Category and Difficulty Definitions
export interface CategoryOption {
  id: HabitCategory;
  name: string;
  icon: string;
  color: string;
}

export interface DifficultyOption {
  id: HabitDifficulty;
  name: string;
  color: string;
}

// Navigation Types
export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
};

export type TabStackParamList = {
  dashboard: undefined;
  create: undefined;
  progress: undefined;
  profile: undefined;
};

export type RootStackParamList = {
  index: undefined;
  '(auth)': undefined;
  '(tabs)': undefined;
};

// Component Props Types
export interface HabitItemProps {
  habit: Habit;
  onToggle: (habitId: string, completed: boolean) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

export interface ProgressChartProps {
  data: Array<{
    date: string;
    completed: boolean;
    notes?: string;
  }>;
  color?: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
}

// Notification Types
export interface NotificationData {
  habitId: string;
  habitName: string;
  type: 'reminder' | 'celebration' | 'motivation';
}

export interface ScheduledNotification {
  id: string;
  habitId: string;
  habitName: string;
  time: string;
}

// Storage Types
export interface StorageData {
  userToken?: string;
  userData?: User;
  onboardingCompleted?: boolean;
  notificationPermissionAsked?: boolean;
}