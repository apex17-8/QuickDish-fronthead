//RestaurantOwnerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Edit, Trash2, Package, Users, DollarSign, Star, MapPin, Phone, Menu, Bell, BarChart } from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { RestaurantOwnerService } from '../../services/restaurantOwnerService';
import toast from 'react-hot-toast';

// This will replace your current RestaurantDashboard component
export const RestaurantOwnerDashboard: React.FC = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    averageRating: 0,
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'restaurant_owner' && user.role !== 'manager' && user.role !== 'super_admin')) {
      navigate('/dashboard');
      return;
    }

    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const restaurantsData = await RestaurantOwnerService.getMyRestaurants();
      setRestaurants(restaurantsData);
      
      // Calculate basic stats
      const calculatedStats = {
        totalRestaurants: restaurantsData.length,
        totalOrders: restaurantsData.reduce((sum, r) => sum + (r.orders?.length || 0), 0),
        todayOrders: Math.floor(Math.random() * 10), // Mock for now
        pendingOrders: Math.floor(Math.random() * 5), // Mock for now
        revenue: restaurantsData.reduce((sum, r) => sum + (r.totalRevenue || 0), 0),
        averageRating: restaurantsData.length > 0 
          ? restaurantsData.reduce((sum, r) => sum + (r.rating || 0), 0) / restaurantsData.length 
          : 0,
      };
      setStats(calculatedStats);

    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      
      if (error.response?.status === 404) {
        toast.error('Backend endpoint not found. Please make sure /restaurants/owner/my-restaurants is implemented.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view restaurants.');
      } else {
        toast.error('Failed to load restaurants. Please check your connection.');
      }
      
      // Fallback to empty state
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRestaurant = () => {
    navigate('/dashboard/restaurant/new');
  };

  const handleEditRestaurant = (restaurantId: number) => {
    navigate(`/dashboard/restaurant/${restaurantId}/edit`);
  };

  const handleDeleteRestaurant = async (restaurantId: number) => {
    if (window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      try {
        await RestaurantOwnerService.deleteRestaurant(restaurantId);
        toast.success('Restaurant deleted successfully');
        loadDashboardData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete restaurant');
      }
    }
  };

  const handleViewRestaurant = (restaurantId: number) => {
    navigate(`/dashboard/restaurant/${restaurantId}`);
  };

  const handleManageStaff = (restaurantId: number) => {
    navigate(`/dashboard/restaurant/${restaurantId}/staff`);
  };

  const handleManageMenu = (restaurantId: number) => {
    navigate(`/dashboard/restaurant/${restaurantId}/menu`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'manager' ? 'Manager Dashboard' : 'Restaurant Owner Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! {user?.role === 'manager' ? 'Manage your assigned restaurants' : 'Manage your restaurants here.'}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            {user?.role === 'restaurant_owner' && (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleCreateRestaurant}
              >
                Add Restaurant
              </Button>
            )}
            <Button
              variant="outline"
              leftIcon={<Bell className="w-4 h-4" />}
              onClick={() => navigate('/notifications')}
            >
              Notifications
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">My Restaurants</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.totalRestaurants}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.totalOrders}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="success" size="sm">
                  +{stats.todayOrders} today
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.pendingOrders}</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="warning" size="sm">
                  Needs attention
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.averageRating.toFixed(1)}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {user?.role === 'manager' ? 'Assigned Restaurants' : 'My Restaurants'}
            </h2>
            <Badge variant="info">
              {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {restaurants.length === 0 ? (
            <Card className="text-center py-12">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {user?.role === 'manager' ? 'No restaurants assigned' : 'No restaurants yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {user?.role === 'manager' 
                  ? 'You have not been assigned to any restaurants yet.' 
                  : 'Create your first restaurant to start receiving orders'}
              </p>
              {user?.role === 'restaurant_owner' && (
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleCreateRestaurant}
                >
                  Create First Restaurant
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.restaurant_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold">{restaurant.name}</CardTitle>
                      <Badge variant={restaurant.is_active ? 'success' : 'danger'}>
                        {restaurant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{restaurant.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{restaurant.cuisine || 'Various'}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{restaurant.address}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{restaurant.phone}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Menu Items</p>
                          <p className="font-bold">{restaurant.menuItems?.length || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Staff</p>
                          <p className="font-bold">{restaurant.staff?.length || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Rating</p>
                          <p className="font-bold">{restaurant.rating?.toFixed(1) || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRestaurant(restaurant.restaurant_id)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageMenu(restaurant.restaurant_id)}
                      >
                        <Menu className="w-4 h-4 mr-2" />
                        Menu
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageStaff(restaurant.restaurant_id)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Staff
                      </Button>
                      
                      {user?.role === 'restaurant_owner' && (
                        <div className="col-span-2 flex space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditRestaurant(restaurant.restaurant_id)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                            onClick={() => handleDeleteRestaurant(restaurant.restaurant_id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-6 h-auto"
              onClick={() => navigate('/dashboard/analytics')}
            >
              <BarChart className="w-8 h-8 mb-2 text-blue-600" />
              <span>Analytics</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-6 h-auto"
              onClick={() => navigate('/dashboard/orders')}
            >
              <Package className="w-8 h-8 mb-2 text-green-600" />
              <span>All Orders</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-6 h-auto"
              onClick={() => navigate('/dashboard/staff')}
            >
              <Users className="w-8 h-8 mb-2 text-orange-600" />
              <span>All Staff</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-6 h-auto"
              onClick={() => navigate('/dashboard/settings')}
            >
              <Bell className="w-8 h-8 mb-2 text-gray-600" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};