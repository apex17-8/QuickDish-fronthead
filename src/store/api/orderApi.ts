import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Order, OrderStatus, CreateOrderDto } from '../../types';

export const orderApi = createApi({
  reducerPath: 'orderApi',
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
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    // Get all orders
    getAllOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Orders'],
    }),

    // Get user orders
    getUserOrders: builder.query<Order[], void>({
      query: () => '/orders/my-orders',
      providesTags: ['Orders'],
    }),

    // Get order by ID
    getOrderById: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),

    // Get order with details
    getOrderWithDetails: builder.query<Order, number>({
      query: (id) => `/orders/${id}/details`,
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),

    // Get restaurant orders
    getRestaurantOrders: builder.query<Order[], number>({
      query: (restaurantId) => `/orders/restaurant/${restaurantId}`,
      providesTags: ['Orders'],
    }),

    // Get rider orders
    getRiderOrders: builder.query<Order[], number>({
      query: (riderId) => `/orders/rider/${riderId}`,
      providesTags: ['Orders'],
    }),

    // Create order
    createOrder: builder.mutation<Order, CreateOrderDto>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),

    // Create order with payment
    createOrderWithPayment: builder.mutation<{ order: Order; payment: any }, any>({
      query: (orderData) => ({
        url: '/orders/create-with-payment',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<Order, { id: number; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }],
    }),

    // Assign rider
    assignRider: builder.mutation<Order, { id: number; riderId: number }>({
      query: ({ id, riderId }) => ({
        url: `/orders/${id}/assign-rider`,
        method: 'PATCH',
        body: { rider_id: riderId },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }],
    }),

    // Cancel order
    cancelOrder: builder.mutation<Order, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }],
    }),

    // Submit rating
    submitRating: builder.mutation<Order, { id: number; rating: number; feedback?: string }>({
      query: ({ id, rating, feedback }) => ({
        url: `/orders/${id}/rate`,
        method: 'POST',
        body: { rating, feedback },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }],
    }),

    // Get order statistics
    getOrderStats: builder.query<any, number | void>({
      query: (restaurantId) => 
        restaurantId 
          ? `/orders/stats?restaurant_id=${restaurantId}`
          : '/orders/stats',
    }),

    // Get revenue statistics
    getRevenueStats: builder.query<any, { restaurantId?: number; days?: number }>({
      query: ({ restaurantId, days = 30 }) => {
        let url = `/orders/revenue?days=${days}`;
        if (restaurantId) url += `&restaurant_id=${restaurantId}`;
        return url;
      },
    }),

    // Search orders
    searchOrders: builder.query<Order[], { query: string; filters?: any }>({
      query: ({ query, filters }) => ({
        url: '/orders/search',
        method: 'POST',
        body: { query, filters },
      }),
      providesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetUserOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderWithDetailsQuery,
  useGetRestaurantOrdersQuery,
  useGetRiderOrdersQuery,
  useCreateOrderMutation,
  useCreateOrderWithPaymentMutation,
  useUpdateOrderStatusMutation,
  useAssignRiderMutation,
  useCancelOrderMutation,
  useSubmitRatingMutation,
  useGetOrderStatsQuery,
  useGetRevenueStatsQuery,
  useSearchOrdersQuery,
} = orderApi;