import api from './api';
import type { Restaurant, MenuItem, RestaurantMenuCategory, PaginatedResponse } from '../types';

// Simple retry helper
const withRetry = async <T>(
  fn: () => Promise<T>, 
  maxRetries = 1,
  retryDelay = 1000
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry on client errors
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

export const RestaurantService = {
  // Get all restaurants
  getAllRestaurants: async (
    page = 1,
    limit = 20,
    filters?: {
      category?: string;
      rating?: number;
      isOpen?: boolean;
      search?: string;
      sortBy?: 'rating' | 'name' | 'deliveryTime';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResponse<Restaurant>> => {
    return withRetry(async () => {
      const response = await api.get<Restaurant[]>('/restaurants');
      const items = response.data || [];
      
      // Apply filters on frontend
      let filteredItems = [...items];
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(r => 
          r.name.toLowerCase().includes(searchTerm) || 
          r.address.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters?.category) {
        filteredItems = filteredItems.filter(r => 
          r.categories?.includes(filters.category!) || 
          r.cuisine?.toLowerCase() === filters.category?.toLowerCase()
        );
      }
      
      if (filters?.rating) {
        filteredItems = filteredItems.filter(r => r.rating >= (filters.rating || 0));
      }
      
      // Apply sorting
      if (filters?.sortBy) {
        filteredItems.sort((a, b) => {
          let aVal: any, bVal: any;
          
          switch (filters.sortBy) {
            case 'rating':
              aVal = a.rating || 0;
              bVal = b.rating || 0;
              break;
            case 'deliveryTime':
              aVal = parseInt(a.deliveryTime?.split('-')[0] || '30');
              bVal = parseInt(b.deliveryTime?.split('-')[0] || '30');
              break;
            case 'name':
            default:
              aVal = a.name.toLowerCase();
              bVal = b.name.toLowerCase();
          }
          
          if (filters.sortOrder === 'desc') {
            return aVal > bVal ? -1 : 1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }
      
      // Paginate
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedItems = filteredItems.slice(start, end);
      
      return {
        items: paginatedItems,
        total: filteredItems.length,
        page,
        limit,
        totalPages: Math.ceil(filteredItems.length / limit)
      };
    }, 0);
  },

  // Get featured restaurants
  getFeaturedRestaurants: async (): Promise<Restaurant[]> => {
    return withRetry(async () => {
      try {
        const response = await api.get<Restaurant[]>('/restaurants/featured');
        return response.data || [];
      } catch (error: any) {
        console.error('Error fetching featured restaurants:', error);
        // Fallback to all restaurants
        const allResponse = await api.get<Restaurant[]>('/restaurants');
        return (allResponse.data || []).slice(0, 4);
      }
    }, 0);
  },

  // Get restaurant by ID
  getRestaurantById: async (id: number): Promise<Restaurant> => {
    return withRetry(async () => {
      const response = await api.get<Restaurant>(`/restaurants/${id}`);
      return response.data;
    });
  },

  // Search restaurants
  searchRestaurants: async (query: string, limit = 20): Promise<Restaurant[]> => {
    return withRetry(async () => {
      try {
        const response = await api.get<Restaurant[]>(`/restaurants/search/${query}`);
        return response.data || [];
      } catch (error: any) {
        console.error('Error searching restaurants:', error);
        // Fallback: filter all restaurants
        const allResponse = await api.get<Restaurant[]>('/restaurants');
        const allRestaurants = allResponse.data || [];
        const searchTerm = query.toLowerCase();
        return allRestaurants
          .filter(r => 
            r.name.toLowerCase().includes(searchTerm) || 
            r.address.toLowerCase().includes(searchTerm)
          )
          .slice(0, limit);
      }
    }, 0);
  },

  // Get restaurant menu items
  getRestaurantMenu: async (restaurantId: number, categoryId?: number): Promise<MenuItem[]> => {
    return withRetry(async () => {
      const response = await api.get<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
      let items = response.data || [];
      
      // Filter by category on frontend if needed
      if (categoryId) {
        items = items.filter(item => 
          item.category?.category_id === categoryId || 
          item.category_id === categoryId
        );
      }
      
      return items;
    });
  },

  // Get popular menu items
  getPopularItems: async (restaurantId?: number, limit = 8): Promise<MenuItem[]> => {
    return withRetry(async () => {
      try {
        const params: any = { limit };
        if (restaurantId) params.restaurant_id = restaurantId;
        
        const response = await api.get<MenuItem[]>('/menu-items/popular', { params });
        return response.data || [];
      } catch (error: any) {
        console.error('Error fetching popular items:', error);
        return [];
      }
    }, 0);
  },

  // Get menu item by ID
  getMenuItemById: async (itemId: number): Promise<MenuItem> => {
    return withRetry(async () => {
      const response = await api.get<MenuItem>(`/menu-items/${itemId}`);
      return response.data;
    });
  },

  // Get all menu items
  getAllMenuItems: async (
    page = 1,
    limit = 50,
    filters?: { 
      restaurantId?: number; 
      categoryId?: number; 
      minPrice?: number; 
      maxPrice?: number; 
      isAvailable?: boolean; 
      search?: string 
    }
  ): Promise<PaginatedResponse<MenuItem>> => {
    return withRetry(async () => {
      const response = await api.get<MenuItem[]>('/menu-items');
      let items = response.data || [];
      
      // Apply filters
      if (filters?.restaurantId) {
        items = items.filter(item => item.restaurant?.restaurant_id === filters.restaurantId);
      }
      
      if (filters?.categoryId) {
        items = items.filter(item => 
          item.category?.category_id === filters.categoryId || 
          item.category_id === filters.categoryId
        );
      }
      
      if (filters?.minPrice !== undefined) {
        items = items.filter(item => item.price >= (filters.minPrice || 0));
      }
      
      if (filters?.maxPrice !== undefined) {
        items = items.filter(item => item.price <= (filters.maxPrice || Infinity));
      }
      
      if (filters?.isAvailable !== undefined) {
        items = items.filter(item => item.is_available === filters.isAvailable);
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchTerm) || 
          item.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Paginate
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
    });
  },

  // Get restaurant categories
  getRestaurantCategories: async (restaurantId: number): Promise<RestaurantMenuCategory[]> => {
    return withRetry(async () => {
      try {
        const response = await api.get<RestaurantMenuCategory[]>('/restaurant-menu-categories');
        const allCategories = response.data || [];
        // Filter by restaurant on frontend
        return allCategories.filter(cat => cat.restaurant?.restaurant_id === restaurantId);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        return [];
      }
    }, 0);
  },

  // Get all categories
  getAllCategories: async (): Promise<string[]> => {
    return withRetry(async () => {
      try {
        const response = await api.get<RestaurantMenuCategory[]>('/restaurant-menu-categories');
        const categories = response.data || [];
        return [...new Set(categories.map(cat => cat.name))];
      } catch (error: any) {
        console.error('Error fetching all categories:', error);
        return ['Burgers', 'Pizza', 'Coffee', 'Desserts', 'Chinese', 'Italian'];
      }
    }, 0);
  },

  // Get restaurant reviews/ratings
  getRestaurantReviews: async (restaurantId: number, page = 1, limit = 10): Promise<PaginatedResponse<any>> => {
    return withRetry(async () => {
      try {
        const response = await api.get<any[]>(`/restaurants/${restaurantId}/ratings`);
        const items = response.data || [];
        
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
      } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return { items: [], total: 0, page, limit, totalPages: 0 };
      }
    }, 0);
  }
};