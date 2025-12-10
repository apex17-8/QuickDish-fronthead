import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Payment } from '../../types';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Payments'],
  endpoints: (builder) => ({
    // Initialize payment
    initializePayment: builder.mutation<any, { orderId: number; amount: number; email: string }>({
      query: ({ orderId, amount, email }) => ({
        url: '/payments/initialize',
        method: 'POST',
        body: { order_id: orderId, amount, email, callback_url: `${window.location.origin}/payment/callback` },
      }),
    }),

    // Verify payment
    verifyPayment: builder.query<any, string>({
      query: (reference) => `/payments/verify?reference=${reference}`,
    }),

    // Get payment by ID
    getPaymentById: builder.query<Payment, number>({
      query: (id) => `/payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Payments', id }],
    }),

    // Get user payments
    getUserPayments: builder.query<Payment[], number>({
      query: (userId) => `/payments/user/${userId}`,
      providesTags: ['Payments'],
    }),

    // Get order payments
    getOrderPayments: builder.query<Payment[], number>({
      query: (orderId) => `/payments/order/${orderId}`,
      providesTags: ['Payments'],
    }),

    // Get all payments
    getAllPayments: builder.query<Payment[], void>({
      query: () => '/payments',
      providesTags: ['Payments'],
    }),

    // Request refund
    requestRefund: builder.mutation<void, { paymentId: number; reason: string }>({
      query: ({ paymentId, reason }) => ({
        url: `/payments/${paymentId}/refund`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Payments'],
    }),

    // Get payment methods
    getPaymentMethods: builder.query<any[], void>({
      query: () => '/payments/methods',
    }),

    // Add payment method
    addPaymentMethod: builder.mutation<void, any>({
      query: (methodData) => ({
        url: '/payments/methods',
        method: 'POST',
        body: methodData,
      }),
      invalidatesTags: ['Payments'],
    }),

    // Remove payment method
    removePaymentMethod: builder.mutation<void, string>({
      query: (methodId) => ({
        url: `/payments/methods/${methodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payments'],
    }),
  }),
});

export const {
  useInitializePaymentMutation,
  useVerifyPaymentQuery,
  useGetPaymentByIdQuery,
  useGetUserPaymentsQuery,
  useGetOrderPaymentsQuery,
  useGetAllPaymentsQuery,
  useRequestRefundMutation,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useRemovePaymentMethodMutation,
} = paymentApi;