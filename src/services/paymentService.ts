// src/services/paymentService.ts
import api from './api';
import type { Payment, ApiResponse } from '../types';

// Define payment-related types
export interface InitializePaymentData {
  orderId: number;
  amount: number;
  customerId: number;
  email: string;
  paymentMethod: 'card' | 'mobile_money' | 'cash';
  mobileMoneyNumber?: string; // For mobile money payments
  cardDetails?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    name: string;
  };
}

export interface PaymentVerification {
  success: boolean;
  payment: Payment;
  message: string;
  transactionId?: string;
}

export interface InitializePaymentResponse {
  success: boolean;
  message: string;
  paymentReference: string;
  authorizationUrl?: string; // For redirect payments
  paymentDetails?: {
    amount: number;
    currency: string;
    paymentMethod: string;
    redirectUrl?: string;
  };
}

export interface CanMakePaymentResponse {
  canPay: boolean;
  reason?: string;
  amountDue?: number;
  alreadyPaid?: boolean;
}

export interface PaymentCallbackResponse {
  success: boolean;
  payment: Payment;
  orderStatus: string;
  message: string;
}

export const paymentService = {
  // Initialize payment
  initializePayment: async (data: InitializePaymentData): Promise<InitializePaymentResponse> => {
    const response = await api.post<ApiResponse<InitializePaymentResponse>>('/payments/initialize', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to initialize payment');
    }
    return response.data.data;
  },

  // Verify payment
  verifyPayment: async (reference: string): Promise<PaymentVerification> => {
    const response = await api.get<ApiResponse<PaymentVerification>>(`/payments/verify?reference=${reference}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to verify payment');
    }
    return response.data.data;
  },

  // Get payment by ID
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Payment not found');
    }
    return response.data.data;
  },

  // Get user payments
  getUserPayments: async (userId: number, page: number = 1, limit: number = 20): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>(`/payments/user/${userId}`, {
      params: { page, limit }
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch user payments');
    }
    return response.data.data || [];
  },

  // Get order payments
  getOrderPayments: async (orderId: number): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>(`/payments/order/${orderId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch order payments');
    }
    return response.data.data || [];
  },

  // Check if order can be paid
  canMakePayment: async (orderId: number): Promise<CanMakePaymentResponse> => {
    try {
      const response = await api.get<ApiResponse<CanMakePaymentResponse>>(`/payments/order/${orderId}/can-pay`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return { canPay: false, reason: 'Payment check failed' };
    } catch (error) {
      console.log(error);
      console.warn('Payment check endpoint not available');
      return { canPay: false, reason: 'Payment system unavailable' };
    }
  },

  // Get payment by order
  getPaymentByOrder: async (orderId: number): Promise<Payment | null> => {
    try {
      const response = await api.get<ApiResponse<Payment>>(`/payments/by-order/${orderId}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.log(error);
      console.warn('Get payment by order endpoint not available');
    }
    return null;
  },

  // Cancel pending payment
  cancelPendingPayment: async (paymentId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<ApiResponse<void>>(`/payments/${paymentId}/cancel`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to cancel payment');
    }
    return { success: true, message: 'Payment cancelled successfully' };
  },

  // Handle payment webhook (for frontend simulation)
  handlePaymentCallback: async (reference: string): Promise<PaymentCallbackResponse> => {
    const response = await api.get<ApiResponse<PaymentCallbackResponse>>(`/payments/callback?reference=${reference}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Payment callback failed');
    }
    return response.data.data;
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<Array<{
    id: string;
    name: string;
    type: 'card' | 'mobile_money' | 'cash';
    isEnabled: boolean;
    fees: number;
    minAmount?: number;
    maxAmount?: number;
  }>> => {
    try {
      const response = await api.get<ApiResponse<any>>('/payments/methods');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.log(error);
      console.warn('Payment methods endpoint not available');
    }
    // Return default payment methods
    return [
      { id: 'card', name: 'Credit/Debit Card', type: 'card', isEnabled: true, fees: 0 },
      { id: 'mobile_money', name: 'Mobile Money', type: 'mobile_money', isEnabled: true, fees: 0 },
      { id: 'cash', name: 'Cash on Delivery', type: 'cash', isEnabled: true, fees: 0 },
    ];
  },

  // Calculate payment fees
  calculateFees: async (amount: number, paymentMethod: string): Promise<{
    amount: number;
    fees: number;
    total: number;
    breakdown: Array<{ name: string; amount: number }>;
  }> => {
    try {
      const response = await api.post<ApiResponse<any>>('/payments/calculate-fees', {
        amount,
        paymentMethod
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.log(error);
      console.warn('Calculate fees endpoint not available');
    }
    // Default calculation
    return {
      amount,
      fees: 0,
      total: amount,
      breakdown: [
        { name: 'Subtotal', amount },
        { name: 'Payment Fee', amount: 0 },
      ]
    };
  },

  // Get payment history with filters
  getPaymentHistory: async (filters?: {
    userId?: number;
    orderId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: {
      totalAmount: number;
      successfulPayments: number;
      failedPayments: number;
      pendingPayments: number;
    };
  }> => {
    const response = await api.get<ApiResponse<any>>('/payments/history', { params: filters });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch payment history');
    }
    return response.data.data || {
      payments: [],
      total: 0,
      page: filters?.page || 1,
      limit: filters?.limit || 20,
      totalPages: 0,
      summary: {
        totalAmount: 0,
        successfulPayments: 0,
        failedPayments: 0,
        pendingPayments: 0,
      }
    };
  },

  // Request payment refund
  requestRefund: async (paymentId: number, reason: string): Promise<{
    success: boolean;
    message: string;
    refundId?: string;
  }> => {
    const response = await api.post<ApiResponse<any>>(`/payments/${paymentId}/request-refund`, { reason });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to request refund');
    }
    return {
      success: true,
      message: response.data.data?.message || 'Refund requested successfully',
      refundId: response.data.data?.refundId,
    };
  },

  // Save card for future payments
  saveCard: async (cardDetails: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    name: string;
  }): Promise<{
    success: boolean;
    cardToken: string;
    lastFour: string;
    cardType: string;
  }> => {
    const response = await api.post<ApiResponse<any>>('/payments/save-card', cardDetails);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to save card');
    }
    return response.data.data;
  },

  // Get saved payment methods
  getSavedPaymentMethods: async (userId: number): Promise<Array<{
    id: string;
    type: 'card' | 'mobile_money';
    lastFour?: string;
    cardType?: string;
    phoneNumber?: string;
    isDefault: boolean;
  }>> => {
    const response = await api.get<ApiResponse<any>>(`/payments/user/${userId}/saved-methods`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch saved payment methods');
    }
    return response.data.data || [];
  },

  // Delete saved payment method
  deleteSavedPaymentMethod: async (methodId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<ApiResponse<void>>(`/payments/saved-methods/${methodId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete payment method');
    }
    return { success: true, message: 'Payment method deleted successfully' };
  },
};