import { useDispatch } from 'react-redux';
import {
  addNotification,
  addSuccessNotification,
  addErrorNotification,
  addWarningNotification,
  addInfoNotification,
  addOrderNotification,
  addPaymentNotification,
  addChatNotification,
  addRiderNotification,
  addRestaurantNotification,
} from '../store/slices/notificationSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();

  const showNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    dispatch(
      addNotification({
        title,
        message,
        type,
        ...options,
      })
    );
  };

  const showSuccess = (title: string, message: string, options?: any) => {
    dispatch(addSuccessNotification({ title, message, ...options }));
  };

  const showError = (title: string, message: string, options?: any) => {
    dispatch(addErrorNotification({ title, message, ...options }));
  };

  const showWarning = (title: string, message: string, options?: any) => {
    dispatch(addWarningNotification({ title, message, ...options }));
  };

  const showInfo = (title: string, message: string, options?: any) => {
    dispatch(addInfoNotification({ title, message, ...options }));
  };

  const showOrderNotification = (
    orderId: number,
    status: string,
    restaurantName?: string
  ) => {
    dispatch(addOrderNotification({ orderId, status, restaurantName }));
  };

  const showPaymentNotification = (
    paymentId: number,
    status: 'success' | 'failed' | 'pending',
    amount: number
  ) => {
    dispatch(addPaymentNotification({ paymentId, status, amount }));
  };

  const showChatNotification = (
    orderId: number,
    senderName: string,
    message: string
  ) => {
    dispatch(addChatNotification({ orderId, senderName, message }));
  };

  const showRiderNotification = (
    orderId: number,
    type: 'assigned' | 'picked_up' | 'delivered'
  ) => {
    dispatch(addRiderNotification({ orderId, type }));
  };

  const showRestaurantNotification = (
    orderId: number,
    type: 'new_order' | 'order_ready' | 'order_cancelled'
  ) => {
    dispatch(addRestaurantNotification({ orderId, type }));
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showOrderNotification,
    showPaymentNotification,
    showChatNotification,
    showRiderNotification,
    showRestaurantNotification,
  };
};