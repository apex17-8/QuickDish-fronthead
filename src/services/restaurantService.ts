import api from './api';
import type{ Restaurant, MenuItem, RestaurantMenuCategory } from '../types';

export const RestaurantService = {
  // Get all restaurants
  getAllRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants');
    return response.data;
  },

  // Get restaurant by ID
  getRestaurantById: async (id: number): Promise<Restaurant> => {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  },

  // Get restaurant menu
  getRestaurantMenu: async (restaurantId: number): Promise<MenuItem[]> => {
    const response = await api.get<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
    return response.data;
  },

  // Get restaurant categories
  getRestaurantCategories: async (restaurantId: number): Promise<RestaurantMenuCategory[]> => {
    const response = await api.get<RestaurantMenuCategory[]>(`/restaurant-menu-categories/restaurant/${restaurantId}`);
    return response.data;
  },

  // Search restaurants
  searchRestaurants: async (query: string): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>(`/restaurants/search?q=${query}`);
    return response.data;
  },

  // Get featured restaurants
  getFeaturedRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants/featured');
    return response.data;
  },

  // Get popular menu items
  getPopularItems: async (restaurantId?: number): Promise<MenuItem[]> => {
    const url = restaurantId 
      ? `/menu-items/popular?restaurantId=${restaurantId}`
      : '/menu-items/popular';
    const response = await api.get<MenuItem[]>(url);
    return response.data;
  },

  // Get menu item by ID
  getMenuItemById: async (id: number): Promise<MenuItem> => {
    const response = await api.get<MenuItem>(`/menu-items/${id}`);
    return response.data;
  },

  // Get menu items by category
  getMenuItemsByCategory: async (categoryId: number): Promise<MenuItem[]> => {
    const response = await api.get<MenuItem[]>(`/menu-items/category/${categoryId}`);
    return response.data;
  },

  // Create restaurant (admin/owner only)
  createRestaurant: async (restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.post<Restaurant>('/restaurants', restaurantData);
    return response.data;
  },

  // Update restaurant
  updateRestaurant: async (id: number, restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.patch<Restaurant>(`/restaurants/${id}`, restaurantData);
    return response.data;
  },

  // Delete restaurant
  deleteRestaurant: async (id: number): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },

  // Add menu item to restaurant
  addMenuItem: async (restaurantId: number, menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.post<MenuItem>(`/restaurants/${restaurantId}/menu-items`, menuItemData);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.patch<MenuItem>(`/menu-items/${id}`, menuItemData);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (id: number): Promise<void> => {
    await api.delete(`/menu-items/${id}`);
  },

  // Add restaurant category
  addRestaurantCategory: async (categoryData: Partial<RestaurantMenuCategory>): Promise<RestaurantMenuCategory> => {
    const response = await api.post<RestaurantMenuCategory>('/restaurant-menu-categories', categoryData);
    return response.data;
  },

  // Update restaurant category
  updateRestaurantCategory: async (id: number, categoryData: Partial<RestaurantMenuCategory>): Promise<RestaurantMenuCategory> => {
    const response = await api.patch<RestaurantMenuCategory>(`/restaurant-menu-categories/${id}`, categoryData);
    return response.data;
  },

  // Get restaurant statistics
  getRestaurantStats: async (restaurantId: number): Promise<any> => {
    const response = await api.get(`/restaurants/${restaurantId}/stats`);
    return response.data;
  },

  // Get restaurant reviews
  getRestaurantReviews: async (restaurantId: number): Promise<any[]> => {
    const response = await api.get(`/restaurants/${restaurantId}/reviews`);
    return response.data;
  },

  // Submit restaurant review
  submitRestaurantReview: async (restaurantId: number, rating: number, comment: string): Promise<void> => {
    await api.post(`/restaurants/${restaurantId}/reviews`, { rating, comment });
  },

  // Toggle restaurant status (open/closed)
  toggleRestaurantStatus: async (restaurantId: number, isOpen: boolean): Promise<Restaurant> => {
    const response = await api.patch<Restaurant>(`/restaurants/${restaurantId}/status`, { isOpen });
    return response.data;
  },

  // Get restaurant staff
  getRestaurantStaff: async (restaurantId: number): Promise<any[]> => {
    const response = await api.get(`/restaurant-staff/restaurant/${restaurantId}`);
    return response.data;
  },

  // Add staff to restaurant
  addRestaurantStaff: async (staffData: any): Promise<any> => {
    const response = await api.post('/restaurant-staff', staffData);
    return response.data;
  },
};