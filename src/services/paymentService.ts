import api from './api';
import type{ Payment } from '../types';

export const paymentService = {
  // Payment
  initializePayment: async (orderId: number, amount: number, email: string): Promise<any> => {
    const response = await api.post('/payments/initialize', {
      order_id: orderId,
      amount,
      email,
      callback_url: `${window.location.origin}/payment/callback`,
    });
    return response.data;
  },

  verifyPayment: async (reference: string): Promise<any> => {
    const response = await api.get(`/payments/verify?reference=${reference}`);
    return response.data;
  },

  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  getUserPayments: async (userId: number): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`/payments/user/${userId}`);
    return response.data;
  },

  getOrderPayments: async (orderId: number): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`/payments/order/${orderId}`);
    return response.data;
  },

  // Refunds
  requestRefund: async (paymentId: number, reason: string): Promise<void> => {
    await api.post(`/payments/${paymentId}/refund`, { reason });
  },

  // Payment Methods
  getPaymentMethods: async (): Promise<any[]> => {
    const response = await api.get('/payments/methods');
    return response.data;
  },

  addPaymentMethod: async (methodData: any): Promise<void> => {
    await api.post('/payments/methods', methodData);
  },

  removePaymentMethod: async (methodId: string): Promise<void> => {
    await api.delete(`/payments/methods/${methodId}`);
  },

  // Webhook test
  testWebhook: async (): Promise<void> => {
    await api.post('/payments/test-webhook');
  },
};