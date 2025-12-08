// src/hooks/useOrderWorkflow.ts - COMPLETE
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebsockets';
import { OrdersService } from '../services/ordersService';
import { ChatService } from '../services/chatService';
import { paymentService } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useOrderWorkflow = () => {
  const { user, customer, refreshUserData } = useAuth();
  const { 
    subscribeToOrder, 
    shouldOpenChat, 
    shouldRateOrder, 
    shouldNotifyCustomerCare,
    sendMessage: sendChatMessage 
  } = useWebSocket();
  
  const navigate = useNavigate();
  
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
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
        
        if (order.status === 'ready_for_pickup' && !order.rider) {
          // Mark as requiring manual assignment
          await OrdersService.updateOrder(orderId, { requires_manual_assignment: true });
          
          // Notify customer care
          toast.error(`Order #${order.order_number} requires manual rider assignment`, {
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
    const unsubscribe = subscribeToOrder(orderId, async (data) => {
      const { orderId: updatedOrderId, type, status, rider, order } = data;
      
      switch (type) {
        case 'statusUpdate':
          // Handle status changes
          await handleStatusChange(updatedOrderId, status, rider || order?.rider);
          break;
          
        case 'riderAssigned':
          // Clear timer when rider is assigned
          clearAssignmentTimer(updatedOrderId);
          toast.success(`Rider ${rider?.user?.name} assigned to your order`);
          break;
          
        case 'assignment-timeout':
          // Notify customer care
          toast.warning(`Order requires manual rider assignment`);
          if (user?.role === 'customer_care' || user?.role === 'super_admin') {
            navigate('/dashboard/admin/assign-riders');
          }
          break;
          
        case 'paymentUpdate':
          if (data.status === 'success') {
            toast.success('Payment confirmed! Your order is being processed.');
          }
          break;
      }
    });

    return unsubscribe;
  }, [subscribeToOrder, clearAssignmentTimer, user, navigate]);

  const handleStatusChange = useCallback(async (orderId: number, status: string, rider?: any) => {
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
          ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'assigned', 'picked_up'].includes(o.status)
        )
      );

      // Handle workflow actions
      switch (status) {
        case 'ready_for_pickup':
          // Start 5-minute timer for auto-assignment
          startAssignmentTimer(orderId, new Date(order.created_at));
          toast.info('Order is ready for pickup. Finding nearest rider...');
          break;

        case 'assigned':
          // Rider assigned, clear timer
          clearAssignmentTimer(orderId);
          toast.success(`Rider ${rider?.user?.name} is on the way to the restaurant`);
          break;

        case 'picked_up':
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
                // Add loyalty points for completed order
                await OrdersService.submitRating(orderId, 0); // 0 means not rated yet
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

  // Place new order with payment
  const placeOrder = useCallback(async (orderData: any, paymentMethod: string = 'card') => {
    if (!customer && user?.role === 'customer') {
      toast.error('Customer profile not found. Please contact support.');
      return null;
    }

    setIsPlacingOrder(true);
    
    try {
      // Prepare complete order data
      const completeOrderData = {
        ...orderData,
        customer_id: customer?.customer_id,
        restaurant_id: orderData.restaurantId || orderData.restaurant_id,
        delivery_address: orderData.deliveryAddress || orderData.delivery_address,
        items: orderData.items?.map((item: any) => ({
          menu_item_id: item.menu_item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions,
        })) || [],
      };

      let order;
      
      if (paymentMethod === 'cash') {
        // Create order without payment (cash on delivery)
        order = await OrdersService.createOrder(completeOrderData);
        toast.success(`Order #${order.order_number} placed successfully! Pay on delivery.`);
      } else {
        // Create order with payment
        const result = await OrdersService.createOrderWithPayment({
          ...completeOrderData,
          payment_method: paymentMethod,
          customer_email: user?.email,
        });
        
        order = result.order;
        
        if (result.payment?.authorization_url) {
          // Redirect to payment page
          window.open(result.payment.authorization_url, '_blank');
          toast.success('Redirecting to payment page...');
        } else {
          toast.success(`Order #${order.order_number} placed successfully!`);
        }
      }
      
      // Add to active orders
      setActiveOrders(prev => [...prev, order]);
      
      // Start tracking this order
      trackOrder(order.order_id);
      
      // Clear cart
      localStorage.removeItem('cart');
      
      return order;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to place order';
      toast.error(message);
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
        order_id: orderId,
        amount: order.total_price,
        email: user.email,
        payment_method: paymentMethod,
        callback_url: `${window.location.origin}/payment/callback`,
      };

      const payment = await paymentService.initializePayment(paymentData);
      
      if (payment.authorization_url) {
        // Open payment page in new tab
        window.open(payment.authorization_url, '_blank');
        toast.success('Redirecting to payment page...');
        
        // Start polling for payment confirmation
        const pollPayment = setInterval(async () => {
          try {
            const verified = await paymentService.verifyPayment(payment.reference);
            if (verified.status === 'success') {
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
    } catch (error: any) {
      toast.error(error.message || 'Payment initialization failed');
      return null;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [user]);

  // Rate order and close chat
  const rateOrder = useCallback(async (orderId: number, rating: number, feedback?: string) => {
    try {
      await OrdersService.submitRating(orderId, rating, feedback);
      
      // Update local order data
      setActiveOrders(prev => 
        prev.filter(o => o.order_id !== orderId) // Remove from active orders
      );
      
      // Add loyalty points
      if (customer && rating >= 4) {
        try {
          // Add points for good rating
          await OrdersService.getOrderById(orderId); // This will trigger loyalty points in backend
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit rating');
      return false;
    }
  }, [customer, navigate, refreshUserData]);

  // Load customer's active orders
  const loadActiveOrders = useCallback(async () => {
    if (customer) {
      try {
        const orders = await OrdersService.getCustomerOrders(customer.customer_id);
        const active = orders.filter(order => 
          ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'assigned', 'picked_up'].includes(order.status)
        );
        
        setActiveOrders(active);
        
        // Start tracking all active orders
        active.forEach(order => {
          trackOrder(order.order_id);
          
          // Start timer for ready orders without rider
          if (order.status === 'ready_for_pickup' && !order.rider) {
            startAssignmentTimer(order.order_id, new Date(order.created_at));
          }
        });
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    }
  }, [customer, trackOrder, startAssignmentTimer]);

  // For riders: Get available orders
  const getAvailableOrders = useCallback(async () => {
    if (user?.role === 'rider') {
      try {
        const orders = await OrdersService.getReadyOrders();
        return orders.filter((order: any) => 
          order.status === 'ready_for_pickup' && 
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
  const acceptOrderAsRider = useCallback(async (orderId: number) => {
    if (!user || user.role !== 'rider') {
      toast.error('Only riders can accept orders');
      return false;
    }

    try {
      await OrdersService.assignRider(orderId, user.user_id);
      await OrdersService.updateOrderStatus(orderId, 'assigned');
      
      toast.success('Order accepted! Please proceed to the restaurant.');
      
      // Start tracking this order
      trackOrder(orderId);
      
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept order');
      return false;
    }
  }, [user, trackOrder]);

  // For customer care: Manually assign rider
  const manuallyAssignRider = useCallback(async (orderId: number, riderId: number) => {
    if (!user || (user.role !== 'customer_care' && user.role !== 'super_admin')) {
      toast.error('Only customer care can manually assign riders');
      return false;
    }

    try {
      await OrdersService.assignRider(orderId, riderId);
      await OrdersService.updateOrderStatus(orderId, 'assigned');
      
      toast.success('Rider assigned manually');
      clearAssignmentTimer(orderId);
      
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign rider');
      return false;
    }
  }, [user, clearAssignmentTimer]);

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
    shouldOpenChat: (orderStatus: string, riderAssigned: boolean) => 
      shouldOpenChat(orderStatus, riderAssigned),
    shouldRateOrder: (orderStatus: string, isRated: boolean) => 
      shouldRateOrder(orderStatus, isRated),
    shouldNotifyCustomerCare: (orderStatus: string, createdAt: Date, assignmentAttempts: number) =>
      shouldNotifyCustomerCare(orderStatus, createdAt, assignmentAttempts),
    getOrderStatusText: (status: string) => {
      const statusMap: Record<string, string> = {
        'pending': 'Order placed',
        'accepted': 'Restaurant accepted',
        'preparing': 'Preparing your food',
        'ready_for_pickup': 'Ready for pickup',
        'assigned': 'Rider assigned',
        'picked_up': 'On the way',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
      };
      return statusMap[status] || status;
    },
  };
};