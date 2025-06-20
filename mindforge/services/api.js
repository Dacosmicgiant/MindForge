// API Service for MindForge Backend Communication

const BACKEND_URL = "https://mindforge-41ld.onrender.com";

// API Configuration
const API_CONFIG = {
  baseURL: BACKEND_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to create API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const config = {
    method: 'GET',
    headers: { ...API_CONFIG.headers },
    ...options,
  };

  // Add auth token if available (for future use)
  const token = null; // TODO: Get from AsyncStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(`🌐 API Request: ${config.method} ${url}`);

  try {
    const response = await fetch(url, config);
    
    console.log(`📡 Response Status: ${response.status}`);
    
    if (!response.ok) {
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
  
  // Authentication (for future implementation)
  signup: (userData) => apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  logout: () => apiRequest('/api/auth/logout', {
    method: 'POST',
  }),
  
  getProfile: () => apiRequest('/api/auth/me'),
  
  // Habits (for future implementation)
  getHabits: () => apiRequest('/api/habits'),
  
  createHabit: (habitData) => apiRequest('/api/habits', {
    method: 'POST',
    body: JSON.stringify(habitData),
  }),
  
  markHabit: (habitId, markData) => apiRequest(`/api/habits/${habitId}/mark`, {
    method: 'PUT',
    body: JSON.stringify(markData),
  }),
  
  getHabitProgress: (habitId, days = 7) => apiRequest(`/api/habits/${habitId}/progress?days=${days}`),
  
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