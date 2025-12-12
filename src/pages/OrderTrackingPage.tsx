import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Clock,
  MapPin,
  User,
  Phone,
  ChefHat,
  Navigation,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Share2,
  Printer
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { OrdersService } from '../services/ordersService';
import { useWebSockets } from '../hooks/useWebsockets';
import type { 
  Order, 
  OrderStatus, 
  OrderUpdateEvent, 
  RiderLocationEvent,
  RiderAssignedEvent,
  PaymentUpdateEvent,
  OrderDeliveredEvent 
} from '../types';
import toast from 'react-hot-toast';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState<string>('25-35 min');
  
  const { subscribeToOrder, subscribeToRiderLocation } = useWebSockets();

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  useEffect(() => {
    if (order?.rider?.rider_id) {
      // Subscribe to rider location updates
      const unsubscribeLocation = subscribeToRiderLocation(
        order.rider.rider_id,
        (location: RiderLocationEvent) => {
          setRiderLocation({ 
            lat: location.latitude, 
            lng: location.longitude 
          });
        }
      );

      // Subscribe to order updates - Handle all possible event types
      const unsubscribeOrder = subscribeToOrder(
        order.order_id,
        (data: OrderUpdateEvent | RiderAssignedEvent | PaymentUpdateEvent | OrderDeliveredEvent) => {
          // Handle different event types
          // Type guard for OrderUpdateEvent
          if ('status' in data && 'updatedAt' in data) {
            fetchOrderDetails();
            toast.success(`Order status updated to ${data.status}`);
          }
          // Type guard for RiderAssignedEvent
          else if ('riderId' in data && 'assignedAt' in data) {
            fetchOrderDetails();
            toast.success('Rider assigned to your order!');
          }
          // Type guard for PaymentUpdateEvent
          else if ('paymentStatus' in data && 'amountPaid' in data) {
            if (data.paymentStatus === 'paid') {
              toast.success('Payment confirmed!');
            }
          }
          // Type guard for OrderDeliveredEvent
          else if ('deliveredAt' in data && 'riderId' in data) {
            toast.success('Order delivered!');
            fetchOrderDetails();
          }
        }
      );

      return () => {
        unsubscribeLocation();
        unsubscribeOrder();
      };
    }
  }, [order?.rider?.rider_id, order?.order_id, subscribeToOrder, subscribeToRiderLocation]);

  const fetchOrderDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const orderData = await OrdersService.getOrderWithDetails(parseInt(id));
      setOrder(orderData);
      
      // Calculate estimated time based on status
      const statusTimes: Record<OrderStatus, string> = {
        pending: '40-50 min',
        preparing: '30-40 min',
        ready: '25-35 min',
        on_the_way: '15-25 min',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        accepted: '35-45 min',
        awaiting_confirmation: '5-10 min',
      };
      
      setEstimatedTime(statusTimes[orderData.status] || '25-35 min');
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending' as OrderStatus, label: 'Order Placed', icon: Package },
      { status: 'preparing' as OrderStatus, label: 'Preparing', icon: ChefHat },
      { status: 'ready' as OrderStatus, label: 'Ready', icon: CheckCircle },
      { status: 'on_the_way' as OrderStatus, label: 'On the Way', icon: Navigation },
      { status: 'delivered' as OrderStatus, label: 'Delivered', icon: CheckCircle },
    ];

    return steps.map((step, index) => {
      const StepIcon = step.icon;
      let stepStatus: 'pending' | 'completed' | 'current' = 'pending';
      
      if (order) {
        const stepIndex = steps.findIndex(s => s.status === step.status);
        const currentIndex = steps.findIndex(s => s.status === order.status);
        
        if (stepIndex < currentIndex) {
          stepStatus = 'completed';
        } else if (stepIndex === currentIndex) {
          stepStatus = 'current';
        } else if (order.status === 'delivered' && step.status === 'delivered') {
          stepStatus = 'completed';
        } else if (order.status === 'cancelled') {
          stepStatus = 'pending'; // Reset all steps if cancelled
        }
      }

      return {
        ...step,
        stepStatus,
        StepIcon,
        isLast: index === steps.length - 1,
      };
    });
  };

  const handleContactRider = () => {
    if (order?.rider?.user?.phone) {
      window.open(`tel:${order.rider.user.phone}`, '_blank');
    }
  };

  const handleContactRestaurant = () => {
    if (order?.restaurant?.phone) {
      window.open(`tel:${order.restaurant.phone}`, '_blank');
    }
  };

  const handleShareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order #${order?.order_id}`,
          text: `Track my QuickFood order #${order?.order_id}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-8">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/orders">
              <Button variant="primary">View All Orders</Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <div className="flex items-center mt-2">
                <Badge variant="info" className="mr-3">
                  #{order.order_id}
                </Badge>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Estimated delivery: {estimatedTime}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                leftIcon={<Share2 className="w-4 h-4" />} 
                onClick={handleShareOrder}
              >
                Share
              </Button>
              <Button 
                variant="outline" 
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Tracking & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {/* Steps */}
                    <div className="space-y-8 relative">
                      {statusSteps.map((step, index) => (
                        <div key={step.status} className="flex items-start">
                          <div className="relative z-10">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              step.stepStatus === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : step.stepStatus === 'current'
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <step.StepIcon className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="ml-6 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">{step.label}</h3>
                              {step.stepStatus === 'completed' && (
                                <Badge variant="success">Completed</Badge>
                              )}
                              {step.stepStatus === 'current' && (
                                <Badge variant="warning">In Progress</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mt-1">
                              {step.stepStatus === 'completed'
                                ? 'Step completed successfully'
                                : step.stepStatus === 'current'
                                ? 'Currently in this stage'
                                : 'Waiting to start'}
                            </p>
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
                  <div className="space-y-4">
                    {order.orderItems?.map((item) => (
                      <div key={item.order_item_id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 mr-4 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">{item.menu_item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            {item.special_instructions && (
                              <p className="text-sm text-gray-500 italic">
                                Note: {item.special_instructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-bold">KSh {(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>KSh {order.total_price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact & Info */}
            <div className="space-y-6">
              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Delivery Address</span>
                    </div>
                    <p className="font-medium">{order.delivery_address}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Special Instructions</div>
                      <p className="font-medium">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rider Info */}
                  {order.rider && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <User className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">Rider Assigned</span>
                      </div>
                      <p className="text-sm">{order.rider.user.name}</p>
                      <div className="flex items-center mt-2">
                        <Phone className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm">{order.rider.user.phone}</span>
                      </div>
                      <div className="mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          leftIcon={<MessageSquare className="w-4 h-4" />}
                          onClick={handleContactRider}
                        >
                          Contact Rider
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Restaurant Info */}
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <ChefHat className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="font-medium">Restaurant</span>
                    </div>
                    <p className="text-sm">{order.restaurant.name}</p>
                    <div className="flex items-center mt-2">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm">{order.restaurant.phone}</span>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={handleContactRestaurant}
                      >
                        Contact Restaurant
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Live tracking map</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {riderLocation
                          ? `Rider is nearby (${riderLocation.lat.toFixed(4)}, ${riderLocation.lng.toFixed(4)})`
                          : order.rider
                          ? 'Waiting for location update'
                          : 'No rider assigned yet'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};