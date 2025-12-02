import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Star, 
  CreditCard,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { OrdersService } from '../../services/ordersService';
import { paymentService } from '../../services/paymentService';
import type{ Order, OrderStatus } from '../../types';
import toast from 'react-hot-toast';

export const CustomerDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [userOrders, orderStats, payments] = await Promise.all([
        OrdersService.getUserOrders(),
        OrdersService.getOrderStats(),
        paymentService.getUserPayments(1), // Replace with actual user ID
      ]);

      setOrders(userOrders.slice(0, 5));
      setStats(orderStats);
      setRecentPayments(payments.slice(0, 3));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'on_the_way': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'on_the_way': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      change: '+5%',
    },
    {
      title: 'Delivered',
      value: stats.deliveredOrders.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      change: '+18%',
    },
    {
      title: 'Total Spent',
      value: `KSh ${stats.totalSpent.toLocaleString()}`,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-500',
      change: '+23%',
    },
  ];

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your overview</p>
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
                    <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
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
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex space-x-1">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          activeFilter === filter.id
                            ? 'bg-orange-100 text-orange-600'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                    <Button variant="primary" className="mt-4">
                      Order Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.order_id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.order_id}</p>
                            <div className="flex items-center mt-1">
                              <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                {order.delivery_address}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-right">
                            <p className="font-bold">KSh {order.total_price}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Trend Chart */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Order Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Order trend chart will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No recent payments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Payment #{payment.reference}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">KSh {payment.amount}</p>
                          <Badge variant="success" size="sm">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loyalty Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Loyalty Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
                    <span className="text-2xl font-bold text-white">250</span>
                  </div>
                  <p className="text-gray-600 mb-4">You have 250 loyalty points</p>
                  <p className="text-sm text-gray-500">
                    Redeem points for discounts on your next order
                  </p>
                  <Button variant="outline" className="mt-4">
                    Redeem Points
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" fullWidth leftIcon={<ShoppingBag className="w-4 h-4" />}>
                  Track Order
                </Button>
                <Button variant="outline" fullWidth leftIcon={<MapPin className="w-4 h-4" />}>
                  Update Address
                </Button>
                <Button variant="outline" fullWidth leftIcon={<CreditCard className="w-4 h-4" />}>
                  Manage Payment Methods
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Star className="w-4 h-4" />}>
                  Rate Previous Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};