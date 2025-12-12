import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useWebSockets } from './useWebsockets'; // FIXED: Changed from useWebSocket to useWebSockets
import { OrdersService } from '../services/ordersService';
import { paymentService } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { 
  Order, 
  OrderStatus, 
  Rider, 
  Customer,
  CreateOrderDto,
  CreateOrderWithPaymentData 
} from '../types';

interface OrderUpdateData {
  orderId: number;
  type: 'statusUpdate' | 'riderAssigned' | 'paymentUpdate' | 'assignment-timeout';
  status?: OrderStatus;
  rider?: Rider;
  order?: Order;
}

// FIXED: Updated to match backend DTO structure
interface PlaceOrderData {
  customer_id: number;
  restaurant_id: number;
  delivery_address: string;
  items: Array<{
    menu_item_id: number;
    quantity: number;
    special_instructions?: string;
  }>;
  notes?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
}

interface OrderWithTimer extends Order {
  timer?: NodeJS.Timeout;
}

export const useOrderWorkflow = () => {
  const { user, customer, refreshUserData } = useAuth();
  const { 
    subscribeToOrder, 
    sendMessage: sendChatMessage 
  } = useWebSockets(); // FIXED: Changed from useWebSocket to useWebSockets
  
  const navigate = useNavigate();
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderTimers, setOrderTimers] = useState<Map<number, NodeJS.Timeout>>(new Map());
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Start 5-minute timer for rider assignment
  const startAssignmentTimer = useCallback((orderId: number, createdAt: Date) => {
    console.log(`Starting 5-minute timer for order ${orderId}`);
    
    const timer = setTimeout(async () => {
      try {
        // Check if order still needs assignment
        const order = await OrdersService.getOrderById(orderId);
        
        if (order.status === 'ready' && !order.rider) {
          // Mark as requiring manual assignment
          await OrdersService.updateOrder(orderId, { requires_manual_assignment: true });
          
          // Notify customer care
          toast.error(`Order #${order.order_id} requires manual rider assignment`, {
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => navigate('/dashboard/admin/orders')
            }
          });
          
          // Emit WebSocket event for customer care dashboard
          console.log(`Order ${orderId} requires manual assignment after 5 minutes`);
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    setOrderTimers(prev => new Map(prev.set(orderId, timer)));
  }, [navigate]);

  // Clear timer when rider is assigned
  const clearAssignmentTimer = useCallback((orderId: number) => {
    const timer = orderTimers.get(orderId);
    if (timer) {
      clearTimeout(timer);
      setOrderTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
    }
  }, [orderTimers]);

  // Subscribe to order updates and manage workflow
  const trackOrder = useCallback((orderId: number) => {
    const unsubscribe = subscribeToOrder(orderId, async (data: OrderUpdateData) => {
      const { orderId: updatedOrderId, type, status, rider, order } = data;
      
      switch (type) {
        case 'statusUpdate':
          // Handle status changes
          if (status) {
            await handleStatusChange(updatedOrderId, status, rider || order?.rider);
          }
          break;
          
        case 'riderAssigned':
          // Clear timer when rider is assigned
          clearAssignmentTimer(updatedOrderId);
          if (rider?.user?.name) {
            toast.success(`Rider ${rider.user.name} assigned to your order`);
          }
          break;
          
        case 'assignment-timeout':
          // Notify customer care
          toast.warning(`Order requires manual rider assignment`);
          if (user?.role === 'customer_care' || user?.role === 'super_admin') {
            navigate('/dashboard/admin/assign-riders');
          }
          break;
          
        case 'paymentUpdate':
          if (data.status === 'paid') {
            toast.success('Payment confirmed! Your order is being processed.');
          }
          break;
      }
    });

    return unsubscribe;
  }, [subscribeToOrder, clearAssignmentTimer, user, navigate]);

  const handleStatusChange = useCallback(async (orderId: number, status: OrderStatus, rider?: Rider) => {
    try {
      // Get fresh order data
      const order = await OrdersService.getOrderById(orderId);
      
      // Update active orders list
      setActiveOrders(prev => 
        prev.map(o => 
          o.order_id === orderId 
            ? { ...order, rider: rider || order.rider }
            : o
        ).filter(o => 
          ['pending', 'accepted', 'preparing', 'ready', 'on_the_way', 'awaiting_confirmation'].includes(o.status)
        )
      );

      // Handle workflow actions
      switch (status) {
        case 'ready':
          // Start 5-minute timer for auto-assignment
          startAssignmentTimer(orderId, new Date(order.created_at));
          toast.info('Order is ready for pickup. Finding nearest rider...');
          break;

        case 'on_the_way':
          // Rider assigned, clear timer
          clearAssignmentTimer(orderId);
          if (rider?.user?.name) {
            toast.success(`Rider ${rider.user.name} is on the way to the restaurant`);
          }
          break;

        case 'awaiting_confirmation':
          // Open chat automatically if user is customer or rider
          if (user && (user.role === 'customer' || user.role === 'rider')) {
            // Auto-navigate to chat after 2 seconds
            setTimeout(() => {
              navigate(`/chat/${orderId}`);
              toast.success('Chat opened with ' + 
                (user.role === 'customer' ? 'your rider' : 'the customer'));
            }, 2000);
          }
          break;

        case 'delivered':
          // Show rating modal for customer
          if (user?.role === 'customer') {
            // Wait 3 seconds then show rating prompt
            setTimeout(() => {
              toast.success('Order delivered! How was your experience?', {
                duration: 8000,
                action: {
                  label: 'Rate Now',
                  onClick: () => {
                    // Store order ID for rating
                    sessionStorage.setItem('rate_order_id', orderId.toString());
                    navigate(`/orders/${orderId}/rate`);
                  },
                },
              });
            }, 3000);
            
            // Update customer loyalty points
            if (customer) {
              try {
                await refreshUserData();
              } catch (error) {
                console.error('Failed to update loyalty points:', error);
              }
            }
          }
          
          // For riders, show completion message
          if (user?.role === 'rider') {
            toast.success('Order delivered successfully!');
          }
          break;
          
        case 'cancelled':
          toast.error('Order has been cancelled');
          clearAssignmentTimer(orderId);
          break;
      }
    } catch (error) {
      console.error('Error handling status change:', error);
    }
  }, [user, customer, navigate, startAssignmentTimer, clearAssignmentTimer, refreshUserData]);

  // Place new order with payment - FIXED: Accepts correct data structure
  const placeOrder = useCallback(async (orderData: PlaceOrderData, paymentMethod: string = 'card'): Promise<Order | null> => {
    if (!user) {
      toast.error('Please login to continue');
      return null;
    }

    // Get customer ID properly
    const customerId = customer?.customer_id || user.user_id;
    
    setIsPlacingOrder(true);
    
    try {
      // Prepare complete order data - Convert to CreateOrderDto format
      const createOrderDto: CreateOrderDto = {
        customerId: customerId,
        restaurantId: orderData.restaurant_id,
        deliveryAddress: orderData.delivery_address,
        notes: orderData.notes,
        orderItems: orderData.items.map(item => ({
          menuItemId: item.menu_item_id,
          quantity: item.quantity,
          specialInstructions: item.special_instructions,
        })),
      };

      let order: Order;
      
      if (paymentMethod === 'cash') {
        // Create order without payment (cash on delivery)
        order = await OrdersService.createOrder(createOrderDto);
        toast.success(`Order #${order.order_id} placed successfully! Pay on delivery.`);
      } else {
        // Create order with payment
        const createWithPaymentData: CreateOrderWithPaymentData = {
          ...createOrderDto,
          paymentMethod: paymentMethod as 'card' | 'mobile_money',
          paymentDetails: {
            email: user.email,
            callbackUrl: `${window.location.origin}/payment/callback`,
          }
        };

        const result = await OrdersService.createOrderWithPayment(createWithPaymentData);
        
        order = result.order;
        
        if (result.payment?.authorizationUrl) {
          // Redirect to payment page
          window.open(result.payment.authorizationUrl, '_blank');
          toast.success('Redirecting to payment page...');
        } else {
          toast.success(`Order #${order.order_id} placed successfully!`);
        }
      }
      
      // Add to active orders
      setActiveOrders(prev => [...prev, order]);
      
      // Start tracking this order
      trackOrder(order.order_id);
      
      return order;
    } catch (error: unknown) {
      let errorMessage = 'Failed to place order';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message || errorMessage;
      }
      console.error('Order placement error:', error);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsPlacingOrder(false);
    }
  }, [customer, user, trackOrder]);

  // Process payment for existing order
  const processPayment = useCallback(async (orderId: number, paymentMethod: string) => {
    if (!user?.email) {
      toast.error('User email not found');
      return null;
    }

    setIsProcessingPayment(true);
    
    try {
      const order = await OrdersService.getOrderById(orderId);
      
      const paymentData = {
        orderId: orderId,
        amount: order.total_price,
        email: user.email,
        paymentMethod: paymentMethod as 'card' | 'mobile_money' | 'cash',
        callbackUrl: `${window.location.origin}/payment/callback`,
      };

      const payment = await paymentService.initializePayment(paymentData);
      
      if (payment.authorizationUrl) {
        // Open payment page in new tab
        window.open(payment.authorizationUrl, '_blank');
        toast.success('Redirecting to payment page...');
        
        // Start polling for payment confirmation
        const pollPayment = setInterval(async () => {
          try {
            const verified = await paymentService.verifyPayment(payment.paymentReference);
            if (verified.success) {
              clearInterval(pollPayment);
              toast.success('Payment confirmed!');
              
              // Update order status
              await OrdersService.updateOrderStatus(orderId, 'accepted');
            }
          } catch (error) {
            // Continue polling
          }
        }, 5000); // Poll every 5 seconds
      }
      
      return payment;
    } catch (error: unknown) {
      let errorMessage = 'Payment initialization failed';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message || errorMessage;
      }
      toast.error(errorMessage);
      return null;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [user]);

  // Rate order and close chat
  const rateOrder = useCallback(async (orderId: number, rating: number, feedback?: string): Promise<boolean> => {
    try {
      await OrdersService.submitRating(orderId, rating, feedback);
      
      // Update local order data
      setActiveOrders(prev => 
        prev.filter(o => o.order_id !== orderId) // Remove from active orders
      );
      
      // Add loyalty points
      if (customer && rating >= 4) {
        try {
          await refreshUserData();
        } catch (error) {
          console.error('Failed to add loyalty points:', error);
        }
      }
      
      toast.success('Thank you for your rating!');
      
      // Close chat window if open
      if (window.location.pathname.includes('/chat/')) {
        navigate('/orders');
      }
      
      return true;
    } catch (error: unknown) {
      let errorMessage = 'Failed to submit rating';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message || errorMessage;
      }
      toast.error(errorMessage);
      return false;
    }
  }, [customer, navigate, refreshUserData]);

  // Load customer's active orders
  const loadActiveOrders = useCallback(async () => {
    if (customer) {
      try {
        const orders = await OrdersService.getCustomerOrders(customer.customer_id);
        const active = orders.filter(order => 
          ['pending', 'accepted', 'preparing', 'ready', 'on_the_way', 'awaiting_confirmation'].includes(order.status)
        );
        
        setActiveOrders(active);
        
        // Start tracking all active orders
        active.forEach(order => {
          trackOrder(order.order_id);
          
          // Start timer for ready orders without rider
          if (order.status === 'ready' && !order.rider) {
            startAssignmentTimer(order.order_id, new Date(order.created_at));
          }
        });
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    }
  }, [customer, trackOrder, startAssignmentTimer]);

  // For riders: Get available orders
  const getAvailableOrders = useCallback(async (): Promise<Order[]> => {
    if (user?.role === 'rider') {
      try {
        const orders = await OrdersService.getReadyOrders();
        return orders.filter(order => 
          order.status === 'ready' && 
          !order.rider &&
          !order.requires_manual_assignment
        );
      } catch (error) {
        console.error('Failed to get available orders:', error);
        return [];
      }
    }
    return [];
  }, [user]);

  // For riders: Accept order
  const acceptOrderAsRider = useCallback(async (orderId: number): Promise<boolean> => {
    if (!user || user.role !== 'rider') {
      toast.error('Only riders can accept orders');
      return false;
    }

    try {
      await OrdersService.assignRider(orderId, user.user_id);
      await OrdersService.updateOrderStatus(orderId, 'on_the_way');
      
      toast.success('Order accepted! Please proceed to the restaurant.');
      
      // Start tracking this order
      trackOrder(orderId);
      
      return true;
    } catch (error: unknown) {
      let errorMessage = 'Failed to accept order';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message || errorMessage;
      }
      toast.error(errorMessage);
      return false;
    }
  }, [user, trackOrder]);

  // For customer care: Manually assign rider
  const manuallyAssignRider = useCallback(async (orderId: number, riderId: number): Promise<boolean> => {
    if (!user || (user.role !== 'customer_care' && user.role !== 'super_admin')) {
      toast.error('Only customer care can manually assign riders');
      return false;
    }

    try {
      await OrdersService.assignRider(orderId, riderId);
      await OrdersService.updateOrderStatus(orderId, 'on_the_way');
      
      toast.success('Rider assigned manually');
      clearAssignmentTimer(orderId);
      
      return true;
    } catch (error: unknown) {
      let errorMessage = 'Failed to assign rider';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message || errorMessage;
      }
      toast.error(errorMessage);
      return false;
    }
  }, [user, clearAssignmentTimer]);

  // Helper functions
  const shouldOpenChat = useCallback((orderStatus: OrderStatus, riderAssigned: boolean): boolean => {
    return (orderStatus === 'on_the_way' || orderStatus === 'awaiting_confirmation') && riderAssigned;
  }, []);

  const shouldRateOrder = useCallback((orderStatus: OrderStatus, isRated: boolean): boolean => {
    return orderStatus === 'delivered' && !isRated;
  }, []);

  const shouldNotifyCustomerCare = useCallback((orderStatus: OrderStatus, createdAt: Date, assignmentAttempts: number): boolean => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return orderStatus === 'ready' && 
           createdAt <= fiveMinutesAgo && 
           assignmentAttempts >= 2;
  }, []);

  const getOrderStatusText = useCallback((status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
      'pending': 'Order placed',
      'accepted': 'Restaurant accepted',
      'preparing': 'Preparing your food',
      'ready': 'Ready for pickup',
      'on_the_way': 'On the way',
      'awaiting_confirmation': 'Awaiting confirmation',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || status;
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (customer) {
      loadActiveOrders();
    }
  }, [customer, loadActiveOrders]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      orderTimers.forEach(timer => clearTimeout(timer));
    };
  }, [orderTimers]);

  return {
    activeOrders,
    isPlacingOrder,
    isProcessingPayment,
    placeOrder,
    processPayment,
    rateOrder,
    getAvailableOrders,
    acceptOrderAsRider,
    manuallyAssignRider,
    loadActiveOrders,
    shouldOpenChat,
    shouldRateOrder,
    shouldNotifyCustomerCare,
    getOrderStatusText,
  };
};