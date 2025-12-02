import api from './api';
import {  UserRole } from '../types';
import type { User } from '../types';

export const UserService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/users/profile', userData);
    return response.data;
  },

  // Update user role (admin only)
  updateUserRole: async (userId: number, role: UserRole): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // Get users by role
  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    const response = await api.get<User[]>(`/users/role/${role}`);
    return response.data;
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/users/search?q=${query}`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<any> => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Update user status (active/inactive)
  updateUserStatus: async (userId: number, isActive: boolean): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/users/change-password', { currentPassword, newPassword });
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};