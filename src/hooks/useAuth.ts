import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { CustomerService } from '../services/customerService';
import type { User, Customer, SignupRequest, UserRole } from '../types';

interface UserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
  address?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Initialize WebSocket when user is set - WITH ERROR HANDLING
  useEffect(() => {
    if (user) {
      // Try to import WebSocket, but don't crash if it fails
      import('../services/socketService')
        .then(({ webSocketService }) => {
          if (webSocketService && typeof webSocketService.connect === 'function') {
            webSocketService.connect();
          }
        })
        .catch((error) => {
          console.warn('WebSocket service not available:', error);
          // Don't throw error, just log warning
        });
    }
  }, [user]);

  const redirectBasedOnRole = useCallback((role: UserRole) => {
    switch (role) {
      case 'restaurant_owner': 
        navigate('/dashboard/restaurant'); 
        break;
      case 'manager': 
        navigate('/dashboard/restaurant'); 
        break;
      case 'rider': 
        navigate('/dashboard/rider'); 
        break;
      case 'customer_care': 
        navigate('/dashboard/customer-care'); 
        break;
      case 'super_admin': 
        navigate('/dashboard/admin'); 
        break;
      case 'customer': 
        navigate('/dashboard/customer'); 
        break;
      default: 
        navigate('/dashboard'); 
        break;
    }
  }, [navigate]);

  const handleCustomerData = useCallback(async (userData: User) => {
    if (userData.role === 'customer') {
      try {
        const customerData = await CustomerService.getCustomerByUserId(userData.user_id);
        setCustomer(customerData);
        localStorage.setItem('customer', JSON.stringify(customerData));
      } catch (err: any) {
        console.log('Customer data not available yet, will create on first order.');
        // Don't throw error, just log
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      
      // Store token and user
      if (userData.accessToken) {
        localStorage.setItem('token', userData.accessToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      
      await handleCustomerData(userData);
      toast.success('Logged in successfully!');
      redirectBasedOnRole(userData.role);
      return { success: true, user: userData };
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: UserData) => {
    setLoading(true);
    try {
      const signupRequest: SignupRequest = { ...userData };
      const newUser = await authService.signup(signupRequest);
      setUser(newUser);
      
      if (newUser.accessToken) {
        localStorage.setItem('token', newUser.accessToken);
      }
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('userRole', newUser.role);
      
      await handleCustomerData(newUser);
      toast.success('Account created successfully!');
      redirectBasedOnRole(newUser.role);
      return { success: true, user: newUser };
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || 'Signup failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
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
      localStorage.clear();
      setUser(null);
      setCustomer(null);
      
      // Try to disconnect WebSocket if available
      import('../services/socketService')
        .then(({ webSocketService }) => {
          if (webSocketService && typeof webSocketService.disconnect === 'function') {
            webSocketService.disconnect();
          }
        })
        .catch(() => {
          // Ignore if WebSocket not available
        });
        
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const checkAuth = useCallback(async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) return null;
      
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      
      const storedCustomer = localStorage.getItem('customer');
      if (storedCustomer) {
        setCustomer(JSON.parse(storedCustomer));
      } else if (parsedUser.role === 'customer') {
        await handleCustomerData(parsedUser);
      }
      
      return parsedUser;
    } catch (err) {
      console.error('Failed to check auth:', err);
      // Don't auto-logout on error
      return null;
    } finally {
      setAuthChecked(true);
    }
  }, [handleCustomerData]);

  const refreshUserData = useCallback(async (): Promise<User | null> => {
    if (!user) return null;
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
      await handleCustomerData(freshUser);
      return freshUser;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      return null;
    }
  }, [user, handleCustomerData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    customer,
    loading,
    authChecked,
    login,
    signup,
    logout,
    refreshUserData,
    isAuthenticated: !!user,
    hasRole: (roles: UserRole[]) => !!user && roles.includes(user.role),
    isCustomer: user?.role === 'customer',
    isRider: user?.role === 'rider',
    isRestaurantOwner: user?.role === 'restaurant_owner',
    isManager: user?.role === 'manager',
    isCustomerCare: user?.role === 'customer_care',
    isAdmin: user?.role === 'super_admin',
  };
};

export default useAuth;