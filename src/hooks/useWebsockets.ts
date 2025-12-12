// src/hooks/useWebSockets.ts
import { useEffect, useCallback, useState, useRef } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './useAuth';
import type {
  OrderUpdateEvent,
  RiderAssignedEvent,
  RiderLocationEvent,
  ChatMessageEvent,
  TypingIndicatorEvent,
  AssignmentTimeoutEvent,
  PaymentUpdateEvent,
  OrderDeliveredEvent,
} from '../types';

type OrderCallback = (data: OrderUpdateEvent | RiderAssignedEvent | PaymentUpdateEvent | OrderDeliveredEvent) => void;
type LocationCallback = (data: RiderLocationEvent) => void;
type ChatCallback = (data: ChatMessageEvent | TypingIndicatorEvent | AssignmentTimeoutEvent) => void;

export const useWebSockets = () => {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const eventCallbacksRef = useRef<(() => void)[]>([]);

  // Connection tracking
  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

  // Connect/disconnect based on auth
  useEffect(() => {
    if (isAuthenticated && user && !socketService.isConnected()) {
      socketService.connect('orders');
      socketService.connect('chat');
      socketService.connect('rider-tracking');
    }

    return () => {
      eventCallbacksRef.current.forEach(cleanup => cleanup());
      eventCallbacksRef.current = [];
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  const subscribeToOrder = useCallback((orderId: number, callback: OrderCallback) => {
    socketService.joinOrderRoom(orderId);

    const handleOrderUpdate = (data: OrderUpdateEvent) => callback(data);
    const handleRiderAssigned = (data: RiderAssignedEvent) => callback(data);
    const handlePaymentUpdate = (data: PaymentUpdateEvent) => callback(data);
    const handleOrderDelivered = (data: OrderDeliveredEvent) => callback(data);

    socketService.on('orders:order-update', handleOrderUpdate);
    socketService.on('orders:rider-assigned', handleRiderAssigned);
    socketService.on('orders:payment-update', handlePaymentUpdate);
    socketService.on('orders:order-delivered', handleOrderDelivered);

    const cleanup = () => {
      socketService.leaveOrderRoom(orderId);
      socketService.off('orders:order-update', handleOrderUpdate);
      socketService.off('orders:rider-assigned', handleRiderAssigned);
      socketService.off('orders:payment-update', handlePaymentUpdate);
      socketService.off('orders:order-delivered', handleOrderDelivered);
    };

    eventCallbacksRef.current.push(cleanup);
    return cleanup;
  }, []);

  const subscribeToRiderLocation = useCallback((riderId: number, callback: LocationCallback) => {
    socketService.subscribeRider(riderId);
    socketService.on('tracking:updateRiderLocation', callback);

    const cleanup = () => {
      socketService.unsubscribeRider(riderId);
      socketService.off('tracking:updateRiderLocation', callback);
    };

    eventCallbacksRef.current.push(cleanup);
    return cleanup;
  }, []);

  const subscribeToChat = useCallback((orderId: number, callback: ChatCallback) => {
    socketService.joinOrderRoom(orderId);

    const handleChatMessage = (data: ChatMessageEvent) => callback(data);
    const handleTypingIndicator = (data: TypingIndicatorEvent) => callback(data);
    const handleAssignmentTimeout = (data: AssignmentTimeoutEvent) => callback(data);

    socketService.on('chat:sendMessage', handleChatMessage);
    socketService.on('chat:typingStart', handleTypingIndicator);
    socketService.on('chat:assignment-timeout', handleAssignmentTimeout);

    const cleanup = () => {
      socketService.leaveOrderRoom(orderId);
      socketService.off('chat:sendMessage', handleChatMessage);
      socketService.off('chat:typingStart', handleTypingIndicator);
      socketService.off('chat:assignment-timeout', handleAssignmentTimeout);
    };

    eventCallbacksRef.current.push(cleanup);
    return cleanup;
  }, []);

  const sendMessage = useCallback((orderId: number, senderId: number, content: string, senderType: 'customer' | 'rider') => {
    socketService.sendChatMessage(orderId, senderId, content, senderType);
  }, []);

  const updateRiderLocation = useCallback((latitude: number, longitude: number, address?: string, orderId?: number) => {
    socketService.updateRiderLocation({ latitude, longitude, address, orderId });
  }, []);

  const markMessagesAsRead = useCallback((orderId: number, userId: number) => {
    socketService.markMessagesAsRead(orderId, userId);
  }, []);

  const typingStart = useCallback((orderId: number, userId: number, userType: 'customer' | 'rider') => {
    socketService.typingStart(orderId, userId, userType);
  }, []);

  const typingStop = useCallback((orderId: number, userId: number, userType: 'customer' | 'rider') => {
    socketService.typingStop(orderId, userId, userType);
  }, []);

  return {
    isConnected: isConnected && socketService.isConnected(),
    socketId: socketService.getSocketId(),
    subscribeToOrder,
    subscribeToRiderLocation,
    subscribeToChat,
    sendMessage,
    updateRiderLocation,
    markMessagesAsRead,
    typingStart,
    typingStop,
    webSocketService: socketService,
  };
};
