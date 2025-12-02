import { useEffect, useCallback, useState } from 'react';
import { webSocketService } from '../services/websocketService';
import { useAuth } from './useAuth';

export const useWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      webSocketService.connect();
      setIsConnected(true);

      return () => {
        webSocketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated]);

  const subscribeToOrder = useCallback((orderId: number, callback: (data: any) => void) => {
    webSocketService.joinOrderRoom(orderId);
    webSocketService.on('orderStatusUpdated', callback);
    webSocketService.on('riderAssigned', callback);
    webSocketService.on('orderRated', callback);
    webSocketService.on('orderDelivered', callback);

    return () => {
      webSocketService.leaveOrderRoom(orderId);
      webSocketService.off('orderStatusUpdated', callback);
      webSocketService.off('riderAssigned', callback);
      webSocketService.off('orderRated', callback);
      webSocketService.off('orderDelivered', callback);
    };
  }, []);

  const subscribeToRiderLocation = useCallback((riderId: number, callback: (data: any) => void) => {
    webSocketService.subscribeToRider(riderId);
    webSocketService.on('riderLocation', callback);
    webSocketService.on('locationUpdated', callback);

    return () => {
      webSocketService.unsubscribeFromRider(riderId);
      webSocketService.off('riderLocation', callback);
      webSocketService.off('locationUpdated', callback);
    };
  }, []);

  const subscribeToChat = useCallback((orderId: number, userId: number, userType: 'customer' | 'rider', callback: (data: any) => void) => {
    webSocketService.joinChat(orderId, userId, userType);
    webSocketService.on('newMessage', callback);
    webSocketService.on('userTyping', callback);
    webSocketService.on('unreadCountUpdate', callback);

    return () => {
      webSocketService.leaveChat(orderId, userId);
      webSocketService.off('newMessage', callback);
      webSocketService.off('userTyping', callback);
      webSocketService.off('unreadCountUpdate', callback);
    };
  }, []);

  const sendMessage = useCallback((orderId: number, senderId: number, content: string, senderType: 'customer' | 'rider') => {
    webSocketService.sendMessage(orderId, senderId, content, senderType);
  }, []);

  const updateRiderLocation = useCallback((latitude: number, longitude: number, address?: string) => {
    webSocketService.updateRiderLocation({ latitude, longitude, address });
  }, []);

  const markMessagesAsRead = useCallback((orderId: number, userId: number) => {
    webSocketService.markMessagesAsRead(orderId, userId);
  }, []);

  const typingStart = useCallback((orderId: number, userId: number, userType: 'customer' | 'rider') => {
    webSocketService.typingStart(orderId, userId, userType);
  }, []);

  const typingStop = useCallback((orderId: number, userId: number, userType: 'customer' | 'rider') => {
    webSocketService.typingStop(orderId, userId, userType);
  }, []);

  return {
    isConnected,
    subscribeToOrder,
    subscribeToRiderLocation,
    subscribeToChat,
    sendMessage,
    updateRiderLocation,
    markMessagesAsRead,
    typingStart,
    typingStop,
  };
};