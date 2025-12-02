import api from './api';
import type{ Order, OrderStatus, CreateOrderDto } from '../types';

export const OrdersService = {
  // Get all orders (admin/restaurant)
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
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

  // Get user's orders
  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/my-orders');
    return response.data;
  },

  // Get restaurant orders
  getRestaurantOrders: async (restaurantId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}`);
    return response.data;
  },

  // Get rider orders
  getRiderOrders: async (riderId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/rider/${riderId}`);
    return response.data;
  },

  // Create order
  createOrder: async (orderData: CreateOrderDto): Promise<Order> => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  // Create order with payment
  createOrderWithPayment: async (orderData: any): Promise<{ order: Order; payment: any }> => {
    const response = await api.post('/orders/create-with-payment', orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Assign rider to order
  assignRider: async (orderId: number, riderId: number): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/assign-rider`, { rider_id: riderId });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: number, reason?: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Submit rating for order
  submitRating: async (orderId: number, rating: number, feedback?: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/rate`, { rating, feedback });
    return response.data;
  },

  // Confirm delivery by customer
  confirmDeliveryByCustomer: async (orderId: number): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/confirm-customer`);
    return response.data;
  },

  // Confirm delivery by rider
  confirmDeliveryByRider: async (orderId: number): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/confirm-rider`);
    return response.data;
  },

  // Get order statistics
  getOrderStats: async (restaurantId?: number): Promise<any> => {
    const url = restaurantId 
      ? `/orders/stats?restaurant_id=${restaurantId}`
      : '/orders/stats';
    const response = await api.get(url);
    return response.data;
  },

  // Get revenue statistics
  getRevenueStats: async (restaurantId?: number, days: number = 30): Promise<any> => {
    const url = restaurantId 
      ? `/orders/revenue?restaurant_id=${restaurantId}&days=${days}`
      : `/orders/revenue?days=${days}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get payment statistics
  getPaymentStats: async (restaurantId?: number): Promise<any> => {
    const url = restaurantId 
      ? `/orders/payment-stats?restaurant_id=${restaurantId}`
      : '/orders/payment-stats';
    const response = await api.get(url);
    return response.data;
  },

  // Search orders
  searchOrders: async (query: string, filters?: any): Promise<Order[]> => {
    const response = await api.post<Order[]>('/orders/search', { query, filters });
    return response.data;
  },

  // Get pending orders for restaurant
  getPendingOrdersForRestaurant: async (restaurantId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}/pending`);
    return response.data;
  },

  // Get ready orders (for riders)
  getReadyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/ready');
    return response.data;
  },

  // Recalculate order total
  recalculateOrderTotal: async (orderId: number): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/recalculate-total`);
    return response.data;
  },

  // Export orders
  exportOrders: async (filters: any): Promise<any> => {
    const response = await api.post('/orders/export', filters, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete order (soft delete)
  deleteOrder: async (orderId: number): Promise<void> => {
    await api.delete(`/orders/${orderId}`);
  },
};