// src/services/orderService.ts
import api from './api';
import type { Order, PaginatedResponse, CreateOrderDto } from '../types';

// Define order-related types
export interface OrderFilters {
  status?: string;
  restaurantId?: number;
  customerId?: number;
  riderId?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'total_price' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderWithPaymentData extends CreateOrderDto {
  paymentMethod: 'card' | 'mobile_money' | 'cash';
  paymentDetails?: {
    cardToken?: string;
    mobileMoneyNumber?: string;
    saveCard?: boolean;
  };
}

export interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageDeliveryTime: number;
  popularItems: Array<{
    menu_item_id: number;
    name: string;
    quantity: number;
  }>;
  statusDistribution: Record<string, number>;
}

export interface RevenueStats {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueChangePercentage: number;
  dailyBreakdown?: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export const OrdersService = {
  // Get all orders with filters and pagination
  getAllOrders: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<Order[]>('/orders', { params: filters });
    const items = response.data || [];
    
    // Implement frontend pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = items.slice(start, end);
    
    return {
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit)
    };
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

  // Create order
  createOrder: async (orderData: CreateOrderDto): Promise<Order> => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  // Create order with payment
  createOrderWithPayment: async (orderData: CreateOrderWithPaymentData): Promise<{
    order: Order;
    payment: {
      success: boolean;
      paymentReference: string;
      authorizationUrl?: string;
      message: string;
    };
  }> => {
    const response = await api.post<{
      order: Order;
      payment: {
        success: boolean;
        paymentReference: string;
        authorizationUrl?: string;
        message: string;
      };
    }>('/orders/create-with-payment', orderData);
    return response.data;
  },

  // Get customer orders
  getCustomerOrders: async (customerId: number, filters?: OrderFilters): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/customer/${customerId}`);
    let orders = response.data || [];
    
    // Apply filters on frontend
    if (filters?.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    return orders;
  },

  // Get restaurant orders
  getRestaurantOrders: async (restaurantId: number, filters?: OrderFilters): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}`);
    let orders = response.data || [];
    
    // Apply filters on frontend
    if (filters?.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    return orders;
  },

  // Get rider orders
  getRiderOrders: async (riderId: number, filters?: OrderFilters): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/rider/${riderId}`);
    let orders = response.data || [];
    
    // Apply filters on frontend
    if (filters?.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    return orders;
  },

  // Get pending orders for restaurant
  getPendingOrdersForRestaurant: async (restaurantId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}/pending`);
    return response.data || [];
  },

  // Get ready orders (for riders to pick up)
  getReadyOrders: async (location?: { latitude: number; longitude: number }): Promise<Order[]> => {
    const params = location ? { ...location, radius: 5 } : {};
    const response = await api.get<Order[]>('/orders/ready', { params });
    return response.data || [];
  },

  // Assign rider to order
  assignRider: async (orderId: number, riderId: number, options?: {
    estimatedPickupTime?: string;
    estimatedDeliveryTime?: string;
  }): Promise<Order> => {
    const data = { rider_id: riderId, ...options };
    const response = await api.patch<Order>(`/orders/${orderId}/assign-rider`, data);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: string, notes?: string): Promise<Order> => {
    const data: { status: string; notes?: string } = { status };
    if (notes) data.notes = notes;
    
    const response = await api.patch<Order>(`/orders/${orderId}/status`, data);
    return response.data;
  },

  // Update order details
  updateOrder: async (orderId: number, data: any): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}`, data);
    return response.data;
  },

  // Submit rating for order
  submitRating: async (orderId: number, rating: number, feedback?: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/rate`, { rating, feedback });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: number, reason?: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/cancel`, { reason });
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
  getOrderStats: async (restaurantId?: number): Promise<OrderStats> => {
    try {
      const params = restaurantId ? { restaurant_id: restaurantId } : {};
      const response = await api.get<OrderStats>('/orders/stats', { params });
      return response.data || {
        totalOrders: 0,
        todayOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        averageDeliveryTime: 0,
        popularItems: [],
        statusDistribution: {},
      };
    } catch (error) {
      console.warn('Order stats endpoint not available, returning default stats');
      return {
        totalOrders: 0,
        todayOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        averageDeliveryTime: 0,
        popularItems: [],
        statusDistribution: {},
      };
    }
  },

  // Get revenue statistics
  getRevenueStats: async (restaurantId?: number, days: number = 30): Promise<RevenueStats> => {
    try {
      const params = { 
        ...(restaurantId && { restaurant_id: restaurantId }),
        days 
      };
      const response = await api.get<RevenueStats>('/orders/revenue', { params });
      return response.data || {
        period: `${days} days`,
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueChangePercentage: 0,
      };
    } catch (error) {
      console.warn('Revenue stats endpoint not available, returning default stats');
      return {
        period: `${days} days`,
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueChangePercentage: 0,
      };
    }
  },

  // Get payment statistics
  getPaymentStats: async (restaurantId?: number): Promise<any> => {
    try {
      const params = restaurantId ? { restaurant_id: restaurantId } : {};
      const response = await api.get<any>('/orders/payment-stats', { params });
      return response.data || {
        total: 0,
        paid: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
        paidPercentage: 0,
        totalRevenue: 0,
        paymentMethods: {},
      };
    } catch (error) {
      console.warn('Payment stats endpoint not available, returning default stats');
      return {
        total: 0,
        paid: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
        paidPercentage: 0,
        totalRevenue: 0,
        paymentMethods: {},
      };
    }
  },

  // Search orders (frontend implementation)
  searchOrders: async (query: string, filters?: OrderFilters): Promise<Order[]> => {
    const allOrders = await OrdersService.getAllOrders(filters);
    const searchTerm = query.toLowerCase();
    
    return allOrders.items.filter(order => 
      order.order_id.toString().includes(searchTerm) ||
      order.customer?.user?.name?.toLowerCase().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm) ||
      order.delivery_address?.toLowerCase().includes(searchTerm)
    );
  },

  // Get today's orders
  getTodaysOrders: async (restaurantId?: number): Promise<Order[]> => {
    try {
      const params = restaurantId ? { restaurant_id: restaurantId } : {};
      const response = await api.get<Order[]>('/orders/today', { params });
      return response.data || [];
    } catch (error) {
      console.warn('Today orders endpoint not available, returning empty array');
      return [];
    }
  },

  // Export orders to CSV
  exportOrders: async (filters?: OrderFilters): Promise<Blob> => {
    const response = await api.get('/orders/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Recalculate order total
  recalculateOrderTotal: async (orderId: number): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/recalculate-total`);
    return response.data;
  }
};