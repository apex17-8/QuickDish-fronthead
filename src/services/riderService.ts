// src/services/riderService.ts
import api from './api';

export const RiderService = {
  // Get rider details
  getRiderDetails: async (riderId: number): Promise<any> => {
    const response = await api.get(`/riders/${riderId}`);
    return response.data;
  },

  // Update rider status
  updateRiderStatus: async (riderId: number, isOnline: boolean): Promise<any> => {
    const endpoint = isOnline ? 'go-online' : 'go-offline';
    const response = await api.patch(`/riders/${riderId}/${endpoint}`);
    return response.data;
  },

  // Update rider location
  updateLocation: async (riderId: number, lat: number, lng: number): Promise<any> => {
    const response = await api.patch(`/riders/${riderId}/update-location`, {
      latitude: lat,
      longitude: lng,
    });
    return response.data;
  },

  // Get rider orders
  getRiderOrders: async (riderId: number): Promise<any[]> => {
    const response = await api.get(`/orders/rider/${riderId}`);
    return response.data;
  },

  // Get available orders
  getAvailableOrders: async (): Promise<any[]> => {
    const response = await api.get('/orders/ready');
    return response.data;
  },

  // Accept order
  acceptOrder: async (orderId: number, riderId: number): Promise<any> => {
    const response = await api.patch(`/orders/${orderId}/assign-rider`, {
      rider_id: riderId,
    });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: string): Promise<any> => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Confirm delivery
  confirmDelivery: async (orderId: number): Promise<any> => {
    const response = await api.patch(`/orders/${orderId}/confirm-rider`);
    return response.data;
  },

  // Get rider earnings
  getRiderEarnings: async (riderId: number, range: string = 'month'): Promise<any> => {
    const response = await api.get(`/riders/${riderId}/earnings?range=${range}`);
    return response.data;
  },

  // Get rider payments
  getRiderPayments: async (riderId: number): Promise<any[]> => {
    const response = await api.get(`/payments/user/${riderId}`);
    return response.data;
  },

  // Request withdrawal
  requestWithdrawal: async (riderId: number, amount: number, method: string): Promise<any> => {
    const response = await api.post('/withdrawals/request', {
      riderId,
      amount,
      method,
    });
    return response.data;
  },

  // Get rider performance
  getRiderPerformance: async (riderId: number): Promise<any> => {
    const response = await api.get(`/riders/${riderId}/performance`);
    return response.data;
  },

  // Get rider statistics
  getRiderStats: async (riderId: number): Promise<any> => {
    const response = await api.get(`/riders/${riderId}/stats`);
    return response.data;
  },

  // Send message to customer
  sendMessage: async (orderId: number, riderId: number, message: string): Promise<any> => {
    const response = await api.post('/messages', {
      orderId,
      senderId: riderId,
      senderType: 'rider',
      content: message,
    });
    return response.data;
  },

  // Get order chat messages
  getOrderMessages: async (orderId: number): Promise<any[]> => {
    const response = await api.get(`/messages/${orderId}`);
    return response.data;
  },

  // Get rider schedule
  getRiderSchedule: async (riderId: number): Promise<any> => {
    const response = await api.get(`/riders/${riderId}/schedule`);
    return response.data;
  },

  // Update rider schedule
  updateRiderSchedule: async (riderId: number, schedule: any): Promise<any> => {
    const response = await api.patch(`/riders/${riderId}/schedule`, schedule);
    return response.data;
  },
};