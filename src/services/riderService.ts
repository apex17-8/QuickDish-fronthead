import api from './api';
import type{ Rider, RiderLocation } from '../types';

export const riderService = {
  // Riders
  getAllRiders: async (): Promise<Rider[]> => {
    const response = await api.get<Rider[]>('/riders');
    return response.data;
  },

  getRiderById: async (id: number): Promise<Rider> => {
    const response = await api.get<Rider>(`/riders/${id}`);
    return response.data;
  },

  updateRiderStatus: async (riderId: number, isOnline: boolean): Promise<Rider> => {
    const endpoint = isOnline ? 'go-online' : 'go-offline';
    const response = await api.patch<Rider>(`/riders/${riderId}/${endpoint}`);
    return response.data;
  },

  updateRiderLocation: async (riderId: number, latitude: number, longitude: number): Promise<Rider> => {
    const response = await api.patch<Rider>(`/riders/${riderId}/update-location`, {
      latitude,
      longitude,
    });
    return response.data;
  },

  getAvailableRiders: async (): Promise<Rider[]> => {
    const response = await api.get<Rider[]>('/riders/available');
    return response.data;
  },

  getRiderLocationHistory: async (riderId: number): Promise<RiderLocation[]> => {
    const response = await api.get<RiderLocation[]>(`/rider-location/${riderId}/history`);
    return response.data;
  },

  getRiderLiveLocation: async (riderId: number): Promise<RiderLocation> => {
    const response = await api.get<RiderLocation>(`/rider-location/${riderId}/live`);
    return response.data;
  },

  // Rider Stats
  getRiderStats: async (riderId: number): Promise<any> => {
    const response = await api.get(`/riders/${riderId}/stats`);
    return response.data;
  },

  getRiderEarnings: async (riderId: number, period: 'day' | 'week' | 'month' = 'month'): Promise<any> => {
    const response = await api.get(`/riders/${riderId}/earnings?period=${period}`);
    return response.data;
  },

  // Assignment
  getAssignedOrders: async (riderId: number): Promise<any[]> => {
    const response = await api.get(`/riders/${riderId}/assigned-orders`);
    return response.data;
  },

  acceptOrder: async (riderId: number, orderId: number): Promise<void> => {
    await api.post(`/riders/${riderId}/accept-order`, { orderId });
  },

  rejectOrder: async (riderId: number, orderId: number): Promise<void> => {
    await api.post(`/riders/${riderId}/reject-order`, { orderId });
  },

  // Reviews
  getRiderReviews: async (riderId: number): Promise<any[]> => {
    const response = await api.get(`/riders/${riderId}/reviews`);
    return response.data;
  },

  submitRiderReview: async (riderId: number, rating: number, comment: string): Promise<void> => {
    await api.post(`/riders/${riderId}/reviews`, { rating, comment });
  },
};