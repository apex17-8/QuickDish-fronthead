// src/services/customerService.ts
import api from './api';
import type { Customer } from '../types';

export const CustomerService = {
  // Get all customers
  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/customers');
    return response.data;
  },

  // Get customer by ID
  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  // Get customer by user ID
  getCustomerByUserId: async (userId: number): Promise<Customer> => {
    // Get all customers and find by user_id
    const customers = await CustomerService.getAllCustomers();
    const customer = customers.find(c => c.user?.user_id === userId);
    if (!customer) throw new Error(`Customer with user ID ${userId} not found`);
    return customer;
  },

  // Update customer
  updateCustomer: async (id: number, data: any): Promise<Customer> => {
    const response = await api.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  // Update loyalty points
  updateLoyaltyPoints: async (id: number, points: number): Promise<Customer> => {
    const response = await api.patch<Customer>(`/customers/${id}/update-points`, { points });
    return response.data;
  },

  // Set default address
  setDefaultAddress: async (id: number, address: string): Promise<Customer> => {
    const response = await api.patch<Customer>(`/customers/${id}/set-default-address`, { address });
    return response.data;
  },
};