// src/services/orderService.ts - FIXED
import api from './api';
import type { Order } from '../types';

export const OrdersService = {
  // Get all orders with filters
  getAllOrders: async (filters?: any): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders', { params: filters });
    return response.data;
  },

  // Get order by ID 
  getOrderById: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  // Get order with details
  getOrderWithDetails: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}/details`);
    return response.data;
  },

  // Create order - EXISTS
  createOrder: async (orderData: any): Promise<Order> => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  // Create order with payment - EXISTS
  createOrderWithPayment: async (orderData: any): Promise<any> => {
    const response = await api.post('/orders/create-with-payment', orderData);
    return response.data;
  },

  // Get customer orders - EXISTS
  getCustomerOrders: async (customerId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/customer/${customerId}`);
    return response.data;
  },

  // Get restaurant orders - EXISTS
  getRestaurantOrders: async (restaurantId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}`);
    return response.data;
  },

  // Get rider orders - EXISTS
  getRiderOrders: async (riderId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/rider/${riderId}`);
    return response.data;
  },

  // Get pending orders for restaurant - EXISTS
  getPendingOrdersForRestaurant: async (restaurantId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}/pending`);
    return response.data;
  },

  // Get ready orders - EXISTS
  getReadyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/ready');
    return response.data;
  },

  // Assign rider - EXISTS
  assignRider: async (orderId: number, riderId: number): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/assign-rider`, { rider_id: riderId });
    return response.data;
  },

  // Update order status - EXISTS - FIXED: Added arrow function
  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Update order - EXISTS
  updateOrder: async (orderId: number, data: any): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}`, data);
    return response.data;
  },

  // Submit rating - EXISTS
  submitRating: async (orderId: number, rating: number, feedback?: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/rate`, { rating, feedback });
    return response.data;
  },

  // Cancel order - EXISTS
  cancelOrder: async (orderId: number, reason?: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Confirm delivery by customer - EXISTS
  confirmDeliveryByCustomer: async (orderId: number): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/confirm-customer`);
    return response.data;
  },

  // Confirm delivery by rider - EXISTS
  confirmDeliveryByRider: async (orderId: number): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/confirm-rider`);
    return response.data;
  },

  // Get order stats - EXISTS
  getOrderStats: async (restaurantId?: number): Promise<any> => {
    const params = restaurantId ? { restaurant_id: restaurantId } : {};
    const response = await api.get('/orders/stats', { params });
    return response.data;
  },

  // Get revenue stats - EXISTS
  getRevenueStats: async (restaurantId?: number, days: number = 30): Promise<any> => {
    const params = { 
      ...(restaurantId && { restaurant_id: restaurantId }),
      days 
    };
    const response = await api.get('/orders/revenue', { params });
    return response.data;
  },
};