// src/services/restaurantService.ts - FIXED
import api from './api';
import type { Restaurant, MenuItem } from '../types';

export const RestaurantService = {
  // Get all restaurants
  getAllRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants');
    return response.data;
  },

  // Get featured restaurants
  getFeaturedRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants/featured');
    return response.data;
  },

  // Get restaurant by ID
  getRestaurantById: async (id: number): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  // Get restaurant menu items - FIXED: You don't have this endpoint, use menu-items service
  getRestaurantMenu: async (restaurantId: number): Promise<MenuItem[]> => {
    // Get all menu items and filter by restaurant
    const response = await api.get<MenuItem[]>('/menu-items');
    return response.data.filter(item => item.restaurant_id === restaurantId);
  },

  // Get popular menu items
  getPopularItems: async (restaurantId?: number): Promise<MenuItem[]> => {
    const response = await api.get<MenuItem[]>('/menu-items/popular');
    return response.data;
  },

  // Add menu item to restaurant
  addMenuItem: async (restaurantId: number, menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.post<MenuItem>(`/restaurants/${restaurantId}/menu-items`, menuItemData);
    return response.data;
  },

  // Update menu category
  updateMenuCategory: async (categoryId: number, data: any): Promise<any> => {
    const response = await api.patch(`/restaurants/categories/${categoryId}`, data);
    return response.data;
  },

  // Get restaurant staff
  getRestaurantStaff: async (restaurantId: number): Promise<any[]> => {
    const response = await api.get(`/restaurant-staff?restaurant_id=${restaurantId}`);
    return response.data;
  },
};