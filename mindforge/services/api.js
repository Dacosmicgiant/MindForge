// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://mindforge-41ld.onrender.com/api';

class ApiService {
  constructor() {
    this.token = null;
  }

  // Get stored token
  async getToken() {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('authToken');
    }
    return this.token;
  }

  // Set token in memory and storage
  async setToken(token) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = await this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          // Token expired or invalid
          await this.setToken(null);
          throw new Error('Authentication expired. Please login again.');
        }
        
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ API Success: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error.message);
      
      // Network error handling
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication endpoints
  async signup(userData) {
    const response = await this.post('/auth/signup', userData);
    if (response.token) {
      await this.setToken(response.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.token) {
      await this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.log('Logout API call failed, but clearing local token anyway');
    } finally {
      await this.setToken(null);
    }
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async updateProfile(userData) {
    return this.put('/auth/profile', userData);
  }

  // Habit endpoints
  async getHabits(params = {}) {
    return this.get('/habits', params);
  }

  async createHabit(habitData) {
    return this.post('/habits', habitData);
  }

  async updateHabit(habitId, habitData) {
    return this.put(`/habits/${habitId}`, habitData);
  }

  async deleteHabit(habitId) {
    return this.delete(`/habits/${habitId}`);
  }

  async markHabit(habitId, markData) {
    return this.put(`/habits/${habitId}/mark`, markData);
  }

  async getHabitProgress(habitId, days = 7) {
    return this.get(`/habits/${habitId}/progress`, { days });
  }

  async archiveHabit(habitId, archive = true) {
    return this.put(`/habits/${habitId}/archive`, { archive });
  }

  async getHabitStats() {
    return this.get('/habits/stats');
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }
}

// Export singleton instance
export default new ApiService();