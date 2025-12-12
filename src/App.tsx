import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";

// PUBLIC PAGES
import { HomePage } from "./pages/Homepage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { RestaurantPage } from "./pages/RestaurantPage";
import { RestaurantDetailPage } from "./pages/RestaurantDetailPage"; // NEW: Create this component
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OrdersPage } from "./pages/OrdersPage";

// DASHBOARDS
import { CustomerDashboard } from "./pages/dashboards/CustomerDashboard";
import { RiderDashboard } from "./pages/dashboards/RiderDashboard";
import { AdminDashboard } from "./pages/dashboards/AdminDashboard";
import { ManagerDashboard } from "./pages/dashboards/ManagerDashboard";
import { CustomerCareDashboard } from "./pages/dashboards/CustomerCareDashboard";

// RESTAURANT OWNER MODULE
import { RestaurantOwnerDashboard } from "./pages/dashboards/RestaurantOwnerDashboard";
import { CreateRestaurantPage } from "./pages/dashboards/CreateRestaurantPage";
import { EditRestaurantPage } from "./pages/dashboards/EditRestaurantPage";
import { RestaurantMenuPage } from "./pages/dashboards/RestaurantMenuPage";
import { RestaurantOrdersPage } from "./pages/dashboards/RestaurantOrdersPage";
import { RestaurantAnalyticsPage } from "./pages/dashboards/RestaurantAnalyticsPage";

import { RiderEarningsPage } from "./pages/dashboards/RiderEarningsPage";
import { RiderOrderDetailsPage } from "./pages/dashboards/RiderOrderDetailsPage";

// --------- UTIL FUNCTIONS ---------

// Role Redirect
const RoleBasedRedirect = () => {
  const userStr = localStorage.getItem("user");

  if (!userStr) return <Navigate to="/login" replace />;

  const user = JSON.parse(userStr);

  const roleRoutes: any = {
    restaurant_owner: "/dashboard/restaurant",
    manager: "/dashboard/restaurant",
    rider: "/dashboard/rider",
    super_admin: "/dashboard/admin",
    customer_care: "/dashboard/customer-care",
    customer: "/dashboard/customer",
  };

  return <Navigate to={roleRoutes[user.role] || "/dashboard"} replace />;
};

// Protected Route
const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) return <Navigate to="/login" replace />;

  const user = JSON.parse(userStr);

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard/redirect" replace />;
  }

  return <>{children}</>;
};

// ---------------------------------------------------

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/restaurants" element={<RestaurantPage />} /> {/* Restaurant listing */}
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} /> {/* Restaurant detail - NEW */}
          <Route path="/track-order/:id" element={<OrderTrackingPage />} />
          <Route path="/orders" element={<OrdersPage />} />

          {/* AUTO REDIRECT BY ROLE */}
          <Route path="/dashboard/redirect" element={<RoleBasedRedirect />} />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* CUSTOMER DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* RIDER DASHBOARD */}
          <Route
            path="/dashboard/rider"
            element={
              <ProtectedRoute allowedRoles={["rider"]}>
                <RiderDashboard />
              </ProtectedRoute>
            }
          />

          {/* --- RESTAURANT OWNER & MANAGER --- */}
          <Route
            path="/dashboard/restaurant"
            element={
              <ProtectedRoute allowedRoles={["restaurant_owner", "manager"]}>
                <RestaurantOwnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/restaurant/new"
            element={
              <ProtectedRoute allowedRoles={["restaurant_owner"]}>
                <CreateRestaurantPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/restaurant/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["restaurant_owner"]}>
                <EditRestaurantPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/restaurant/:id/menu"
            element={
              <ProtectedRoute allowedRoles={["restaurant_owner", "manager"]}>
                <RestaurantMenuPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/restaurant/:id/orders"
            element={
              <ProtectedRoute allowedRoles={["restaurant_owner", "manager"]}>
                <RestaurantOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/restaurant/:id/analytics"
            element={
              <ProtectedRoute allowedRoles={["restaurant_owner", "manager"]}>
                <RestaurantAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* ADMIN / SUPER ADMIN */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["super_admin", "customer_care"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* MANAGER PANEL */}
          <Route
            path="/dashboard/manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* RIDER SUBPAGES */}
          <Route
            path="/dashboard/rider/earnings"
            element={
              <ProtectedRoute allowedRoles={["rider"]}>
                <RiderEarningsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/rider/orders/:id"
            element={
              <ProtectedRoute allowedRoles={["rider"]}>
                <RiderOrderDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* CUSTOMER CARE DASHBOARD */}
          <Route
            path="/dashboard/customer-care"
            element={
              <ProtectedRoute allowedRoles={["customer_care"]}>
                <CustomerCareDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}