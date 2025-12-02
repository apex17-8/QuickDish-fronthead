import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User, UserRole } from '../../types';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // Get all users (admin only)
    getAllUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),

    // Get user by ID
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    // Get users by role
    getUsersByRole: builder.query<User[], UserRole>({
      query: (role) => `/users/role/${role}`,
      providesTags: ['Users'],
    }),

    // Create user (admin only)
    createUser: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),

    // Update user
    updateUser: builder.mutation<User, { id: number; userData: Partial<User> }>({
      query: ({ id, userData }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }],
    }),

    // Delete user
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Update user role
    updateUserRole: builder.mutation<User, { id: number; role: UserRole }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }],
    }),

    // Search users
    searchUsers: builder.query<User[], string>({
      query: (query) => `/users/search?q=${query}`,
      providesTags: ['Users'],
    }),

    // Get user statistics
    getUserStats: builder.query<any, void>({
      query: () => '/users/stats',
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetUsersByRoleQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  useSearchUsersQuery,
  useGetUserStatsQuery,
} = userApi;