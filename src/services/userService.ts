// src/services/userService.ts
import api from './api';
import { UserRole } from '../types';
import type { User } from '../types';

export const UserService = {
  // Get all users - EXISTS
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Get user by ID - EXISTS
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Update user - EXISTS
  updateUser: async (id: number, userData: any): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user - EXISTS
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Create user - EXISTS
  createUser: async (userData: any): Promise<User> => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  // Get current user (from localStorage + verify with backend)
  getCurrentUser: async (): Promise<User> => {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('No user found');
    
    const user = JSON.parse(userStr);
    try {
      // Verify user exists and get fresh data
      const freshUser = await UserService.getUserById(user.user_id);
      return freshUser;
    } catch (error) {
      // Return cached user if fetch fails
      return user;
    }
  },

  // Get users by role (filter client-side)
  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    const users = await UserService.getAllUsers();
    return users.filter(user => user.role === role);
  },

  // Search users (filter client-side)
  searchUsers: async (query: string): Promise<User[]> => {
    const users = await UserService.getAllUsers();
    const lowerQuery = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.phone.includes(query)
    );
  },
};