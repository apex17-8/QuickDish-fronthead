import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Star
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { OrdersService } from '../services/ordersService';
import type{ Order, OrderStatus } from '../types';
import toast from 'react-hot-toast';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'All Orders', icon: Package },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'preparing', label: 'Preparing', icon: RefreshCw },
    { id: 'on_the_way', label: 'On the Way', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => {
      const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
      const matchesSearch = order.order_id.toString().includes(searchQuery) ||
                          order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    setFilteredOrders(filtered);
  }, [orders, activeFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const userOrders = await OrdersService.getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      toast.error('Failed to load orders');
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
      case 'pending': return Clock;
      case 'preparing': return RefreshCw;
      case 'on_the_way': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const handleRateOrder = (orderId: number) => {
    // Open rating modal
    toast.success('Rating modal would open here');
  };

  const handleReorder = async (order: Order) => {
    try {
      // Implement reorder logic
      toast.success('Added items from order to cart');
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">View and manage all your orders</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order ID or restaurant..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        activeFilter === filter.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center p-8">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'No orders match your search'
                : activeFilter !== 'all'
                ? `You have no ${activeFilter} orders`
                : 'You haven\'t placed any orders yet'}
            </p>
            <Link to="/restaurants">
              <Button variant="primary">Browse Restaurants</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              const canRate = order.status === 'delivered' && !order.customer_rating;
              const canReorder = order.status === 'delivered';

              return (
                <Card key={order.order_id} hoverable>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-bold text-lg">Order #{order.order_id}</h3>
                              <Badge variant={getStatusColor(order.status)} className="ml-3">
                                {order.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mt-1">{order.restaurant.name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Order Date</p>
                            <p className="font-medium">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Items</p>
                            <p className="font-medium">
                              {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0)} items
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-bold text-lg">KSh {order.total_price}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 min-w-[200px]">
                        <Link to={`/track-order/${order.order_id}`}>
                          <Button variant="outline" fullWidth leftIcon={<Eye className="w-4 h-4" />}>
                            Track Order
                          </Button>
                        </Link>
                        
                        {canRate && (
                          <Button
                            variant="primary"
                            fullWidth
                            leftIcon={<Star className="w-4 h-4" />}
                            onClick={() => handleRateOrder(order.order_id)}
                          >
                            Rate Order
                          </Button>
                        )}
                        
                        {canReorder && (
                          <Button
                            variant="outline"
                            fullWidth
                            leftIcon={<RefreshCw className="w-4 h-4" />}
                            onClick={() => handleReorder(order)}
                          >
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-3">Items in this order:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.orderItems?.slice(0, 3).map((item) => (
                          <span
                            key={item.order_item_id}
                            className="px-3 py-1 bg-gray-100 rounded-lg text-sm"
                          >
                            {item.menu_item.name} × {item.quantity}
                          </span>
                        ))}
                        {order.orderItems && order.orderItems.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                            +{order.orderItems.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};