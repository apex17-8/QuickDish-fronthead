// src/services/userService.ts
import api from './api';
import type { User, UserRole, ApiResponse } from '../types';

// ================== TYPES ==================
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
  address?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  address?: string;
}

export interface UserFilters {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
}

// ================== SERVICE ==================
export const UserService = {
  // Fetch all users with optional filters
  getAllUsers: async (filters?: UserFilters): Promise<User[]> => {
    const res = await api.get<ApiResponse<User[]>>('/users', { params: filters });
    if (!res.data.success) throw new Error(res.data.error || 'Failed to fetch users');
    return res.data.data || [];
  },

  // Fetch user by ID
  getUserById: async (id: number): Promise<User> => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    if (!res.data.success) throw new Error(res.data.error || 'User not found');
    if (!res.data.data) throw new Error('User data is missing');
    return res.data.data;
  },

  // Create a new user
  createUser: async (data: CreateUserData): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    if (!res.data.success) throw new Error(res.data.error || 'Failed to create user');
    if (!res.data.data) throw new Error('Created user data is missing');
    return res.data.data;
  },

  // Update existing user
  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    if (!res.data.success) throw new Error(res.data.error || 'Failed to update user');
    if (!res.data.data) throw new Error('Updated user data is missing');
    return res.data.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<boolean> => {
    const res = await api.delete<ApiResponse<void>>(`/users/${id}`);
    if (!res.data.success) throw new Error(res.data.error || 'Failed to delete user');
    return true;
  },

  // Get current user (with localStorage caching)
  getCurrentUser: async (): Promise<User> => {
    const cachedStr = localStorage.getItem('user');
    if (!cachedStr) throw new Error('No user found in localStorage');

    try {
      const cachedUser: User = JSON.parse(cachedStr);

      try {
        const freshUser = await UserService.getUserById(cachedUser.user_id);
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      } catch (err) {
        console.warn('Failed to fetch fresh user data, returning cached user:', err);
        return cachedUser;
      }
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
      localStorage.removeItem('user');
      throw new Error('Invalid user data in localStorage');
    }
  },

  // Update profile of current user
  updateProfile: async (data: UpdateUserData): Promise<User> => {
    const currentUser = await UserService.getCurrentUser();
    const updatedUser = await UserService.updateUser(currentUser.user_id, data);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<boolean> => {
    const currentUser = await UserService.getCurrentUser();
    const res = await api.patch<ApiResponse<void>>(`/users/${currentUser.user_id}/password`, {
      oldPassword,
      newPassword
    });
    if (!res.data.success) throw new Error(res.data.error || 'Failed to change password');
    return true;
  },

  // Get users by role (server or client-side)
  getUsersByRole: async (role: UserRole, useServerSide = true): Promise<User[]> => {
    if (useServerSide) {
      const res = await api.get<ApiResponse<User[]>>('/users', { params: { role } });
      if (!res.data.success) throw new Error(res.data.error || 'Failed to fetch users by role');
      return res.data.data || [];
    } else {
      const allUsers = await UserService.getAllUsers();
      return allUsers.filter(u => u.role === role);
    }
  },

  // Search users (server-side if available, fallback client-side)
  searchUsers: async (query: string): Promise<User[]> => {
    try {
      const res = await api.get<ApiResponse<User[]>>('/users/search', { params: { q: query } });
      if (!res.data.success) throw new Error('Search failed');
      return res.data.data || [];
    } catch {
      console.warn('Search endpoint unavailable, falling back to client-side search');
      const users = await UserService.getAllUsers();
      const q = query.toLowerCase();
      return users.filter(
        u => u.name.toLowerCase().includes(q) ||
             u.email.toLowerCase().includes(q) ||
             u.phone.includes(query)
      );
    }
  },

  // Get user statistics (fallback to client-side if needed)
  getUserStats: async (): Promise<{ total: number; byRole: Record<UserRole, number>; activeUsers: number }> => {
    try {
      const res = await api.get<ApiResponse<{ total: number; byRole: Record<UserRole, number>; activeUsers: number }>>('/users/stats');
      if (!res.data.success) throw new Error(res.data.error || 'Failed to fetch stats');
      return res.data.data!;
    } catch {
      const users = await UserService.getAllUsers();
      const byRole: Record<UserRole, number> = {} as Record<UserRole, number>;
      users.forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });
      return { total: users.length, byRole, activeUsers: users.length };
    }
  }
};
