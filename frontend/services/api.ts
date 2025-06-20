import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, UpdateProfileRequest } from '../types';

const BASE_URL = 'https://mindforge-41ld.onrender.com/api';

class ApiService {
  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('userToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const authHeaders = await this.getAuthHeader();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers as Record<string, string> || {}),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string): Promise<ApiResponse> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<ApiResponse> {
    return this.request('/auth/me');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Habit endpoints
  async getHabits(): Promise<ApiResponse> {
    return this.request('/habits');
  }

  async createHabit(habitData: {
    name: string;
    description?: string;
    reminderTime?: string;
    category?: string;
    difficulty?: string;
    color?: string;
  }): Promise<ApiResponse> {
    return this.request('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  }

  async updateHabit(id: string, habitData: any): Promise<ApiResponse> {
    return this.request(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(habitData),
    });
  }

  async deleteHabit(id: string): Promise<ApiResponse> {
    return this.request(`/habits/${id}`, {
      method: 'DELETE',
    });
  }

  async markHabit(
    id: string,
    completed: boolean,
    notes?: string,
    date?: string
  ): Promise<ApiResponse> {
    return this.request(`/habits/${id}/mark`, {
      method: 'PUT',
      body: JSON.stringify({ completed, notes, date }),
    });
  }

  async getHabitProgress(id: string, days: number = 7): Promise<ApiResponse> {
    return this.request(`/habits/${id}/progress?days=${days}`);
  }

  async archiveHabit(id: string, archive: boolean = true): Promise<ApiResponse> {
    return this.request(`/habits/${id}/archive`, {
      method: 'PUT',
      body: JSON.stringify({ archive }),
    });
  }

  async getHabitStats(): Promise<ApiResponse> {
    return this.request('/habits/stats');
  }

  // Token management
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem('userToken', token);
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('userToken');
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('userToken');
  }

  // Health check
  async checkHealth(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;