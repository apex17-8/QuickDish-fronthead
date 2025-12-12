import api from './api';
import type {
  RiderDetails,
  LocationUpdateData,
  RiderOrder,
  AvailableOrder,
  OrderStatusUpdate,
  DeliveryConfirmation,
  RiderEarnings,
  WithdrawalRequest,
  RiderPerformance,
  RiderStats,
  ChatMessage,
  RiderSchedule
} from '../types/service-types';
import {type ApiResponse}  from '../types';
import type { Payment } from '../types/';
export const RiderService = {
  // Get rider details
  getRiderDetails: async (riderId: number): Promise<RiderDetails> => {
    const response = await api.get<ApiResponse<RiderDetails>>(`/riders/${riderId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch rider details');
    }
    return response.data.data;
  },

  // Update rider status
  updateRiderStatus: async (riderId: number, isOnline: boolean): Promise<{ success: boolean; message: string }> => {
    const endpoint = isOnline ? 'go-online' : 'go-offline';
    const response = await api.patch<ApiResponse<{ success: boolean; message: string }>>(`/riders/${riderId}/${endpoint}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update rider status');
    }
    return response.data.data || { success: true, message: 'Status updated successfully' };
  },

  // Update rider location
  updateLocation: async (riderId: number, lat: number, lng: number): Promise<LocationUpdateData> => {
    const response = await api.patch<ApiResponse<LocationUpdateData>>(`/riders/${riderId}/update-location`, {
      latitude: lat,
      longitude: lng,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update location');
    }
    return response.data.data;
  },

  // Get rider orders
  getRiderOrders: async (riderId: number, status?: string): Promise<RiderOrder[]> => {
    const params = status ? { riderId, status } : { riderId };
    const response = await api.get<ApiResponse<RiderOrder[]>>(`/orders/rider/${riderId}`, { params });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch rider orders');
    }
    return response.data.data || [];
  },

  // Get available orders
  getAvailableOrders: async (): Promise<AvailableOrder[]> => {
    const response = await api.get<ApiResponse<AvailableOrder[]>>('/orders/ready');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch available orders');
    }
    return response.data.data || [];
  },

  // Accept order
  acceptOrder: async (orderId: number, riderId: number): Promise<RiderOrder> => {
    const response = await api.patch<ApiResponse<RiderOrder>>(`/orders/${orderId}/assign-rider`, {
      rider_id: riderId,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to accept order');
    }
    return response.data.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: string): Promise<OrderStatusUpdate> => {
    const response = await api.patch<ApiResponse<OrderStatusUpdate>>(`/orders/${orderId}/status`, { status });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update order status');
    }
    return response.data.data;
  },

  // Confirm delivery
  confirmDelivery: async (orderId: number): Promise<DeliveryConfirmation> => {
    const response = await api.patch<ApiResponse<DeliveryConfirmation>>(`/orders/${orderId}/confirm-rider`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to confirm delivery');
    }
    return response.data.data;
  },

  // Get rider earnings
  getRiderEarnings: async (riderId: number, range: string = 'month'): Promise<RiderEarnings> => {
    const response = await api.get<ApiResponse<RiderEarnings>>(`/riders/${riderId}/earnings?range=${range}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch rider earnings');
    }
    return response.data.data;
  },

  // Get rider payments
  getRiderPayments: async (riderId: number): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>(`/payments/user/${riderId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch rider payments');
    }
    return response.data.data || [];
  },

  // Request withdrawal
  requestWithdrawal: async (riderId: number, amount: number, method: string): Promise<WithdrawalRequest> => {
    const response = await api.post<ApiResponse<WithdrawalRequest>>('/withdrawals/request', {
      riderId,
      amount,
      method,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to request withdrawal');
    }
    return response.data.data;
  },

  // Get rider performance
  getRiderPerformance: async (riderId: number): Promise<RiderPerformance> => {
    const response = await api.get<ApiResponse<RiderPerformance>>(`/riders/${riderId}/performance`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch rider performance');
    }
    return response.data.data;
  },

  // Get rider statistics
  getRiderStats: async (riderId: number): Promise<RiderStats> => {
    const response = await api.get<ApiResponse<RiderStats>>(`/riders/${riderId}/stats`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch rider stats');
    }
    return response.data.data;
  },

  // Send message to customer
  sendMessage: async (orderId: number, riderId: number, message: string): Promise<ChatMessage> => {
    const response = await api.post<ApiResponse<ChatMessage>>('/messages', {
      orderId,
      senderId: riderId,
      senderType: 'rider',
      content: message,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to send message');
    }
    return response.data.data;
  },

  // Get order chat messages
  getOrderMessages: async (orderId: number): Promise<ChatMessage[]> => {
    const response = await api.get<ApiResponse<ChatMessage[]>>(`/messages/${orderId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch messages');
    }
    return response.data.data || [];
  },

  // Get rider schedule
  getRiderSchedule: async (riderId: number): Promise<RiderSchedule> => {
    const response = await api.get<ApiResponse<RiderSchedule>>(`/riders/${riderId}/schedule`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch rider schedule');
    }
    return response.data.data;
  },

  // Update rider schedule
  updateRiderSchedule: async (riderId: number, schedule: Partial<RiderSchedule>): Promise<RiderSchedule> => {
    const response = await api.patch<ApiResponse<RiderSchedule>>(`/riders/${riderId}/schedule`, schedule);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update schedule');
    }
    return response.data.data;
  },
};