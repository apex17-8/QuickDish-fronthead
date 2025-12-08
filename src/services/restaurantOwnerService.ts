// src/services/restaurantOwnerService.ts
import api from './api';
import type { Restaurant, MenuItem, RestaurantMenuCategory, Order } from '../types';

export const RestaurantOwnerService = {
  // ========== RESTAURANT MANAGEMENT ==========
  
  // Get restaurants owned by or managed by current user
  getMyRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants/owner/my-restaurants');
    return response.data;
  },

  // Create new restaurant
  createRestaurant: async (restaurantData: any): Promise<Restaurant> => {
    const response = await api.post<Restaurant>('/restaurants', restaurantData);
    return response.data;
  },

  // Update restaurant
  updateRestaurant: async (restaurantId: number, updateData: any): Promise<Restaurant> => {
    const response = await api.patch<Restaurant>(`/restaurants/${restaurantId}`, updateData);
    return response.data;
  },

  // Delete restaurant
  deleteRestaurant: async (restaurantId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/restaurants/${restaurantId}`);
    return response.data;
  },

  // Get restaurant details
  getRestaurantById: async (restaurantId: number): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
    return response.data;
  },

  // ========== MENU MANAGEMENT ==========
  
  // Add menu item
  addMenuItem: async (restaurantId: number, menuItemData: any): Promise<MenuItem> => {
    const response = await api.post<MenuItem>(
      `/restaurants/${restaurantId}/menu-items`, 
      menuItemData
    );
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (menuItemId: number, updateData: any): Promise<MenuItem> => {
    const response = await api.patch<MenuItem>(`/menu-items/${menuItemId}`, updateData);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (menuItemId: number): Promise<void> => {
    await api.delete(`/menu-items/${menuItemId}`);
  },

  // Get popular menu items
  getPopularMenuItems: async (restaurantId?: number): Promise<MenuItem[]> => {
    const url = restaurantId 
      ? `/menu-items/popular?restaurant_id=${restaurantId}`
      : '/menu-items/popular';
    const response = await api.get<MenuItem[]>(url);
    return response.data;
  },

  // Update menu category
  updateMenuCategory: async (categoryId: number, updateData: any): Promise<RestaurantMenuCategory> => {
    const response = await api.patch<RestaurantMenuCategory>(
      `/restaurant-menu-categories/${categoryId}`, 
      updateData
    );
    return response.data;
  },

  // Get menu categories for restaurant
  getMenuCategories: async (restaurantId: number): Promise<RestaurantMenuCategory[]> => {
    const response = await api.get<RestaurantMenuCategory[]>(`/restaurant-menu-categories/restaurant/${restaurantId}`);
    return response.data;
  },

  // Create menu category
  createMenuCategory: async (categoryData: any): Promise<RestaurantMenuCategory> => {
    const response = await api.post<RestaurantMenuCategory>('/restaurant-menu-categories', categoryData);
    return response.data;
  },

  // ========== ORDER MANAGEMENT ==========
  
  // Get restaurant orders
  getRestaurantOrders: async (restaurantId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}`);
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${orderId}/details`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get pending orders for restaurant
  getPendingOrders: async (restaurantId: number): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}/pending`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: number, reason?: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // ========== STATISTICS & ANALYTICS ==========
  
  // Get restaurant stats
  getRestaurantStats: async (restaurantId: number): Promise<any> => {
    try {
      const response = await api.get(`/orders/stats?restaurant_id=${restaurantId}`);
      return response.data;
    } catch (error) {
      // Return mock stats if endpoint not implemented
      return {
        totalOrders: 0,
        todayOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        revenue: 0,
        averageRating: 0,
      };
    }
  },

  // Get restaurant revenue
  getRestaurantRevenue: async (restaurantId: number, days: number = 30): Promise<any> => {
    try {
      const response = await api.get(`/orders/revenue?restaurant_id=${restaurantId}&days=${days}`);
      return response.data;
    } catch (error) {
      // Return mock data if endpoint not implemented
      return {
        dailyStats: [],
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
      };
    }
  },

  // Get payment stats
  getPaymentStats: async (restaurantId: number): Promise<any> => {
    try {
      const response = await api.get(`/orders/payment-stats?restaurant_id=${restaurantId}`);
      return response.data;
    } catch (error) {
      return {
        total: 0,
        paid: 0,
        pending: 0,
        failed: 0,
        paidPercentage: 0,
        totalRevenue: 0,
      };
    }
  },

  // ========== STAFF MANAGEMENT ==========
  
  // Get restaurant staff
  getRestaurantStaff: async (restaurantId: number): Promise<any[]> => {
    try {
      const response = await api.get(`/restaurant-staff/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Add staff member
  addStaffMember: async (staffData: any): Promise<any> => {
    const response = await api.post('/restaurant-staff', staffData);
    return response.data;
  },

  // Remove staff member
  removeStaffMember: async (staffId: number): Promise<void> => {
    await api.delete(`/restaurant-staff/${staffId}`);
  },

  // ========== UTILITIES ==========
  
  // Get available users for staff assignment
  getAvailableUsers: async (): Promise<any[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Search orders
  searchOrders: async (query: string, restaurantId?: number): Promise<Order[]> => {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      if (restaurantId) params.append('restaurant_id', restaurantId.toString());
      
      const response = await api.get<Order[]>(`/orders/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  // ========== RIDER APPROVAL SYSTEM ==========
  
  // Get rider requests for restaurant
  getRiderRequests: async (restaurantId: number): Promise<any[]> => {
    const response = await api.get(`/rider-requests/restaurant/${restaurantId}`);
    return response.data;
  },

  // Get pending rider requests
  getPendingRiderRequests: async (restaurantId: number): Promise<any[]> => {
    const response = await api.get(`/rider-requests/restaurant/${restaurantId}/pending`);
    return response.data;
  },

  // Get approved riders
  getApprovedRiders: async (restaurantId: number): Promise<any[]> => {
    const response = await api.get(`/rider-requests/restaurant/${restaurantId}/approved`);
    return response.data;
  },

  // Get available riders (not yet approved)
  getAvailableRiders: async (restaurantId: number): Promise<any[]> => {
    const response = await api.get(`/rider-requests/restaurant/${restaurantId}/available`);
    return response.data;
  },

  // Get rider statistics
  getRiderStats: async (restaurantId: number): Promise<any> => {
    const response = await api.get(`/rider-requests/restaurant/${restaurantId}/stats`);
    return response.data;
  },

  // Approve rider request
  approveRider: async (requestId: number): Promise<any> => {
    const response = await api.patch(`/rider-requests/${requestId}/approve`, {});
    return response.data;
  },

  // Reject rider request
  rejectRider: async (requestId: number, reason?: string): Promise<any> => {
    const response = await api.patch(`/rider-requests/${requestId}/reject`, { reason });
    return response.data;
  },

  // Suspend rider
  suspendRider: async (requestId: number, reason?: string): Promise<any> => {
    const response = await api.patch(`/rider-requests/${requestId}/suspend`, { reason });
    return response.data;
  },

  // Reinstate rider
  reinstateRider: async (requestId: number): Promise<any> => {
    const response = await api.patch(`/rider-requests/${requestId}/reinstate`, {});
    return response.data;
  },

  // Remove rider from restaurant
  removeRider: async (requestId: number, reason?: string): Promise<void> => {
    await api.delete(`/rider-requests/${requestId}`, { data: { reason } });
  },

  // Search riders
  searchRiders: async (restaurantId: number, query: string): Promise<any[]> => {
    const response = await api.get(`/rider-requests/search?restaurantId=${restaurantId}&query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get rider performance
  getRiderPerformance: async (requestId: number): Promise<any> => {
    const response = await api.get(`/rider-requests/${requestId}/performance`);
    return response.data;
  },
};
