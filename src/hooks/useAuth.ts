// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import { CustomerService } from '../services/customerService';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Initialize WebSocket on auth
  useEffect(() => {
    if (user) {
      import('../services/websocketService').then(({ webSocketService }) => {
        webSocketService.connect();
      });
    }
  }, [user]);

  const redirectBasedOnRole = (role: string) => {
    console.log('Redirecting user with role:', role);
    
    switch(role) {
      case 'restaurant_owner':
      case 'manager':
        window.location.href = '/dashboard/restaurant';
        break;
        
      case 'rider':
        window.location.href = '/dashboard/rider';
        break;
        
      case 'customer_care':
        window.location.href = '/dashboard/admin';
        break;
        
      case 'super_admin':
        window.location.href = '/dashboard/admin';
        break;
        
      case 'customer':
      default:
        window.location.href = '/dashboard';
        break;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      const { accessToken, refreshToken, user: userData } = response;
      
      // Store tokens and user data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      
      // Set user in state
      setUser(userData);
      
      // Load customer data if user is a customer
      if (userData.role === 'customer') {
        try {
          const customerData = await CustomerService.getCustomerByUserId(userData.user_id);
          setCustomer(customerData);
          localStorage.setItem('customer', JSON.stringify(customerData));
        } catch (error) {
          console.log('Customer data not found, will create on first order');
        }
      }
      
      toast.success('Logged in successfully!');
      
      // Redirect based on role
      setTimeout(() => redirectBasedOnRole(userData.role), 100);
      
      return { success: true, user: userData };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any) => {
    setLoading(true);
    try {
      const response = await authService.signup(userData);
      
      const { accessToken, refreshToken, user: newUser } = response;
      
      // Store tokens and user data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('userRole', newUser.role);
      
      // Set user in state
      setUser(newUser);
      
      // Create customer record if role is customer
      if (newUser.role === 'customer') {
        try {
          // This endpoint will be created in your backend
          await api.post(`/customers/create/${newUser.user_id}`);
          const customerData = await CustomerService.getCustomerByUserId(newUser.user_id);
          setCustomer(customerData);
          localStorage.setItem('customer', JSON.stringify(customerData));
        } catch (error) {
          console.log('Customer creation failed:', error);
        }
      }
      
      toast.success('Account created successfully!');
      
      // Redirect based on role
      setTimeout(() => redirectBasedOnRole(newUser.role), 100);
      
      return { success: true, user: newUser };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('customer');
      
      // Disconnect WebSocket
      import('../services/websocketService').then(({ webSocketService }) => {
        webSocketService.disconnect();
      });
      
      setUser(null);
      setCustomer(null);
      
      // Redirect to login
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const customerStr = localStorage.getItem('customer');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        // Load customer data if exists
        if (customerStr) {
          const customerData = JSON.parse(customerStr);
          setCustomer(customerData);
        } else if (userData.role === 'customer') {
          try {
            const customerData = await CustomerService.getCustomerByUserId(userData.user_id);
            setCustomer(customerData);
            localStorage.setItem('customer', JSON.stringify(customerData));
          } catch (error) {
            console.log('Customer data not available');
          }
        }
        
        setAuthChecked(true);
        return userData;
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      setAuthChecked(true);
    }
    return null;
  };

  const refreshUserData = async () => {
    if (user) {
      try {
        const freshUser = await authService.getCurrentUser();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        
        if (freshUser.role === 'customer') {
          try {
            const customerData = await CustomerService.getCustomerByUserId(freshUser.user_id);
            setCustomer(customerData);
            localStorage.setItem('customer', JSON.stringify(customerData));
          } catch (error) {
            console.log('Failed to refresh customer data');
          }
        }
        
        return freshUser;
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    customer,
    loading,
    authChecked,
    login,
    signup,
    logout,
    checkAuth,
    refreshUserData,
    isAuthenticated: !!localStorage.getItem('token'),
    hasRole: (roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    isCustomer: user?.role === 'customer',
    isRider: user?.role === 'rider',
    isRestaurantOwner: user?.role === 'restaurant_owner',
    isManager: user?.role === 'manager',
    isCustomerCare: user?.role === 'customer_care',
    isAdmin: user?.role === 'super_admin',
  };
};