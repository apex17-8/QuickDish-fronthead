import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  selectIsAuthenticated, 
  selectUserRole,
  logout as logoutAction,
  setLoading as setAuthLoading,
  setError as setAuthError 
} from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { UserRole } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  const login = async (email: string, password: string) => {
    try {
      dispatch(setAuthLoading(true));
      const response = await authService.login({ email, password });
      // dispatch(setCredentials(response));
      dispatch(setAuthLoading(false));
      return { success: true, data: response };
    } catch (error: any) {
      dispatch(setAuthError(error.message || 'Login failed'));
      dispatch(setAuthLoading(false));
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData: any) => {
    try {
      dispatch(setAuthLoading(true));
      const response = await authService.signup(userData);
      // dispatch(setCredentials(response));
      dispatch(setAuthLoading(false));
      return { success: true, data: response };
    } catch (error: any) {
      dispatch(setAuthError(error.message || 'Signup failed'));
      dispatch(setAuthLoading(false));
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      try {
        dispatch(setAuthLoading(true));
        const user = await authService.getCurrentUser();
        dispatch(setCredential({ user, token, refreshToken: localStorage.getItem('refreshToken') || '' }));
        dispatch(setAuthLoading(false));
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return userRole ? roles.includes(userRole) : false;
  };

  const isCustomer = hasRole([UserRole.Customer]);
  const isRider = hasRole([UserRole.Rider]);
  const isRestaurantOwner = hasRole([UserRole.RestaurantOwner]);
  const isManager = hasRole([UserRole.Manager]);
  const isAdmin = hasRole([UserRole.SuperAdmin, UserRole.CustomerCare]);
  const isStaff = hasRole([UserRole.Manager, UserRole.CustomerCare, UserRole.Rider]);

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    userRole,
    login,
    signup,
    logout,
    checkAuth,
    hasRole,
    isCustomer,
    isRider,
    isRestaurantOwner,
    isManager,
    isAdmin,
    isStaff,
  };
};