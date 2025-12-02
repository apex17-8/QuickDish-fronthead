import { createSlice } from '@reduxjs/toolkit';
import type{PayloadAction} from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // Auto-remove after duration (ms)
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };

      state.notifications.unshift(newNotification); // Add to beginning for newest first
      state.unreadCount += 1;

      // Auto-remove notification after duration (default: 5 seconds)
      const duration = action.payload.duration || 5000;
      if (duration > 0) {
        setTimeout(() => {
          // We can't dispatch here directly, so we'll handle auto-removal in component
          // Or use a thunk for this
        }, duration);
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
        }
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter(n => !n.read);
      // unreadCount remains the same as we only removed read notifications
    },

    updateNotification: (state, action: PayloadAction<{ id: string; updates: Partial<Notification> }>) => {
      const notification = state.notifications.find(n => n.id === action.payload.id);
      if (notification) {
        const wasUnread = !notification.read;
        const willBeUnread = action.payload.updates.read === undefined ? 
          !notification.read : !action.payload.updates.read;
        
        Object.assign(notification, action.payload.updates);
        
        // Update unread count if read status changed
        if (wasUnread && !willBeUnread) {
          state.unreadCount -= 1;
        } else if (!wasUnread && willBeUnread) {
          state.unreadCount += 1;
        }
      }
    },

    // Bulk operations
    addMultipleNotifications: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>[]>) => {
      const newNotifications: Notification[] = action.payload.map(notification => ({
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        read: false,
      }));

      state.notifications.unshift(...newNotifications);
      state.unreadCount += newNotifications.length;
    },

    // System notifications (predefined types)
    addSuccessNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        type: 'success',
        timestamp: new Date(),
        read: false,
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    addErrorNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        type: 'error',
        timestamp: new Date(),
        read: false,
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    addWarningNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        type: 'warning',
        timestamp: new Date(),
        read: false,
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    addInfoNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        type: 'info',
        timestamp: new Date(),
        read: false,
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    // Order-specific notifications
    addOrderNotification: (state, action: PayloadAction<{ 
      orderId: number; 
      status: string; 
      restaurantName?: string;
    }>) => {
      const { orderId, status, restaurantName } = action.payload;
      let title = '';
      let message = '';
      let type: Notification['type'] = 'info';

      switch (status) {
        case 'placed':
          title = 'Order Placed';
          message = `Your order #${orderId} has been placed successfully`;
          type = 'success';
          break;
        case 'preparing':
          title = 'Order Preparing';
          message = `Restaurant ${restaurantName || ''} is preparing your order #${orderId}`;
          type = 'info';
          break;
        case 'on_the_way':
          title = 'Order on the way!';
          message = `Your order #${orderId} is out for delivery`;
          type = 'info';
          break;
        case 'delivered':
          title = 'Order Delivered';
          message = `Your order #${orderId} has been delivered`;
          type = 'success';
          break;
        case 'cancelled':
          title = 'Order Cancelled';
          message = `Your order #${orderId} has been cancelled`;
          type = 'warning';
          break;
        default:
          title = 'Order Update';
          message = `Order #${orderId} status updated to ${status}`;
          type = 'info';
      }

      const notification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'View Order',
          onClick: () => {
            window.location.href = `/track-order/${orderId}`;
          },
        },
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    // Payment notifications
    addPaymentNotification: (state, action: PayloadAction<{
      paymentId: number;
      status: 'success' | 'failed' | 'pending';
      amount: number;
    }>) => {
      const { paymentId, status, amount } = action.payload;
      let title = '';
      let message = '';
      let type: Notification['type'] = 'info';

      switch (status) {
        case 'success':
          title = 'Payment Successful';
          message = `Payment of KSh ${amount} was successful`;
          type = 'success';
          break;
        case 'failed':
          title = 'Payment Failed';
          message = `Payment of KSh ${amount} failed. Please try again`;
          type = 'error';
          break;
        case 'pending':
          title = 'Payment Pending';
          message = `Payment of KSh ${amount} is being processed`;
          type = 'warning';
          break;
      }

      const notification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        timestamp: new Date(),
        read: false,
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    // Chat notifications
    addChatNotification: (state, action: PayloadAction<{
      orderId: number;
      senderName: string;
      message: string;
    }>) => {
      const { orderId, senderName, message } = action.payload;

      const notification: Notification = {
        id: Date.now().toString(),
        title: `New message from ${senderName}`,
        message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
        type: 'info',
        timestamp: new Date(),
        read: false,
        action: {
          label: 'Reply',
          onClick: () => {
            // Focus on chat input for this order
            const chatInput = document.querySelector(`[data-order-id="${orderId}"]`);
            if (chatInput) {
              (chatInput as HTMLElement).focus();
            }
          },
        },
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    // Rider-specific notifications
    addRiderNotification: (state, action: PayloadAction<{
      orderId: number;
      type: 'assigned' | 'picked_up' | 'delivered';
    }>) => {
      const { orderId, type } = action.payload;
      let title = '';
      let message = '';
      let notificationType: Notification['type'] = 'info';

      switch (type) {
        case 'assigned':
          title = 'New Order Assigned';
          message = `You have been assigned to deliver order #${orderId}`;
          notificationType = 'info';
          break;
        case 'picked_up':
          title = 'Order Picked Up';
          message = `You have picked up order #${orderId}`;
          notificationType = 'success';
          break;
        case 'delivered':
          title = 'Order Delivered';
          message = `You have successfully delivered order #${orderId}`;
          notificationType = 'success';
          break;
      }

      const notification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        type: notificationType,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'View Details',
          onClick: () => {
            window.location.href = `/dashboard/rider`;
          },
        },
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    // Restaurant-specific notifications
    addRestaurantNotification: (state, action: PayloadAction<{
      orderId: number;
      type: 'new_order' | 'order_ready' | 'order_cancelled';
    }>) => {
      const { orderId, type } = action.payload;
      let title = '';
      let message = '';
      let notificationType: Notification['type'] = 'info';

      switch (type) {
        case 'new_order':
          title = 'New Order Received';
          message = `New order #${orderId} has been placed`;
          notificationType = 'info';
          break;
        case 'order_ready':
          title = 'Order Ready';
          message = `Order #${orderId} is ready for pickup`;
          notificationType = 'success';
          break;
        case 'order_cancelled':
          title = 'Order Cancelled';
          message = `Order #${orderId} has been cancelled`;
          notificationType = 'warning';
          break;
      }

      const notification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        type: notificationType,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'Manage Orders',
          onClick: () => {
            window.location.href = `/dashboard/restaurant`;
          },
        },
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  clearReadNotifications,
  updateNotification,
  addMultipleNotifications,
  addSuccessNotification,
  addErrorNotification,
  addWarningNotification,
  addInfoNotification,
  addOrderNotification,
  addPaymentNotification,
  addChatNotification,
  addRiderNotification,
  addRestaurantNotification,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications;

export const selectUnreadNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications.filter(n => !n.read);

export const selectUnreadCount = (state: { notifications: NotificationState }) => 
  state.notifications.unreadCount;

export const selectNotificationsByType = (type: Notification['type']) => 
  (state: { notifications: NotificationState }) => 
    state.notifications.notifications.filter(n => n.type === type);

export const selectRecentNotifications = (count: number = 5) => 
  (state: { notifications: NotificationState }) => 
    state.notifications.notifications.slice(0, count);

export const selectNotificationById = (id: string) => 
  (state: { notifications: NotificationState }) => 
    state.notifications.notifications.find(n => n.id === id);

export default notificationSlice.reducer;