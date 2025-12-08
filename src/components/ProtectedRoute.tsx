// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  // Check if user is authenticated
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // Check if user has required role
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on actual role
      switch(user.role) {
        case 'restaurant_owner':
          return <Navigate to="/restaurant-owner/dashboard" replace />;
        case 'rider':
          return <Navigate to="/rider/dashboard" replace />;
        case 'manager':
          return <Navigate to="/manager/dashboard" replace />;
        case 'customer_care':
          return <Navigate to="/customer-care/dashboard" replace />;
        case 'super_admin':
          return <Navigate to="/admin/dashboard" replace />;
        case 'customer':
          return <Navigate to="/customer/dashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
    
    return <>{children}</>;
    
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;