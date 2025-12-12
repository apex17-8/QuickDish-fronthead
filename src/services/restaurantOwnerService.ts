import api from './api';
import type {
  Restaurant,
  MenuItem,
  RestaurantMenuCategory,
  Order,
  CreateRestaurantData,
  UpdateRestaurantData,
  CreateMenuItemData,
  UpdateMenuItemData,
  CreateMenuCategoryData,
  UpdateMenuCategoryData,
  RestaurantStats,
  RevenueStats,
  PaymentStats,
  PaginatedResponse
} from '../types';

export const RestaurantOwnerService = {
  // ========== RESTAURANT MANAGEMENT ==========
  
  // Get restaurants owned by or managed by current user
  getMyRestaurants: async (): Promise<Restaurant[]> => {
    try {
      const response = await api.get<Restaurant[]>('/restaurants/owner/my-restaurants');
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      // Fallback for development - return empty array
      if (error.response?.status === 404) {
        console.warn('Endpoint /restaurants/owner/my-restaurants not found, returning empty array');
        return [];
      }
      throw new Error('Failed to fetch restaurants');
    }
  },

  // Create new restaurant
  createRestaurant: async (restaurantData: CreateRestaurantData): Promise<Restaurant> => {
    try {
      const response = await api.post<Restaurant>('/restaurants', restaurantData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      throw new Error(error.response?.data?.message || 'Failed to create restaurant');
    }
  },

  // Update restaurant
  updateRestaurant: async (restaurantId: number, updateData: UpdateRestaurantData): Promise<Restaurant> => {
    try {
      const response = await api.patch<Restaurant>(`/restaurants/${restaurantId}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      throw new Error(error.response?.data?.message || 'Failed to update restaurant');
    }
  },

  // Delete restaurant
  deleteRestaurant: async (restaurantId: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/restaurants/${restaurantId}`);
      return response.data || { message: 'Restaurant deleted successfully' };
    } catch (error: any) {
      console.error('Error deleting restaurant:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete restaurant');
    }
  },

  // Get restaurant details
  getRestaurantById: async (restaurantId: number): Promise<Restaurant> => {
    try {
      const response = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      if (error.response?.status === 404) {
        throw new Error('Restaurant not found');
      }
      throw new Error('Failed to fetch restaurant details');
    }
  },

  // ========== MENU MANAGEMENT ==========
  
  // Add menu item
  addMenuItem: async (restaurantId: number, menuItemData: CreateMenuItemData): Promise<MenuItem> => {
    try {
      const response = await api.post<MenuItem>(
        `/restaurants/${restaurantId}/menu-items`, 
        menuItemData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      throw new Error(error.response?.data?.message || 'Failed to add menu item');
    }
  },

  // Update menu item
  updateMenuItem: async (menuItemId: number, updateData: UpdateMenuItemData): Promise<MenuItem> => {
    try {
      const response = await api.patch<MenuItem>(`/menu-items/${menuItemId}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      throw new Error(error.response?.data?.message || 'Failed to update menu item');
    }
  },

  // Delete menu item
  deleteMenuItem: async (menuItemId: number): Promise<void> => {
    try {
      await api.delete(`/menu-items/${menuItemId}`);
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete menu item');
    }
  },

  // Get popular menu items
  getPopularMenuItems: async (restaurantId?: number): Promise<MenuItem[]> => {
    try {
      const params = restaurantId ? { restaurant_id: restaurantId } : {};
      const response = await api.get<MenuItem[]>('/menu-items/popular', { params });
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching popular items:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Get menu categories for restaurant
  getMenuCategories: async (restaurantId: number): Promise<RestaurantMenuCategory[]> => {
    try {
      const response = await api.get<RestaurantMenuCategory[]>('/restaurant-menu-categories');
      const allCategories = response.data || [];
      // Filter by restaurantId on frontend since backend doesn't support filtering
      return allCategories.filter(cat => cat.restaurant?.restaurant_id === restaurantId);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return []; // Return empty array for development
    }
  },

  // Create menu category
  createMenuCategory: async (categoryData: CreateMenuCategoryData): Promise<RestaurantMenuCategory> => {
    try {
      const response = await api.post<RestaurantMenuCategory>('/restaurant-menu-categories', categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      throw new Error(error.response?.data?.message || 'Failed to create menu category');
    }
  },

  // Update menu category
  updateMenuCategory: async (categoryId: number, updateData: UpdateMenuCategoryData): Promise<RestaurantMenuCategory> => {
    try {
      const response = await api.patch<RestaurantMenuCategory>(
        `/restaurant-menu-categories/${categoryId}`, 
        updateData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      throw new Error(error.response?.data?.message || 'Failed to update menu category');
    }
  },

  // ========== ORDER MANAGEMENT ==========
  
  // Get restaurant orders
  getRestaurantOrders: async (restaurantId: number, status?: string): Promise<Order[]> => {
    try {
      const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}`);
      const orders = response.data || [];
      
      // Filter by status on frontend if provided
      if (status) {
        return orders.filter(order => order.status === status);
      }
      return orders;
    } catch (error: any) {
      console.error('Error fetching restaurant orders:', error);
      return []; // Return empty array for development
    }
  },

  // Get order details
  getOrderDetails: async (orderId: number): Promise<Order> => {
    try {
      const response = await api.get<Order>(`/orders/${orderId}/details`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      if (error.response?.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error('Failed to fetch order details');
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    try {
      const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  // Get pending orders for restaurant
  getPendingOrders: async (restaurantId: number): Promise<Order[]> => {
    try {
      const response = await api.get<Order[]>(`/orders/restaurant/${restaurantId}/pending`);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching pending orders:', error);
      return []; // Return empty array for development
    }
  },

  // Cancel order
  cancelOrder: async (orderId: number, reason?: string): Promise<Order> => {
    try {
      const response = await api.patch<Order>(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Error canceling order:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },

  // ========== STATISTICS & ANALYTICS ==========
  
  // Get restaurant stats
  getRestaurantStats: async (restaurantId: number): Promise<RestaurantStats> => {
    try {
      const response = await api.get<RestaurantStats>(`/orders/stats?restaurant_id=${restaurantId}`);
      return response.data || {
        totalOrders: 0,
        todayOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        deliveredOrders: 0,
        revenue: 0,
        averageRating: 0,
        popularItems: [],
      };
    } catch (error: any) {
      console.warn('Stats endpoint not available, returning default stats');
      return {
        totalOrders: 0,
        todayOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        deliveredOrders: 0,
        revenue: 0,
        averageRating: 0,
        popularItems: [],
      };
    }
  },

  // Get restaurant revenue
  getRestaurantRevenue: async (restaurantId: number, days: number = 30): Promise<RevenueStats> => {
    try {
      const response = await api.get<RevenueStats>(`/orders/revenue?restaurant_id=${restaurantId}&days=${days}`);
      return response.data || {
        dailyStats: [],
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueChangePercentage: 0,
      };
    } catch (error: any) {
      console.warn('Revenue endpoint not available, returning default data');
      return {
        dailyStats: [],
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueChangePercentage: 0,
      };
    }
  },

  // Get payment stats
  getPaymentStats: async (restaurantId: number): Promise<PaymentStats> => {
    try {
      const response = await api.get<PaymentStats>(`/orders/payment-stats?restaurant_id=${restaurantId}`);
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
    } catch (error: any) {
      console.warn('Payment stats endpoint not available, returning default data');
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

  // ========== SEARCH ==========
  
  // Search orders
  searchOrders: async (query: string, restaurantId?: number): Promise<Order[]> => {
    try {
      const allOrders = await RestaurantOwnerService.getRestaurantOrders(restaurantId || 0);
      return allOrders.filter(order => 
        order.order_id.toString().includes(query) ||
        order.customer?.user?.name?.toLowerCase().includes(query.toLowerCase()) ||
        order.status.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  },

  // ========== ADDITIONAL METHODS ==========
  
  // Upload restaurant logo
  uploadLogo: async (restaurantId: number, file: File): Promise<{ logo_url: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post<{ logo_url: string }>(
        `/restaurants/${restaurantId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload logo');
    }
  },

  // Get restaurant reviews
  getRestaurantReviews: async (restaurantId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<any>> => {
    try {
      const response = await api.get<any[]>(`/restaurants/${restaurantId}/ratings`, {
        params: { page, limit }
      });
      
      const items = response.data || [];
      return {
        items,
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit)
      };
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  // Update restaurant status
  updateRestaurantStatus: async (restaurantId: number, isActive: boolean): Promise<Restaurant> => {
    try {
      const response = await api.patch<Restaurant>(`/restaurants/${restaurantId}/status`, { 
        is_active: isActive 
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating restaurant status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update restaurant status');
    }
  },

  // Get restaurant statistics (from backend endpoint)
  getRestaurantStatistics: async (restaurantId: number, period: string = 'month'): Promise<any> => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/statistics`, {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      console.warn('Statistics endpoint not available, returning fallback');
      return {
        period,
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        customerCount: 0
      };
    }
  }
};