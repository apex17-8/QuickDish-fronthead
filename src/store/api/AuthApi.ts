// src/redux/apis/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginRequest, LoginResponse, SignupRequest, User, ApiResponse } from '../../types';
import { BACKEND_URL } from '../../utils/utils';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (res: ApiResponse<LoginResponse>) => {
        if (!res.success) throw new Error(res.error || 'Login failed');
        return res.data!;
      },
      invalidatesTags: ['Auth'],
    }),

    signup: builder.mutation<LoginResponse, SignupRequest>({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (res: ApiResponse<LoginResponse>) => {
        if (!res.success) throw new Error(res.error || 'Signup failed,your email may already be in use');
        return res.data!;
      },
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/signout',
        method: 'POST',
      }),
      transformResponse: (res: ApiResponse<void>) => {
        if (!res.success) throw new Error(res.error || 'Logout failed');
      },
      invalidatesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<{ accessToken: string; refreshToken: string }, string>({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` },
      }),
      transformResponse: (res: ApiResponse<{ accessToken: string; refreshToken: string }>) => {
        if (!res.success) throw new Error(res.error || 'Token refresh failed');
        return res.data!;
      },
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => '/users/me',
      transformResponse: (res: ApiResponse<User>) => {
        if (!res.success) throw new Error(res.error || 'Failed to fetch current user');
        return res.data!;
      },
      providesTags: ['Auth'],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PATCH',
        body: userData,
      }),
      transformResponse: (res: ApiResponse<User>) => {
        if (!res.success) throw new Error(res.error || 'Failed to update profile');
        return res.data!;
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} = authApi;
