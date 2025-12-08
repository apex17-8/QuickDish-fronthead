// src/pages/dashboards/RiderOrderDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, Phone, User,
  Clock, DollarSign, MessageSquare, Navigation,
  CheckCircle, AlertCircle, Truck, Home
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const RiderOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadOrderDetails();
      loadChatMessages();
      setupLocationTracking();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/orders/${id}/details`);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/dashboard/rider');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatMessages = async () => {
    try {
      const response = await api.get(`/messages/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const setupLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const updateOrderStatus = async (status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      loadOrderDetails();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post('/messages', {
        orderId: parseInt(id!),
        senderId: user?.user_id,
        senderType: 'rider',
        content: newMessage,
      });
      setNewMessage('');
      loadChatMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    toast.success('Delivery tracking started');
    // In real app, this would start WebSocket connection for live tracking
  };

  const confirmDelivery = async () => {
    if (!window.confirm('Confirm that you have delivered this order?')) {
      return;
    }

    try {
      await api.patch(`/orders/${id}/confirm-rider`);
      toast.success('Delivery confirmed!');
      navigate('/dashboard/rider');
    } catch (error) {
      toast.error('Failed to confirm delivery');
    }
  };

  const getDirections = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
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

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
            <Button onClick={() => navigate('/dashboard/rider')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/rider')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_id}</h1>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(order.status)}
                <span className="text-sm text-gray-600">
                  Created: {formatDate(order.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<MessageSquare className="w-4 h-4" />}
              onClick={() => document.getElementById('chat')?.scrollIntoView()}
            >
              Chat
            </Button>
            <Button
              variant="outline"
              leftIcon={<Navigation className="w-4 h-4" />}
              onClick={() => getDirections(order.delivery_address)}
            >
              Get Directions
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Status Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {order.status === 'ready' && (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => updateOrderStatus('on_the_way')}
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Start Delivery
                      </Button>
                    )}
                    
                    {order.status === 'on_the_way' && (
                      <>
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={startTracking}
                          disabled={isTracking}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          {isTracking ? 'Tracking...' : 'Start Tracking'}
                        </Button>
                        
                        <Button
                          variant="success"
                          fullWidth
                          onClick={() => updateOrderStatus('delivered')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Delivered
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'delivered' && !order.rider_confirmed && (
                      <Button
                        variant="success"
                        fullWidth
                        onClick={confirmDelivery}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Delivery
                      </Button>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {[
                      { status: 'Order Placed', time: order.created_at, icon: Package },
                      { status: 'Accepted', time: order.accepted_at, icon: CheckCircle },
                      { status: 'Preparing', time: order.status === 'preparing' ? new Date() : null, icon: Clock },
                      { status: 'Ready for Pickup', time: order.status === 'ready' ? new Date() : null, icon: AlertCircle },
                      { status: 'On The Way', time: order.status === 'on_the_way' ? new Date() : null, icon: Truck },
                      { status: 'Delivered', time: order.status === 'delivered' ? new Date() : null, icon: Home },
                    ].map((step, index) => (
                      <div key={index} className="relative mb-8 last:mb-0">
                        <div className={`absolute -left-11 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.time ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <step.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className={`${step.time ? 'text-gray-900' : 'text-gray-400'}`}>
                          <h3 className="font-medium">{step.status}</h3>
                          {step.time && (
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(step.time)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.orderItems?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.menu_item?.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.special_instructions && (
                          <p className="text-sm text-gray-500 mt-1">
                            Note: {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.price_at_purchase * item.quantity)}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price_at_purchase)} each
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(order.total_price)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card id="chat">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat with Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto space-y-3 p-2">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg max-w-xs ${
                            message.sender?.user_id === user?.user_id
                              ? 'bg-orange-100 ml-auto'
                              : 'bg-gray-100'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.sent_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Button onClick={sendMessage}>
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">{order.customer?.user?.name}</h3>
                      <p className="text-sm text-gray-600">Customer</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{order.customer?.user?.phone || 'No phone'}</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => window.open(`tel:${order.customer?.user?.phone}`)}
                      disabled={!order.customer?.user?.phone}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Customer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Pickup Location</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                        <div>
                          <p className="font-medium">{order.restaurant?.name}</p>
                          <p className="text-sm text-gray-600">{order.restaurant?.address}</p>
                          <p className="text-sm text-gray-600 mt-1">{order.restaurant?.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start">
                        <Home className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                        <p className="text-gray-700">{order.delivery_address}</p>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Delivery Notes</p>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Total</span>
                    <span className="font-medium">{formatCurrency(order.total_price)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">KES 150</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Your Earnings</span>
                      <span>KES 150</span>
                    </div>
                  </div>
                  
                  <div className="pt-3">
                    <Badge variant={
                      order.payment_status === 'paid' ? 'success' :
                      order.payment_status === 'pending' ? 'warning' : 'danger'
                    }>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => getDirections(order.delivery_address)}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => window.open(`tel:${order.restaurant?.phone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Restaurant
                </Button>
                
                {(order.status === 'on_the_way' || order.status === 'ready') && (
                  <Button
                    variant="outline"
                    fullWidth
                    className="text-red-600"
                    onClick={() => {
                      if (window.confirm('Cancel this delivery?')) {
                        // Call cancel API
                        toast.info('Delivery cancellation requested');
                      }
                    }}
                  >
                    Cancel Delivery
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};