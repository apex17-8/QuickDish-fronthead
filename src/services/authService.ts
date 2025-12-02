import api from './api';
import type{ LoginRequest} from '../types';
import type{ LoginResponse } from '../types';
import type{SignupRequest,} from '../types';
import type{ User } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/signin', credentials);
    return response.data;
  },

  signup: async (userData: SignupRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/signup', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/signout');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.patch('/users/profile', userData);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/users/change-password', { currentPassword, newPassword });
  },
};