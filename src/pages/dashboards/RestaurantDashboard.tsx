import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Clock,
  Users,
  DollarSign,
  Star,
  ChefHat,
  ShoppingBag,
  BarChart3,
  Bell,
  Filter,
  Download
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { OrdersService } from '../../services/ordersService';
import { RestaurantService } from '../../services/restaurantService';
import type{ Order, OrderStatus } from '../../types';
import toast from 'react-hot-toast';

export const RestaurantDashboard: React.FC = () => {
  const [restaurantId] = useState(1); // Replace with actual restaurant ID
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    averageRating: 4.5,
    totalMenuItems: 0,
    activeStaff: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchRestaurantData();
  }, [timeRange]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      const [restaurantOrders, orderStats, revenueStats, popular] = await Promise.all([
        OrdersService.getRestaurantOrders(restaurantId),
        OrdersService.getOrderStats(restaurantId),
        OrdersService.getRevenueStats(restaurantId, timeRange === 'week' ? 7 : 30),
        RestaurantService.getPopularItems(restaurantId),
      ]);

      setOrders(restaurantOrders.slice(0, 10));
      setStats(orderStats);
      setRevenueData(revenueStats.dailyStats || []);
      setPopularItems(popular.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load restaurant data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await OrdersService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchRestaurantData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const statsCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders.toString(),
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: "Today's Revenue",
      value: `KSh ${stats.todayRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      change: '+18%',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      change: '+5%',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: <Star className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
  ];

  const timeRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'on_the_way': return 'info';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  const getStatusActions = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return [
          { label: 'Start Preparing', status: 'preparing' },
          { label: 'Cancel', status: 'cancelled' },
        ];
      case 'preparing':
        return [
          { label: 'Mark Ready', status: 'ready' },
        ];
      case 'ready':
        return [
          { label: 'Assign Rider', status: 'on_the_way' },
        ];
      default:
        return [];
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
            <p className="text-gray-600 mt-2">Burger King - Nairobi Branch</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button variant="outline" leftIcon={<Bell className="w-4 h-4" />}>
              Notifications
            </Button>
            <Button variant="primary" leftIcon={<ChefHat className="w-4 h-4" />}>
              Manage Menu
            </Button>
          </div>
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
                    {stat.change && (
                      <p className="text-sm text-green-600 mt-1">{stat.change} from yesterday</p>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Orders & Revenue */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Revenue Overview
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  {timeRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setTimeRange(range.id)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        timeRange === range.id
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {revenueData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No revenue data available</p>
                    </div>
                  ) : (
                    <div className="h-full flex items-end space-x-2">
                      {revenueData.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg"
                            style={{ height: `${(day.revenue / 10000) * 100}%` }}
                          />
                          <p className="text-xs mt-2 text-gray-600">{day.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Order #</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Customer</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="py-8">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-500"></div>
                            </div>
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-600">
                            No orders today
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => {
                          const actions = getStatusActions(order.status);
                          return (
                            <tr key={order.order_id} className="border-b hover:bg-gray-50">
                              <td className="py-4 font-medium">#{order.order_id}</td>
                              <td className="py-4">{order.customer?.user?.name || 'N/A'}</td>
                              <td className="py-4 font-bold">KSh {order.total_price}</td>
                              <td className="py-4">
                                <Badge variant={getStatusColor(order.status)}>
                                  {order.status.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="py-4">
                                <div className="flex space-x-2">
                                  {actions.map((action) => (
                                    <Button
                                      key={action.status}
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleUpdateOrderStatus(order.order_id, action.status as OrderStatus)
                                      }
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Popular Items & Quick Stats */}
          <div className="space-y-6">
            {/* Popular Items */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Items</CardTitle>
              </CardHeader>
              <CardContent>
                {popularItems.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No popular items data</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {popularItems.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 mr-3 overflow-hidden">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            <span>{item.rating || '4.5'}</span>
                            <span className="mx-2">•</span>
                            <span>{item.orders || 0} orders</span>
                          </div>
                        </div>
                        <p className="font-bold">KSh {item.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ChefHat className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Menu Items</span>
                  </div>
                  <span className="font-bold">{stats.totalMenuItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Active Staff</span>
                  </div>
                  <span className="font-bold">{stats.activeStaff}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Avg Prep Time</span>
                  </div>
                  <span className="font-bold">25 min</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" fullWidth leftIcon={<Package className="w-4 h-4" />}>
                  Manage Orders
                </Button>
                <Button variant="outline" fullWidth leftIcon={<ChefHat className="w-4 h-4" />}>
                  Update Menu
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Users className="w-4 h-4" />}>
                  Staff Management
                </Button>
                <Button variant="outline" fullWidth leftIcon={<BarChart3 className="w-4 h-4" />}>
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};