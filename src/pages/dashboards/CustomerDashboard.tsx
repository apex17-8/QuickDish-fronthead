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
  Filter,
  MessageSquare
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { OrdersService } from '../../services/ordersService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import { useOrderWorkflow } from '../../hooks/useOrderWorkflow';
import type{ Order } from '../../types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const CustomerDashboard: React.FC = () => {
  const { user, customer } = useAuth();
  const { 
    activeOrders, 
    placeOrder, 
    rateOrder,
    getOrderStatusText,
    shouldOpenChat,
    shouldRateOrder 
  } = useOrderWorkflow();
  
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
  }, [customer]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      if (customer) {
        const [customerOrders, payments] = await Promise.all([
          OrdersService.getCustomerOrders(customer.customer_id),
          paymentService.getUserPayments(user?.user_id || 0),
        ]);

        setOrders(customerOrders);
        
        // Calculate stats
        const totalOrders = customerOrders.length;
        const pendingOrders = customerOrders.filter(o => 
          ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'assigned', 'picked_up'].includes(o.status)
        ).length;
        const deliveredOrders = customerOrders.filter(o => o.status === 'delivered').length;
        const totalSpent = customerOrders
          .filter(o => o.status === 'delivered')
          .reduce((sum, order) => sum + (order.total_price || 0), 0);

        setStats({
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalSpent,
        });
        
        setRecentPayments(payments.slice(0, 3));
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': 
      case 'preparing': return 'info';
      case 'ready_for_pickup': return 'warning';
      case 'assigned': 
      case 'picked_up': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Orders',
      value: activeOrders.length.toString(),
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
    },
    {
      title: 'Delivered',
      value: stats.deliveredOrders.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Total Spent',
      value: `KSh ${stats.totalSpent.toLocaleString()}`,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
  ];

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'active', label: 'Active' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return activeOrders.some(o => o.order_id === order.order_id);
    if (activeFilter === 'delivered') return order.status === 'delivered';
    if (activeFilter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const handleOpenChat = (orderId: number) => {
    // Check if chat should be open
    const order = orders.find(o => o.order_id === orderId);
    if (order && shouldOpenChat(order.status, !!order.rider)) {
      window.open(`/chat/${orderId}`, '_blank');
    } else {
      toast.error('Chat is only available when rider has picked up your order');
    }
  };

  const handleRateOrder = async (orderId: number) => {
    // You can implement a rating modal here
    const rating = 5; // Default rating, get from modal
    const feedback = "Great service!"; // Get from modal
    await rateOrder(orderId, rating, feedback);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Here's your overview
          </p>
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

        {/* Active Orders Alert */}
        {activeOrders.length > 0 && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Truck className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-bold text-lg">Active Orders: {activeOrders.length}</h3>
                    <p className="text-blue-700">
                      Track your orders in real-time
                    </p>
                  </div>
                </div>
                <Link to="/orders/active">
                  <Button variant="primary">View All</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

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
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                    <Link to="/restaurants">
                      <Button variant="primary" className="mt-4">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.order_id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {order.status === 'delivered' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : order.status === 'picked_up' ? (
                              <Truck className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.order_number || order.order_id}</p>
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
                            {getOrderStatusText(order.status)}
                          </Badge>
                          <div className="text-right">
                            <p className="font-bold">KSh {order.total_price}</p>
                            <div className="flex space-x-2 mt-2">
                              <Link to={`/orders/${order.order_id}`}>
                                <Button size="sm" variant="outline">
                                  Track
                                </Button>
                              </Link>
                              
                              {shouldOpenChat(order.status, !!order.rider) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  leftIcon={<MessageSquare className="w-3 h-3" />}
                                  onClick={() => handleOpenChat(order.order_id)}
                                >
                                  Chat
                                </Button>
                              )}
                              
                              {shouldRateOrder(order.status, !order.customer_rating) && (
                                <Button 
                                  size="sm" 
                                  variant="primary"
                                  leftIcon={<Star className="w-3 h-3" />}
                                  onClick={() => handleRateOrder(order.order_id)}
                                >
                                  Rate
                                </Button>
                              )}
                            </div>
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
                    <p className="text-gray-600">
                      {stats.totalOrders === 0 
                        ? 'Start your first order to see trends' 
                        : `${stats.totalOrders} orders placed so far`}
                    </p>
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
                      <div key={payment.payment_id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Payment #{payment.payment_reference}</p>
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
                    <span className="text-2xl font-bold text-white">
                      {customer?.loyalty_points || 0}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    You have {customer?.loyalty_points || 0} loyalty points
                  </p>
                  <p className="text-sm text-gray-500">
                    Earn 10 points for every KSh 1000 spent
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
                <Link to="/restaurants">
                  <Button variant="outline" fullWidth leftIcon={<ShoppingBag className="w-4 h-4" />}>
                    Order Food
                  </Button>
                </Link>
                <Link to="/orders/active">
                  <Button variant="outline" fullWidth leftIcon={<Truck className="w-4 h-4" />}>
                    Track Orders
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" fullWidth leftIcon={<MapPin className="w-4 h-4" />}>
                    Update Address
                  </Button>
                </Link>
                <Link to="/payments">
                  <Button variant="outline" fullWidth leftIcon={<CreditCard className="w-4 h-4" />}>
                    Payment Methods
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};