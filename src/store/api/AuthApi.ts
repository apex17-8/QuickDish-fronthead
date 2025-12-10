import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginRequest, LoginResponse, SignupRequest, User } from '../../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    // FIXED: Changed from full URL to relative path
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
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
      invalidatesTags: ['Auth'],
    }),

    signup: builder.mutation<LoginResponse, SignupRequest>({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/signout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<{ accessToken: string; refreshToken: string }, string>({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }),
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => '/users/profile',
      providesTags: ['Auth'],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PATCH',
        body: userData,
      }),
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