// API Service for MindForge Backend Communication
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = "https://mindforge-41ld.onrender.com";
const TOKEN_KEY = 'mindforge_auth_token';

// API Configuration
const API_CONFIG = {
  baseURL: BACKEND_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Token Management
export const tokenManager = {
  // Store auth token
  async storeToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('✅ Token stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Error storing token:', error);
      return false;
    }
  },

  // Get stored auth token
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  },

  // Remove auth token
  async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('✅ Token removed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error removing token:', error);
      return false;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
};

// Helper function to create API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const config = {
    method: 'GET',
    headers: { ...API_CONFIG.headers },
    ...options,
  };

  // Add auth token if available
  const token = await tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(`🌐 API Request: ${config.method} ${url}`);

  try {
    const response = await fetch(url, config);
    
    console.log(`📡 Response Status: ${response.status}`);
    
    if (!response.ok) {
      // Handle auth errors
      if (response.status === 401) {
        console.log('🔑 Authentication failed, removing token');
        await tokenManager.removeToken();
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`);
    return { success: true, data };
    
  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error.message);
    return { 
      success: false, 
      error: error.message,
      isNetworkError: !navigator.onLine || error.message.includes('fetch')
    };
  }
};

// API Methods
export const api = {
  // Health and Status
  getHealthCheck: () => apiRequest('/api/health'),
  getServerInfo: () => apiRequest('/'),
  getAuthHealth: () => apiRequest('/api/auth/health'),
  
  // Authentication (with token management)
  signup: async (userData) => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token on successful signup
    if (response.success && response.data.token) {
      await tokenManager.storeToken(response.data.token);
    }
    
    return response;
  },
  
  login: async (credentials) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token on successful login
    if (response.success && response.data.token) {
      await tokenManager.storeToken(response.data.token);
    }
    
    return response;
  },
  
  logout: async () => {
    const response = await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
    
    // Always remove token locally, even if API call fails
    await tokenManager.removeToken();
    
    return response;
  },
  
  getProfile: () => apiRequest('/api/auth/me'),
  
  // NEW: Update user profile
  updateProfile: (profileData) => apiRequest('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  // NEW: Change password
  changePassword: (passwordData) => apiRequest('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),
  
  // Habits
  getHabits: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/habits?${queryString}` : '/api/habits';
    return apiRequest(endpoint);
  },
  
  createHabit: (habitData) => apiRequest('/api/habits', {
    method: 'POST',
    body: JSON.stringify(habitData),
  }),
  
  // NEW: Get specific habit by ID
  getHabitById: (habitId) => apiRequest(`/api/habits/${habitId}`),
  
  // NEW: Update habit
  updateHabit: (habitId, habitData) => apiRequest(`/api/habits/${habitId}`, {
    method: 'PUT',
    body: JSON.stringify(habitData),
  }),
  
  // NEW: Delete habit
  deleteHabit: (habitId) => apiRequest(`/api/habits/${habitId}`, {
    method: 'DELETE',
  }),
  
  markHabit: (habitId, markData) => apiRequest(`/api/habits/${habitId}/mark`, {
    method: 'PUT',
    body: JSON.stringify(markData),
  }),
  
  getHabitProgress: (habitId, days = 7) => apiRequest(`/api/habits/${habitId}/progress?days=${days}`),
  
  // NEW: Archive/Unarchive habit
  archiveHabit: (habitId, archive = true) => apiRequest(`/api/habits/${habitId}/archive`, {
    method: 'PUT',
    body: JSON.stringify({ archive }),
  }),
  
  getHabitStats: () => apiRequest('/api/habits/stats'),
};

// Connection test utility
export const testBackendConnection = async () => {
  console.log('🔄 Testing backend connection...');
  
  const tests = [
    { name: 'Server Root', test: () => api.getServerInfo() },
    { name: 'Health Check', test: () => api.getHealthCheck() },
    { name: 'Auth Health', test: () => api.getAuthHealth() },
  ];
  
  const results = {};
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      results[name] = {
        success: result.success,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      results[name] = {
        success: false,
        error: error.message,
      };
    }
  }
  
  const allSuccessful = Object.values(results).every(r => r.success);
  
  console.log(allSuccessful ? '✅ All connection tests passed!' : '❌ Some connection tests failed');
  
  return {
    success: allSuccessful,
    results,
    backendUrl: BACKEND_URL,
  };
};

// Export backend URL for direct use
export const BACKEND_URL_EXPORT = BACKEND_URL;

export default api;