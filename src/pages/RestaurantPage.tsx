// src/pages/dashboards/RestaurantPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building, Edit, Trash2, Package, Users, DollarSign, Star, 
  MapPin, Phone, Menu, BarChart, Clock, TrendingUp, ChefHat, ShoppingBag 
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useAuth } from '../hooks/useAuth';
import { RestaurantOwnerService } from '../services/restaurantOwnerService';
import toast from 'react-hot-toast';

export const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    }
  }, [id]);

  const loadRestaurantData = async () => {
    setIsLoading(true);
    try {
      const restaurantData = await RestaurantOwnerService.getRestaurantById(parseInt(id!));
      setRestaurant(restaurantData);
    } catch (error: any) {
      toast.error('Failed to load restaurant data');
      navigate('/dashboard/restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRestaurant = () => {
    navigate(`/dashboard/restaurant/${id}/edit`);
  };

  const handleDeleteRestaurant = async () => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await RestaurantOwnerService.deleteRestaurant(parseInt(id!));
        toast.success('Restaurant deleted successfully');
        navigate('/dashboard/restaurant');
      } catch (error: any) {
        toast.error('Failed to delete restaurant');
      }
    }
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

  if (!restaurant) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Restaurant Not Found</h3>
            <Button onClick={() => navigate('/dashboard/restaurant')}>
              Back to Restaurants
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'Today Orders', value: '24', icon: ShoppingBag, change: '+12%', color: 'bg-blue-500' },
    { label: 'Revenue', value: 'KES 12,450', icon: DollarSign, change: '+18%', color: 'bg-green-500' },
    { label: 'Pending Orders', value: '8', icon: Clock, change: '+5%', color: 'bg-yellow-500' },
    { label: 'Rating', value: restaurant.rating?.toFixed(1) || 'N/A', icon: Star, color: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Restaurant Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  {restaurant.logo_url ? (
                    <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Building className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={restaurant.is_active ? 'success' : 'danger'}>
                      {restaurant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-gray-600">{restaurant.cuisine || 'Various Cuisine'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              {user?.role === 'restaurant_owner' && (
                <>
                  <Button variant="outline" onClick={handleEditRestaurant}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Restaurant
                  </Button>
                  <Button variant="outline" className="text-red-600" onClick={handleDeleteRestaurant}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>{restaurant.phone}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              <span>Rating: {restaurant.rating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    {stat.change && (
                      <p className="text-sm text-green-600 mt-1">{stat.change} from yesterday</p>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium">New order received</p>
                        <p className="text-sm text-gray-600">Order #1234 - KES 1,250</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium">Menu item added</p>
                        <p className="text-sm text-gray-600">Added "Chicken Burger" to menu</p>
                        <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" fullWidth onClick={() => navigate(`/dashboard/restaurant/${id}/menu`)}>
                      <Menu className="w-4 h-4 mr-2" />
                      Manage Menu
                    </Button>
                    <Button variant="outline" fullWidth onClick={() => navigate(`/dashboard/restaurant/${id}/staff`)}>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Staff
                    </Button>
                    <Button variant="outline" fullWidth onClick={() => navigate(`/dashboard/orders?restaurant=${id}`)}>
                      <Package className="w-4 h-4 mr-2" />
                      View Orders
                    </Button>
                    <Button variant="outline" fullWidth onClick={() => navigate(`/dashboard/analytics?restaurant=${id}`)}>
                      <BarChart className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menu">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Menu Management</CardTitle>
                <Button onClick={() => navigate(`/dashboard/restaurant/${id}/menu`)}>
                  <ChefHat className="w-4 h-4 mr-2" />
                  Manage Full Menu
                </Button>
              </CardHeader>
              <CardContent>
                <p>Full menu management page coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Staff Management</CardTitle>
                <Button onClick={() => navigate(`/dashboard/restaurant/${id}/staff`)}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Staff
                </Button>
              </CardHeader>
              <CardContent>
                <p>Staff management page coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Order management page coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Analytics dashboard coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};