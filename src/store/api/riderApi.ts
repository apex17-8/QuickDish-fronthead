import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Rider } from '../../types';
import { BACKEND_URL } from '../../utils/utils';

export const riderApi = createApi({
  reducerPath: 'riderApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BACKEND_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Riders'],
  endpoints: (builder) => ({
    // Get all riders
    getAllRiders: builder.query<Rider[], void>({
      query: () => '/riders',
      providesTags: ['Riders'],
    }),

    // Get rider by ID
    getRiderById: builder.query<Rider, number>({
      query: (id) => `/riders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Riders', id }],
    }),

    // Get available riders
    getAvailableRiders: builder.query<Rider[], void>({
      query: () => '/riders/available',
      providesTags: ['Riders'],
    }),

    // Update rider status
    updateRiderStatus: builder.mutation<Rider, { id: number; isOnline: boolean }>({
      query: ({ id, isOnline }) => ({
        url: `/riders/${id}/${isOnline ? 'go-online' : 'go-offline'}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Riders', id }],
    }),

    // Update rider location
    updateRiderLocation: builder.mutation<Rider, { id: number; latitude: number; longitude: number }>({
      query: ({ id, latitude, longitude }) => ({
        url: `/riders/${id}/update-location`,
        method: 'PATCH',
        body: { latitude, longitude },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Riders', id }],
    }),

    // Get rider location history
    getRiderLocationHistory: builder.query<number[], number>({
      query: (riderId) => `/rider-location/${riderId}/history`,
    }),

    // Get rider live location
    getRiderLiveLocation: builder.query<number, number>({
      query: (riderId) => `/rider-location/${riderId}/live`,
    }),

    // Get rider statistics
    getRiderStats: builder.query<number, number>({
      query: (riderId) => `/riders/${riderId}/stats`,
    }),

    // Get rider earnings
    getRiderEarnings: builder.query<number, { riderId: number; period: 'day' | 'week' | 'month' }>({
      query: ({ riderId, period }) => `/riders/${riderId}/earnings?period=${period}`,
    }),

    // Get assigned orders
    getAssignedOrders: builder.query<number[], number>({
      query: (riderId) => `/riders/${riderId}/assigned-orders`,
      providesTags: ['Riders'],
    }),

    // Accept order
    acceptOrder: builder.mutation<void, { riderId: number; orderId: number }>({
      query: ({ riderId, orderId }) => ({
        url: `/riders/${riderId}/accept-order`,
        method: 'POST',
        body: { orderId },
      }),
      invalidatesTags: ['Riders'],
    }),

    // Reject order
    rejectOrder: builder.mutation<void, { riderId: number; orderId: number }>({
      query: ({ riderId, orderId }) => ({
        url: `/riders/${riderId}/reject-order`,
        method: 'POST',
        body: { orderId },
      }),
      invalidatesTags: ['Riders'],
    }),

    // Get rider reviews
    getRiderReviews: builder.query<number[], number>({
      query: (riderId) => `/riders/${riderId}/reviews`,
    }),
  }),
});

export const {
  useGetAllRidersQuery,
  useGetRiderByIdQuery,
  useGetAvailableRidersQuery,
  useUpdateRiderStatusMutation,
  useUpdateRiderLocationMutation,
  useGetRiderLocationHistoryQuery,
  useGetRiderLiveLocationQuery,
  useGetRiderStatsQuery,
  useGetRiderEarningsQuery,
  useGetAssignedOrdersQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useGetRiderReviewsQuery,
} = riderApi;