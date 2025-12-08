// src/services/paymentService.ts - FIXED
import api from './api';
import type { Payment } from '../types';

export const paymentService = {
  // Initialize payment
  initializePayment: async (data: any): Promise<any> => {
    const response = await api.post('/payments/initialize', data);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (reference: string): Promise<any> => {
    const response = await api.get(`/payments/verify?reference=${reference}`);
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  // Get user payments
  getUserPayments: async (userId: number): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`/payments/user/${userId}`);
    return response.data;
  },

  // Get order payments
  getOrderPayments: async (orderId: number): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`/payments/order/${orderId}`);
    return response.data;
  },

  // Check if order can be paid
  canMakePayment: async (orderId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/payments/order/${orderId}/can-pay`);
      return response.data.canPay;
    } catch (error) {
      return false;
    }
  },

  // NEW: Get payment by order
  getPaymentByOrder: async (orderId: number): Promise<Payment | null> => {
    try {
      const response = await api.get(`/payments/by-order/${orderId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  //Cancel pending payment
  cancelPendingPayment: async (paymentId: number): Promise<void> => {
    await api.post(`/payments/${paymentId}/cancel`);
  },

  // Handle payment webhook (for frontend simulation)
  handlePaymentCallback: async (reference: string): Promise<any> => {
    const response = await api.get(`/payments/callback?reference=${reference}`);
    return response.data;
  },
};