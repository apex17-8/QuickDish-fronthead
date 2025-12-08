// src/pages/dashboards/RiderDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, Package, MapPin, DollarSign, Clock, 
  CheckCircle, AlertCircle, MessageSquare, 
  User, Settings, Bell, LogOut, ChevronRight,
  TrendingUp, BarChart, Calendar, Shield
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {RiderEarningsTab} from '../../pages/dashboards/RiderEarningsTab';
import {RiderChatTab} from '../../pages/dashboards/RiderChatTab';
export const RiderDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    todayDeliveries: 0,
    pendingDeliveries: 0,
    earnings: 0,
    rating: 0,
    onlineHours: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'rider') {
      navigate('/dashboard');
      return;
    }
    
    loadDashboardData();
    setupWebSocket();
    startLocationTracking();
    
    // Cleanup
    return () => {
      // Disconnect WebSocket
    };
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ordersResponse, statsResponse, earningsResponse] = await Promise.all([
        api.get(`/orders/rider/${user?.user_id}`),
        api.get(`/riders/${user?.user_id}/stats`),
        api.get(`/payments/user/${user?.user_id}`),
      ]);

      setRecentOrders(ordersResponse.data);
      
      // Get available orders
      try {
        const available = await api.get('/orders/ready');
        setAvailableOrders(available.data);
      } catch (error) {
        console.log('No available orders');
      }

      // Calculate stats
      const orders = ordersResponse.data;
      const earnings = earningsResponse.data;
      
      const today = new Date().toDateString();
      const todayOrders = orders.filter((order: any) => 
        new Date(order.created_at).toDateString() === today
      );

      const pendingOrders = orders.filter((order: any) => 
        ['accepted', 'preparing', 'ready', 'on_the_way'].includes(order.status)
      );

      const totalEarnings = earnings
        .filter((payment: any) => payment.status === 'COMPLETED')
        .reduce((sum: number, payment: any) => sum + payment.amount, 0);

      setStats({
        totalDeliveries: orders.length,
        todayDeliveries: todayOrders.length,
        pendingDeliveries: pendingOrders.length,
        earnings: totalEarnings,
        rating: statsResponse.data?.rating || 0,
        onlineHours: statsResponse.data?.onlineHours || 0,
      });

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocket = () => {
    // Setup WebSocket connection for real-time updates
    if (!user) return;

    const ws = new WebSocket(`ws://localhost:3000/ws?riderId=${user.user_id}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsOnline(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsOnline(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          // Send location to server
          updateLocation(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    try {
      await api.patch(`/riders/${user?.user_id}/update-location`, {
        latitude: lat,
        longitude: lng,
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'newOrder':
        toast.success('New order available!');
        loadDashboardData(); // Refresh data
        break;
      
      case 'orderAssigned':
        toast.success(`You've been assigned to order #${data.orderId}`);
        setCurrentOrder(data.order);
        loadDashboardData();
        break;
      
      case 'orderUpdated':
        toast.info(`Order #${data.orderId} status updated: ${data.status}`);
        loadDashboardData();
        break;
      
      case 'chatMessage':
        toast.info(`New message from ${data.sender}`);
        break;
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      if (isOnline) {
        await api.patch(`/riders/${user?.user_id}/go-offline`);
        setIsOnline(false);
        toast.success('You are now offline');
      } else {
        await api.patch(`/riders/${user?.user_id}/go-online`);
        setIsOnline(true);
        toast.success('You are now online');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const acceptOrder = async (orderId: number) => {
    try {
      await api.patch(`/orders/${orderId}/assign-rider`, {
        rider_id: user?.user_id,
      });
      toast.success('Order accepted!');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to accept order');
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'accepted': return <Badge variant="info">Accepted</Badge>;
      case 'preparing': return <Badge variant="info">Preparing</Badge>;
      case 'ready': return <Badge variant="success">Ready</Badge>;
      case 'on_the_way': return <Badge variant="warning">On The Way</Badge>;
      case 'delivered': return <Badge variant="success">Delivered</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge variant={isOnline ? 'success' : 'danger'}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Badge>
                  <span className="text-gray-600">Welcome back, {user?.name}!</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button
              variant={isOnline ? 'danger' : 'success'}
              onClick={toggleOnlineStatus}
            >
              {isOnline ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Go Offline
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Go Online
                </>
              )}
            </Button>
            <Button
              variant="outline"
              leftIcon={<Bell className="w-4 h-4" />}
              onClick={() => navigate('/notifications')}
            >
              Notifications
            </Button>
            <Button
              variant="outline"
              leftIcon={<Settings className="w-4 h-4" />}
              onClick={() => navigate('/dashboard/settings')}
            >
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Deliveries</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.todayDeliveries}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.pendingDeliveries}</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <h3 className="text-2xl font-bold mt-2">{formatCurrency(stats.earnings)}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.rating.toFixed(1)}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Online Hours</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.onlineHours}</h3>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="available">Available Orders</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Order */}
              {currentOrder && (
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Current Delivery
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-lg">Order #{currentOrder.order_id}</h3>
                            <p className="text-gray-600">{currentOrder.restaurant?.name}</p>
                          </div>
                          {getStatusBadge(currentOrder.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Pickup Location</p>
                            <p className="font-medium">{currentOrder.restaurant?.address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Delivery Location</p>
                            <p className="font-medium">{currentOrder.delivery_address}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-xl font-bold">{formatCurrency(currentOrder.total_price)}</p>
                          </div>
                          <div className="space-x-2">
                            {currentOrder.status === 'ready' && (
                              <Button
                                variant="primary"
                                onClick={() => updateOrderStatus(currentOrder.order_id, 'on_the_way')}
                              >
                                Start Delivery
                              </Button>
                            )}
                            {currentOrder.status === 'on_the_way' && (
                              <Button
                                variant="success"
                                onClick={() => updateOrderStatus(currentOrder.order_id, 'delivered')}
                              >
                                Mark as Delivered
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/dashboard/rider/earnings')}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      View Earnings
                    </Button>
                    
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/dashboard/rider/performance')}
                    >
                      <BarChart className="w-4 h-4 mr-2" />
                      Performance
                    </Button>
                    
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/dashboard/rider/schedule')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                    
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/dashboard/rider/support')}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Support
                    </Button>
                  </CardContent>
                </Card>

                {/* Location Status */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Location Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {location ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Current Location</p>
                        <p className="font-medium">
                          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-500">Location tracking active</p>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Location not available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Orders */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent orders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 5).map(order => (
                      <div key={order.order_id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">Order #{order.order_id}</span>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {order.restaurant?.name} → {order.customer?.user?.name}
                            </p>
                            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(order.total_price)}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/dashboard/rider/orders/${order.order_id}`)}
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start accepting orders to see them here</p>
                    <Button
                      variant="primary"
                      onClick={() => setActiveTab('available')}
                    >
                      View Available Orders
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map(order => (
                      <div key={order.order_id} className="p-4 border rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Truck className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <h3 className="font-bold">Order #{order.order_id}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  {getStatusBadge(order.status)}
                                  <span className="text-sm text-gray-500">
                                    {formatDate(order.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Restaurant</p>
                                <p className="font-medium">{order.restaurant?.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Customer</p>
                                <p className="font-medium">{order.customer?.user?.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Amount</p>
                                <p className="font-bold">{formatCurrency(order.total_price)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/dashboard/rider/orders/${order.order_id}`)}
                            >
                              View Details
                            </Button>
                            {order.status === 'ready' && (
                              <Button
                                variant="primary"
                                onClick={() => acceptOrder(order.order_id)}
                              >
                                Accept Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Orders Tab */}
          <TabsContent value="available">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Available Orders</CardTitle>
                  <Badge variant="info">{availableOrders.length} available</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {availableOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No available orders</h3>
                    <p className="text-gray-600">New orders will appear here when available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableOrders.map(order => (
                      <Card key={order.order_id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">Order #{order.order_id}</CardTitle>
                            <Badge variant="success">KES {order.total_price}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{order.restaurant?.name}</p>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600">Pickup</p>
                              <p className="text-sm font-medium truncate">{order.restaurant?.address}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Delivery</p>
                              <p className="text-sm font-medium truncate">{order.delivery_address}</p>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Package className="w-4 h-4 mr-2" />
                              <span>{order.orderItems?.length || 0} items</span>
                            </div>
                          </div>
                        </CardContent>
                        
                        <div className="px-6 py-4 border-t">
                          <Button
                            fullWidth
                            variant="primary"
                            onClick={() => acceptOrder(order.order_id)}
                          >
                            Accept Order
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <RiderEarningsTab userId={user?.user_id} />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <RiderChatTab userId={user?.user_id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};