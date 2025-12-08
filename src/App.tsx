// src/App.tsx - FIXED VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Public Pages
import { HomePage } from './pages/Homepage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { RestaurantPage } from './pages/RestaurantPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersPage } from './pages/OrdersPage';

// Dashboard Pages
import { CustomerDashboard } from './pages/dashboards/CustomerDashboard';
import { RiderDashboard } from './pages/dashboards/RiderDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ManagerDashboard } from './pages/dashboards/ManagerDashboard';
import { CustomerCareDashboard } from './pages/dashboards/CustomerCareDashboard';

// Restaurant Owner Pages
import { RestaurantOwnerDashboard } from './pages/dashboards/RestaurantOwnerDashboard';
import { CreateRestaurantPage } from './pages/dashboards/CreateRestaurantPage';
import { EditRestaurantPage } from './pages/dashboards/EditRestaurantPage';
import { RestaurantMenuPage } from './pages/dashboards/RestaurantMenuPage';
import { RestaurantOrdersPage } from './pages/dashboards/RestaurantOrdersPage';
// import { RestaurantStaffPage } from './pages/dashboards/RestaurantStaffPage';
import { RestaurantAnalyticsPage } from './pages/dashboards/RestaurantAnalyticsPage';
// import { RiderManagementPage } from './pages/dashboards/RiderManagementPage';
import { RiderEarningsPage } from './pages/dashboards/RiderEarningsPage';
import { RiderOrderDetailsPage } from './pages/dashboards/RiderOrderDetailsPage';
// import { RiderPerformancePage } from './pages/dashboards/RiderPerformancePage';
// import { RiderSchedulePage } from './pages/dashboards/RiderSchedulePage';

// Role-Based Redirect Component
const RoleBasedRedirect = () => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  let redirectPath = '/login';

  try {
    const user = JSON.parse(userStr);

    switch (user.role) {
      case 'restaurant_owner':
      case 'manager':
        redirectPath = '/dashboard/restaurant';
        break;
      case 'rider':
        redirectPath = '/dashboard/rider';
        break;
      case 'super_admin':
      case 'customer_care':
        redirectPath = '/dashboard/admin';
        break;
      case 'customer':
      default:
        redirectPath = '/dashboard';
        break;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    redirectPath = '/login';
  }

  return <Navigate to={redirectPath} replace />;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles = [],
}) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  let redirectPath = '/dashboard';
  let isAuthorized = true;

  try {
    const user = JSON.parse(userStr);

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      isAuthorized = false;
      // Redirect to appropriate dashboard based on user's actual role
      switch (user.role) {
        case 'restaurant_owner':
        case 'manager':
          redirectPath = '/dashboard/restaurant';
          break;
        case 'rider':
          redirectPath = '/dashboard/rider';
          break;
        case 'super_admin':
        case 'customer_care':
          redirectPath = '/dashboard/admin';
          break;
        case 'customer':
        default:
          redirectPath = '/dashboard';
          break;
      }
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    isAuthorized = false;
    redirectPath = '/login';
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/restaurants" element={<RestaurantPage />} />
          <Route path="/restaurants/:id" element={<RestaurantPage />} />
          <Route path="/track-order/:id" element={<OrderTrackingPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          
          {/* Auto-redirect based on role */}
          <Route path="/dashboard/redirect" element={<RoleBasedRedirect />} />
          
          {/* Protected Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* ========== CUSTOMER DASHBOARD ========== */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          
          {/* ========== RIDER DASHBOARD ========== */}
          <Route path="/dashboard/rider" element={
            <ProtectedRoute allowedRoles={['rider']}>
              <RiderDashboard />
            </ProtectedRoute>
          } />
          
          {/* ========== RESTAURANT OWNER DASHBOARD ========== */}
          
          {/* Main Restaurant Owner Dashboard - Shows all restaurants */}
          <Route path="/dashboard/restaurant" element={
            <ProtectedRoute allowedRoles={['restaurant_owner', 'manager']}>
              <RestaurantOwnerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Create New Restaurant (Owner Only) */}
          <Route path="/dashboard/restaurant/new" element={
            <ProtectedRoute allowedRoles={['restaurant_owner']}>
              <CreateRestaurantPage />
            </ProtectedRoute>
          } />
          
          {/* Single Restaurant Management Page */}
          <Route path="/dashboard/restaurant/:id" element={
            <ProtectedRoute allowedRoles={['restaurant_owner', 'manager']}>
              <RestaurantPage />
            </ProtectedRoute>
          } />
          
          {/* Edit Restaurant (Owner Only) */}
          <Route path="/dashboard/restaurant/:id/edit" element={
            <ProtectedRoute allowedRoles={['restaurant_owner']}>
              <EditRestaurantPage />
            </ProtectedRoute>
          } />
          
          {/* Restaurant Menu Management */}
          <Route path="/dashboard/restaurant/:id/menu" element={
            <ProtectedRoute allowedRoles={['restaurant_owner', 'manager']}>
              <RestaurantMenuPage />
            </ProtectedRoute>
          } />
          
          {/* Restaurant Orders Management */}
          <Route path="/dashboard/restaurant/:id/orders" element={
            <ProtectedRoute allowedRoles={['restaurant_owner', 'manager']}>
              <RestaurantOrdersPage />
            </ProtectedRoute>
          } />
          
          {/* Restaurant Staff Management - COMMENTED OUT SINCE IMPORT IS COMMENTED */}
          {/* <Route path="/dashboard/restaurant/:id/staff" element={
            <ProtectedRoute allowedRoles={['restaurant_owner', 'manager']}>
              <RestaurantStaffPage />
            </ProtectedRoute>
          } /> */}
          
          {/* Restaurant Analytics */}
          <Route path="/dashboard/restaurant/:id/analytics" element={
            <ProtectedRoute allowedRoles={['restaurant_owner', 'manager']}>
              <RestaurantAnalyticsPage />
            </ProtectedRoute>
          } />
          
          {/* ========== ADMIN DASHBOARD ========== */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['super_admin', 'customer_care']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* ========== OTHER ROLE-SPECIFIC DASHBOARDS ========== */}
          <Route path="/dashboard/manager" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/rider/earnings" element={
            <ProtectedRoute allowedRoles={['rider']}>
              <RiderEarningsPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/rider/orders/:id" element={
            <ProtectedRoute allowedRoles={['rider']}>
              <RiderOrderDetailsPage />
            </ProtectedRoute>
          } />

          {/* Commented out routes since imports are commented */}
          {/* <Route path="/dashboard/rider/performance" element={
            <ProtectedRoute allowedRoles={['rider']}>
              <RiderPerformancePage />
            </ProtectedRoute>
          } /> */}

          {/* <Route path="/dashboard/rider/schedule" element={
            <ProtectedRoute allowedRoles={['rider']}>
              <RiderSchedulePage />
            </ProtectedRoute>
          } /> */}

          {/* <Route path="/dashboard/restaurant/:id/riders" element={
            <ProtectedRoute allowedRoles={['restaurant_owner', 'manager']}>
              <RiderManagementPage />
            </ProtectedRoute>
          } /> */}
          
          <Route path="/dashboard/customer-care" element={
            <ProtectedRoute allowedRoles={['customer_care']}>
              <CustomerCareDashboard />
            </ProtectedRoute>
          } />
          
          {/* ========== COMMON UTILITY PAGES ========== */}
          
          {/* Settings Page (Available to all authenticated users) */}
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Notifications Page */}
          <Route path="/dashboard/notifications" element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Help & Support */}
          <Route path="/dashboard/help" element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            </ProtectedRoute>
          } />
          
          {/* ========== 404 ROUTE ========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;