import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Package, 
  Clock, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  MapPin,
  Battery,
  Wifi,
  User,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { OrdersService } from '../../services/ordersService';
import { riderService } from '../../services/riderService';
import { useWebSocket } from '../../hooks/useWebsockets';
import toast from 'react-hot-toast';

export const RiderDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    completedToday: 0,
    averageRating: 0,
    activeHours: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { updateRiderLocation, isConnected } = useWebSocket();

  useEffect(() => {
    fetchRiderData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location');
        }
      );
    }
  }, []);

  const fetchRiderData = async () => {
    try {
      setIsLoading(true);
      // Replace with actual rider ID
      const riderId = 1;
      const [orders, riderStats] = await Promise.all([
        riderService.getAssignedOrders(riderId),
        riderService.getRiderStats(riderId),
      ]);

      setAssignedOrders(orders.filter((o: any) => o.status !== 'delivered'));
      setCompletedOrders(orders.filter((o: any) => o.status === 'delivered').slice(0, 5));
      setStats(riderStats);
    } catch (error) {
      toast.error('Failed to load rider data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      setIsLoading(true);
      // Replace with actual rider ID
      const riderId = 1;
      const updatedRider = await riderService.updateRiderStatus(riderId, !isOnline);
      setIsOnline(updatedRider.is_online);
      
      if (updatedRider.is_online && currentLocation) {
        await riderService.updateRiderLocation(
          riderId,
          currentLocation.lat,
          currentLocation.lng
        );
        toast.success('You are now online!');
      } else {
        toast.success('You are now offline');
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      // Replace with actual rider ID
      const riderId = 1;
      await riderService.acceptOrder(riderId, orderId);
      toast.success('Order accepted');
      fetchRiderData();
    } catch (error) {
      toast.error('Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: number) => {
    try {
      // Replace with actual rider ID
      const riderId = 1;
      await riderService.rejectOrder(riderId, orderId);
      toast.success('Order rejected');
      fetchRiderData();
    } catch (error) {
      toast.error('Failed to reject order');
    }
  };

  const statsCards = [
    {
      title: 'Today\'s Earnings',
      value: `KSh ${stats.todayEarnings.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Completed Today',
      value: stats.completedToday.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-yellow-500',
    },
    {
      title: 'Active Hours',
      value: `${stats.activeHours}h`,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'warning';
      case 'on_the_way': return 'info';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Online Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
            <div className="flex items-center mt-2">
              <Badge variant={isOnline ? 'success' : 'danger'} className="mr-3">
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Badge>
              <div className="flex items-center text-sm text-gray-600">
                <Wifi className="w-4 h-4 mr-1" />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
          <Button
            variant={isOnline ? 'danger' : 'primary'}
            size="lg"
            onClick={handleToggleOnline}
            isLoading={isLoading}
            leftIcon={isOnline ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Assigned Orders & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Location & Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="w-5 h-5 mr-2" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentLocation ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Coordinates</p>
                        <p className="font-mono">
                          {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentLocation) {
                            updateRiderLocation(currentLocation.lat, currentLocation.lng);
                            toast.success('Location updated');
                          }
                        }}
                      >
                        Update Location
                      </Button>
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Map will appear here</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Integration with Google Maps or Mapbox
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Location not available</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please enable location services
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assigned Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Assigned Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : assignedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No assigned orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center">
                              <p className="font-bold">Order #{order.id}</p>
                              <Badge variant={getOrderStatusColor(order.status)} className="ml-2">
                                {order.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{order.restaurant_name}</p>
                          </div>
                          <p className="font-bold">KSh {order.total}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{order.delivery_address}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectOrder(order.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info & Recent Completed */}
          <div className="space-y-6">
            {/* Rider Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Rider Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="font-medium">Motorcycle</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Battery</p>
                    <div className="flex items-center">
                      <Battery className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Today's Distance</p>
                    <p className="font-medium">45 km</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Completed Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recently Completed</CardTitle>
              </CardHeader>
              <CardContent>
                {completedOrders.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No completed orders today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.delivered_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">KSh {order.total}</p>
                          <Badge variant="success" size="sm">
                            Delivered
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" fullWidth leftIcon={<Navigation className="w-4 h-4" />}>
                  Update Location
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Clock className="w-4 h-4" />}>
                  View Schedule
                </Button>
                <Button variant="outline" fullWidth leftIcon={<DollarSign className="w-4 h-4" />}>
                  View Earnings
                </Button>
                <Button variant="outline" fullWidth leftIcon={<AlertCircle className="w-4 h-4" />}>
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};