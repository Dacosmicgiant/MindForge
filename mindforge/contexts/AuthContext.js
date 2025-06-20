// contexts/AuthContext.js - Compatible with React 19
import { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

// Auth state shape
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Auth actions
const AuthActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AuthActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case AuthActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActions.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AuthActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AuthActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AuthActions.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext(null);

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      dispatch({ type: AuthActions.SET_LOADING, payload: true });

      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        dispatch({ type: AuthActions.SET_LOADING, payload: false });
        return;
      }

      // Verify token with backend
      const response = await ApiService.getProfile();
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token,
        },
      });

    } catch (error) {
      console.log('Auth check failed:', error.message);
      // Clear invalid token
      await AsyncStorage.removeItem('authToken');
      await ApiService.setToken(null);
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING, payload: true });
      dispatch({ type: AuthActions.CLEAR_ERROR });

      const response = await ApiService.signup(userData);
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      return { success: true, user: response.user };
    } catch (error) {
      dispatch({ type: AuthActions.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING, payload: true });
      dispatch({ type: AuthActions.CLEAR_ERROR });

      const response = await ApiService.login(credentials);
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      return { success: true, user: response.user };
    } catch (error) {
      dispatch({ type: AuthActions.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.log('Logout error:', error.message);
    } finally {
      dispatch({ type: AuthActions.LOGOUT });
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await ApiService.updateProfile(userData);
      
      dispatch({
        type: AuthActions.UPDATE_USER,
        payload: response.user,
      });

      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: AuthActions.CLEAR_ERROR });
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // Actions
    signup,
    login,
    logout,
    updateProfile,
    clearError,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Higher-order component for protected routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return null; // or loading spinner
    }
    
    if (!isAuthenticated) {
      return null; // navigation will handle redirect
    }
    
    return <Component {...props} />;
  };
}