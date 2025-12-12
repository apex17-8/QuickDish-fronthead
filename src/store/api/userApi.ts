// src/redux/apis/userApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User, UserRole, ApiResponse } from '../../types';
import { BACKEND_URL } from '../../utils/utils';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: (res: ApiResponse<User[]>) => {
        if (!res.success) throw new Error(res.error || 'Failed to fetch users');
        return res.data || [];
      },
      providesTags: ['Users'],
    }),

    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      transformResponse: (res: ApiResponse<User>) => {
        if (!res.success) throw new Error(res.error || 'User not found');
        return res.data!;
      },
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (res: ApiResponse<User>) => {
        if (!res.success) throw new Error(res.error || 'Failed to create user');
        return res.data!;
      },
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation<User, { id: number; userData: Partial<User> }>({
      query: ({ id, userData }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: userData,
      }),
      transformResponse: (res: ApiResponse<User>) => {
        if (!res.success) throw new Error(res.error || 'Failed to update user');
        return res.data!;
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiResponse<void>) => {
        if (!res.success) throw new Error(res.error || 'Failed to delete user');
      },
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

export type { User, UserRole };