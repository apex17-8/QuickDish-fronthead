// src/pages/dashboards/RestaurantOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, Clock, CheckCircle, XCircle, Truck, 
  DollarSign, Filter, Search, User, Phone, MapPin,
  ChevronRight, AlertCircle
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const RestaurantOrdersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    onRoute: 0,
    delivered: 0,
    cancelled: 0,
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadOrders();
    }
  }, [id, activeTab]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/orders/restaurant/${id}`);
      const ordersData = response.data;
      setOrders(ordersData);
      
      // Calculate stats
      const statsData = {
        pending: ordersData.filter((o: any) => o.status === 'pending').length,
        preparing: ordersData.filter((o: any) => o.status === 'preparing').length,
        ready: ordersData.filter((o: any) => o.status === 'ready').length,
        onRoute: ordersData.filter((o: any) => o.status === 'on_the_way').length,
        delivered: ordersData.filter((o: any) => o.status === 'delivered').length,
        cancelled: ordersData.filter((o: any) => o.status === 'cancelled').length,
      };
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredOrders = () => {
    switch(activeTab) {
      case 'pending':
        return orders.filter(o => o.status === 'pending');
      case 'preparing':
        return orders.filter(o => o.status === 'preparing' || o.status === 'accepted');
      case 'ready':
        return orders.filter(o => o.status === 'ready');
      case 'onRoute':
        return orders.filter(o => o.status === 'on_the_way');
      case 'delivered':
        return orders.filter(o => o.status === 'delivered');
      case 'cancelled':
        return orders.filter(o => o.status === 'cancelled');
      default:
        return orders;
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      loadOrders();
      
      // If we were viewing this order, update it
      if (selectedOrder?.order_id === orderId) {
        setSelectedOrder({...selectedOrder, status});
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'on_the_way': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': 
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'on_the_way': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">
              Manage and track orders for your restaurant
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/restaurant/${id}`)}
            >
              Back to Restaurant
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.pending}</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Preparing</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.preparing}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.ready}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Route</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.onRoute}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.delivered}</h3>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <h3 className="text-2xl font-bold mt-2">{stats.cancelled}</h3>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <CardTitle>Orders</CardTitle>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 md:mt-0">
                    <TabsList>
                      <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                      <TabsTrigger value="preparing">Preparing ({stats.preparing})</TabsTrigger>
                      <TabsTrigger value="ready">Ready ({stats.ready})</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders</h3>
                    <p className="text-gray-600">
                      {activeTab === 'pending' 
                        ? 'No pending orders right now' 
                        : activeTab === 'preparing'
                        ? 'No orders being prepared'
                        : 'No orders ready for delivery'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <div 
                        key={order.order_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedOrder?.order_id === order.order_id 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getStatusColor(order.status)}>
                                <span className="flex items-center space-x-1">
                                  {getStatusIcon(order.status)}
                                  <span>{order.status.replace('_', ' ')}</span>
                                </span>
                              </Badge>
                              <span className="text-sm font-medium">
                                Order #{order.order_id}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <User className="w-4 h-4 mr-2" />
                              <span>{order.customer?.user?.name || 'Customer'}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(order.total_price)}
                            </div>
                            <div className="flex items-center justify-end space-x-2 mt-2">
                              {order.orderItems && (
                                <span className="text-sm text-gray-500">
                                  {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex space-x-2 mt-4">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(order.order_id, 'accepted');
                              }}
                            >
                              Accept Order
                            </Button>
                          )}
                          
                          {order.status === 'accepted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(order.order_id, 'preparing');
                              }}
                            >
                              Start Preparing
                            </Button>
                          )}
                          
                          {(order.status === 'preparing' || order.status === 'accepted') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(order.order_id, 'ready');
                              }}
                            >
                              Mark as Ready
                            </Button>
                          )}
                          
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(order.order_id, 'cancelled');
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>
                  {selectedOrder ? `Order #${selectedOrder.order_id}` : 'Order Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedOrder ? (
                  <div className="space-y-6">
                    {/* Order Status */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-2 font-medium capitalize">
                          {selectedOrder.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Customer</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2" />
                          <span>{selectedOrder.customer?.user?.name || 'N/A'}</span>
                        </div>
                        {selectedOrder.customer?.user?.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{selectedOrder.customer.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {selectedOrder.delivery_address && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{selectedOrder.delivery_address}</span>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Items</h3>
                      <div className="space-y-2">
                        {selectedOrder.orderItems?.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <div>
                              <span className="font-medium">{item.menu_item?.name || 'Item'}</span>
                              <span className="text-gray-500 ml-2">× {item.quantity}</span>
                            </div>
                            <div>
                              {formatCurrency(item.price_at_purchase * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(selectedOrder.total_price)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Payment</h3>
                      <Badge variant={
                        selectedOrder.payment_status === 'paid' ? 'success' :
                        selectedOrder.payment_status === 'pending' ? 'warning' : 'danger'
                      }>
                        {selectedOrder.payment_status}
                      </Badge>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order placed</span>
                          <span>{formatDate(selectedOrder.created_at)}</span>
                        </div>
                        {selectedOrder.accepted_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Accepted</span>
                            <span>{formatDate(selectedOrder.accepted_at)}</span>
                          </div>
                        )}
                        {selectedOrder.picked_up_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Picked up</span>
                            <span>{formatDate(selectedOrder.picked_up_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-4 border-t">
                      {selectedOrder.status === 'pending' && (
                        <Button
                          fullWidth
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, 'accepted')}
                        >
                          Accept Order
                        </Button>
                      )}
                      
                      {selectedOrder.status === 'accepted' && (
                        <Button
                          fullWidth
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, 'preparing')}
                        >
                          Start Preparing
                        </Button>
                      )}
                      
                      {(selectedOrder.status === 'preparing' || selectedOrder.status === 'accepted') && (
                        <Button
                          fullWidth
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, 'ready')}
                        >
                          Mark as Ready for Delivery
                        </Button>
                      )}
                      
                      {selectedOrder.status === 'pending' && (
                        <Button
                          fullWidth
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleUpdateStatus(selectedOrder.order_id, 'cancelled')}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select an order to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};