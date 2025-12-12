import api from './api';
import type { Customer } from '../types';

export const CustomerService = {
  // Get current customer profile (authenticated user)
  getCurrentCustomer: async (): Promise<Customer> => {
    try {
      const response = await api.get<Customer>('/customers/profile/me');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current customer:', error);
      
      // Fallback: create customer from user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          customer_id: user.user_id,
          user: user,
          loyalty_points: 0,
          default_address: '',
          orders: []
        };
      }
      throw new Error('No user found');
    }
  },

  // Get customer by user ID
  getCustomerByUserId: async (userId: number): Promise<Customer> => {
    try {
      // Get current profile (uses authenticated user)
      return await CustomerService.getCurrentCustomer();
    } catch (error: any) {
      console.log('Customer profile not found, creating fallback:', error.message);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          customer_id: userId,
          user: user,
          loyalty_points: 0,
          default_address: '',
          orders: []
        };
      }
      throw new Error(`Customer with user ID ${userId} not found`);
    }
  },

  // Create customer profile (for signup)
  createCustomerProfile: async (data: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await api.post<Customer>('/customers', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      throw new Error(error.response?.data?.message || 'Failed to create customer profile');
    }
  },

  // Update current customer
  updateCurrentCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await api.patch<Customer>('/customers/profile/me', data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      throw new Error(error.response?.data?.message || 'Failed to update customer profile');
    }
  },

  // Get customer orders
  getCustomerOrders: async (): Promise<any[]> => {
    try {
      const response = await api.get<any[]>('/customers/me/orders');
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },

  // Get customer stats
  getCustomerStats: async (): Promise<any> => {
    try {
      const response = await api.get<any>('/customers/me/stats');
      return response.data || {
        totalOrders: 0,
        loyaltyPoints: 0,
        defaultAddress: '',
        memberSince: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching customer stats:', error);
      return {
        totalOrders: 0,
        loyaltyPoints: 0,
        defaultAddress: '',
        memberSince: new Date().toISOString()
      };
    }
  },

  // Update loyalty points
  updateLoyaltyPoints: async (points: number): Promise<Customer> => {
    try {
      const customer = await CustomerService.getCurrentCustomer();
      const response = await api.patch<Customer>(`/customers/${customer.customer_id}/update-points`, { points });
      return response.data;
    } catch (error: any) {
      console.error('Error updating loyalty points:', error);
      throw new Error(error.response?.data?.message || 'Failed to update loyalty points');
    }
  },

  // Set default address - FIXED: Remove customerId parameter
  setDefaultAddress: async (address: string): Promise<Customer> => {
    try {
      const customer = await CustomerService.getCurrentCustomer();
      const response = await api.patch<Customer>(`/customers/${customer.customer_id}/set-default-address`, { address });
      return response.data;
    } catch (error: any) {
      console.error('Error setting default address:', error);
      
      // If customer doesn't exist yet, update local customer object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const fallbackCustomer = {
          customer_id: user.user_id,
          user: user,
          loyalty_points: 0,
          default_address: address,
          orders: []
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('customer', JSON.stringify(fallbackCustomer));
        return fallbackCustomer;
      }
      
      throw new Error(error.response?.data?.message || 'Failed to set default address');
    }
  }
};