import api from './api';
import type { LoginRequest, SignupRequest, User } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<User> => {
    try {
      console.log('Login API call to:', '/auth/signin');
      const response = await api.post<{ user: User; accessToken: string; refreshToken?: string }>('/auth/signin', credentials);

      if (!response.data || !response.data.accessToken || !response.data.user) {
        throw new Error('Invalid login response');
      }

      // Save tokens and user to localStorage
      localStorage.setItem('token', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data.user;
    } catch (error: any) {
      console.error('Login API error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  signup: async (userData: SignupRequest): Promise<User> => {
    try {
      console.log('Signup API call to:', '/auth/signup');
      const response = await api.post<{ user: User; accessToken: string; refreshToken?: string }>('/auth/signup', userData);

      if (!response.data || !response.data.accessToken || !response.data.user) {
        throw new Error('Invalid signup response');
      }

      // Save tokens and user to localStorage
      localStorage.setItem('token', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data.user;
    } catch (error: any) {
      console.error('Signup API error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/signout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('customer');
    }
  },

  refreshToken: async (): Promise<{ accessToken: string; refreshToken?: string }> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await api.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.data.accessToken) {
        throw new Error('Invalid refresh token response');
      }

      // Update localStorage with new tokens
      localStorage.setItem('token', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      // Your backend doesn't have a /users/me endpoint based on provided controllers
      // So we'll use the stored user data
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user found in localStorage');
      }

      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  // Validate token by making a simple authenticated request
  validateToken: async (): Promise<boolean> => {
    try {
      // Try to access a protected endpoint
      await api.get('/customers/profile/me');
      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return false;
      }
      // Other errors might be network issues, not necessarily invalid token
      return true;
    }
  }
};
