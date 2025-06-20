// contexts/HabitContext.js - Habit State Management
import { createContext, useContext, useReducer, useCallback } from 'react';
import ApiService from '../services/api';

// Habit state shape
const initialState = {
  habits: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalHabits: 0,
    hasMore: false,
  },
  filters: {
    category: 'all',
    includeArchived: false,
  },
  stats: {
    totalActiveHabits: 0,
    habitsCompletedToday: 0,
    todayCompletionRate: 0,
    weeklyCompletionRate: 0,
    longestStreakOverall: 0,
  },
};

// Habit actions
const HabitActions = {
  SET_LOADING: 'SET_LOADING',
  SET_HABITS: 'SET_HABITS',
  ADD_HABIT: 'ADD_HABIT',
  UPDATE_HABIT: 'UPDATE_HABIT',
  DELETE_HABIT: 'DELETE_HABIT',
  TOGGLE_HABIT_COMPLETION: 'TOGGLE_HABIT_COMPLETION',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  SET_STATS: 'SET_STATS',
  RESET_HABITS: 'RESET_HABITS',
};

// Habit reducer
function habitReducer(state, action) {
  switch (action.type) {
    case HabitActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case HabitActions.SET_HABITS:
      return {
        ...state,
        habits: action.payload.habits,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case HabitActions.ADD_HABIT:
      return {
        ...state,
        habits: [action.payload, ...state.habits],
        isLoading: false,
        error: null,
      };

    case HabitActions.UPDATE_HABIT:
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit._id === action.payload._id ? action.payload : habit
        ),
        isLoading: false,
        error: null,
      };

    case HabitActions.DELETE_HABIT:
      return {
        ...state,
        habits: state.habits.filter(habit => habit._id !== action.payload),
        isLoading: false,
        error: null,
      };

    case HabitActions.TOGGLE_HABIT_COMPLETION:
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit._id === action.payload.habitId
            ? { ...habit, completedToday: action.payload.completed }
            : habit
        ),
        error: null,
      };

    case HabitActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case HabitActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case HabitActions.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case HabitActions.SET_STATS:
      return {
        ...state,
        stats: action.payload,
      };

    case HabitActions.RESET_HABITS:
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

// Create context
const HabitContext = createContext(null);

// Habit provider component
export function HabitProvider({ children }) {
  const [state, dispatch] = useReducer(habitReducer, initialState);

  // Fetch habits from API
  const fetchHabits = useCallback(async (params = {}) => {
    try {
      dispatch({ type: HabitActions.SET_LOADING, payload: true });
      dispatch({ type: HabitActions.CLEAR_ERROR });

      const queryParams = {
        ...state.filters,
        ...params,
      };

      const response = await ApiService.getHabits(queryParams);

      dispatch({
        type: HabitActions.SET_HABITS,
        payload: {
          habits: response.habits,
          pagination: response.pagination,
        },
      });

      return { success: true, data: response };
    } catch (error) {
      dispatch({ type: HabitActions.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [state.filters]);

  // Create new habit
  const createHabit = useCallback(async (habitData) => {
    try {
      dispatch({ type: HabitActions.SET_LOADING, payload: true });
      dispatch({ type: HabitActions.CLEAR_ERROR });

      const response = await ApiService.createHabit(habitData);

      dispatch({
        type: HabitActions.ADD_HABIT,
        payload: response.habit,
      });

      return { success: true, habit: response.habit };
    } catch (error) {
      dispatch({ type: HabitActions.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  // Update habit
  const updateHabit = useCallback(async (habitId, habitData) => {
    try {
      dispatch({ type: HabitActions.SET_LOADING, payload: true });
      dispatch({ type: HabitActions.CLEAR_ERROR });

      const response = await ApiService.updateHabit(habitId, habitData);

      dispatch({
        type: HabitActions.UPDATE_HABIT,
        payload: response.habit,
      });

      return { success: true, habit: response.habit };
    } catch (error) {
      dispatch({ type: HabitActions.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  // Delete habit
  const deleteHabit = useCallback(async (habitId) => {
    try {
      dispatch({ type: HabitActions.SET_LOADING, payload: true });
      dispatch({ type: HabitActions.CLEAR_ERROR });

      await ApiService.deleteHabit(habitId);

      dispatch({
        type: HabitActions.DELETE_HABIT,
        payload: habitId,
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: HabitActions.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  // Mark habit as complete/incomplete
  const toggleHabitCompletion = useCallback(async (habitId, completed = true, notes = '') => {
    try {
      // Optimistic update
      dispatch({
        type: HabitActions.TOGGLE_HABIT_COMPLETION,
        payload: { habitId, completed },
      });

      const response = await ApiService.markHabit(habitId, {
        completed,
        notes,
      });

      // Update with server response
      dispatch({
        type: HabitActions.UPDATE_HABIT,
        payload: response.habit,
      });

      return { success: true, habit: response.habit };
    } catch (error) {
      // Revert optimistic update on error
      dispatch({
        type: HabitActions.TOGGLE_HABIT_COMPLETION,
        payload: { habitId, completed: !completed },
      });

      dispatch({ type: HabitActions.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  // Archive/Unarchive habit
  const archiveHabit = useCallback(async (habitId, archive = true) => {
    try {
      dispatch({ type: HabitActions.SET_LOADING, payload: true });
      dispatch({ type: HabitActions.CLEAR_ERROR });

      const response = await ApiService.archiveHabit(habitId, archive);

      dispatch({
        type: HabitActions.UPDATE_HABIT,
        payload: response.habit,
      });

      return { success: true, habit: response.habit };
    } catch (error) {
      dispatch({ type: HabitActions.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  // Fetch habit statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await ApiService.getHabitStats();

      dispatch({
        type: HabitActions.SET_STATS,
        payload: response.stats,
      });

      return { success: true, stats: response.stats };
    } catch (error) {
      console.log('Failed to fetch stats:', error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Get habit progress
  const getHabitProgress = useCallback(async (habitId, days = 7) => {
    try {
      const response = await ApiService.getHabitProgress(habitId, days);
      return { success: true, progress: response.progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({
      type: HabitActions.SET_FILTERS,
      payload: filters,
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: HabitActions.CLEAR_ERROR });
  }, []);

  // Reset habits (for logout)
  const resetHabits = useCallback(() => {
    dispatch({ type: HabitActions.RESET_HABITS });
  }, []);

  // Refresh habits (pull to refresh)
  const refreshHabits = useCallback(async () => {
    const result = await fetchHabits();
    if (result.success) {
      await fetchStats();
    }
    return result;
  }, [fetchHabits, fetchStats]);

  // Get today's habits (completed and incomplete)
  const getTodaysHabits = useCallback(() => {
    return {
      completed: state.habits.filter(habit => habit.completedToday),
      incomplete: state.habits.filter(habit => !habit.completedToday),
      total: state.habits.length,
    };
  }, [state.habits]);

  const value = {
    // State
    habits: state.habits,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    pagination: state.pagination,
    filters: state.filters,
    stats: state.stats,
    
    // Actions
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    archiveHabit,
    fetchStats,
    getHabitProgress,
    setFilters,
    clearError,
    resetHabits,
    refreshHabits,
    
    // Computed
    getTodaysHabits,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

// Custom hook to use habit context
export function useHabits() {
  const context = useContext(HabitContext);
  
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  
  return context;
}

// Custom hook for habit operations with loading states
export function useHabitActions() {
  const context = useHabits();
  
  return {
    createHabit: context.createHabit,
    updateHabit: context.updateHabit,
    deleteHabit: context.deleteHabit,
    toggleHabitCompletion: context.toggleHabitCompletion,
    archiveHabit: context.archiveHabit,
    isLoading: context.isLoading,
    error: context.error,
    clearError: context.clearError,
  };
}