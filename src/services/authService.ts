// src/services/authService.ts
import api from './api';
import type { LoginRequest, LoginResponse, SignupRequest, User } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('Login API call to:', '/auth/signin'); // REMOVED /api
      const response = await api.post<LoginResponse>('/auth/signin', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  signup: async (userData: SignupRequest): Promise<LoginResponse> => {
    try {
      console.log('Signup API call to:', '/auth/signup'); // REMOVED /api
      const response = await api.post<LoginResponse>('/auth/signup', userData);
      return response.data;
    } catch (error: any) {
      console.error('Signup API error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/signout'); // REMOVED /api
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('customer');
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
      const response = await api.post('/auth/refresh', {}, { // REMOVED /api
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user from API:', error);
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user found in localStorage');
      }
      
      return JSON.parse(userStr);
    }
  },
};