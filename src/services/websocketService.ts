import { io, Socket } from 'socket.io-client';
import type{ OrderUpdateEvent, RiderLocationUpdate, Message } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  connect(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000', {
      transports: ['websocket', 'polling'],
      auth: {
        token: token,
      },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.emit('authenticate', { token });
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Listen for order updates
    this.socket.on('orderStatusUpdated', (data: OrderUpdateEvent) => {
      this.notifyListeners('orderStatusUpdated', data);
    });

    this.socket.on('riderAssigned', (data: any) => {
      this.notifyListeners('riderAssigned', data);
    });

    this.socket.on('orderRated', (data: any) => {
      this.notifyListeners('orderRated', data);
    });

    this.socket.on('orderDelivered', (data: any) => {
      this.notifyListeners('orderDelivered', data);
    });

    // Listen for rider location updates
    this.socket.on('locationUpdated', (data: RiderLocationUpdate) => {
      this.notifyListeners('locationUpdated', data);
    });

    this.socket.on('riderLocation', (data: RiderLocationUpdate) => {
      this.notifyListeners('riderLocation', data);
    });

    // Listen for chat messages
    this.socket.on('newMessage', (message: Message) => {
      this.notifyListeners('newMessage', message);
    });

    this.socket.on('userTyping', (data: any) => {
      this.notifyListeners('userTyping', data);
    });

    this.socket.on('unreadCountUpdate', (data: any) => {
      this.notifyListeners('unreadCountUpdate', data);
    });

    this.socket.on('chatCleared', (data: any) => {
      this.notifyListeners('chatCleared', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit:', event);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  // Order room management
  joinOrderRoom(orderId: number): void {
    this.emit('joinOrderRoom', { orderId });
    this.emit('subscribeOrder', { orderId });
  }

  leaveOrderRoom(orderId: number): void {
    this.emit('leaveOrderRoom', { orderId });
    this.emit('unsubscribeOrder', { orderId });
  }

  // Rider location subscription
  subscribeToRider(riderId: number): void {
    this.emit('subscribeRider', { riderId });
  }

  unsubscribeFromRider(riderId: number): void {
    this.emit('unsubscribeRider', { riderId });
  }

  updateRiderLocation(location: { latitude: number; longitude: number; address?: string }): void {
    this.emit('updateLocation', location);
  }

  // Chat management
  joinChat(orderId: number, userId: number, userType: 'customer' | 'rider'): void {
    this.emit('joinChat', { orderId, userId, userType });
  }

  leaveChat(orderId: number, userId: number): void {
    this.emit('leaveChat', { orderId, userId });
  }

  sendMessage(orderId: number, senderId: number, content: string, senderType: 'customer' | 'rider'): void {
    this.emit('sendMessage', { orderId, senderId, content, senderType });
  }

  markMessagesAsRead(orderId: number, userId: number): void {
    this.emit('markMessagesAsRead', { orderId, userId });
  }

  getUnreadCount(orderId: number, userId: number): void {
    this.emit('getUnreadCount', { orderId, userId });
  }

  typingStart(orderId: number, userId: number, userType: 'customer' | 'rider'): void {
    this.emit('typingStart', { orderId, userId, userType });
  }

  typingStop(orderId: number, userId: number, userType: 'customer' | 'rider'): void {
    this.emit('typingStop', { orderId, userId, userType });
  }

  // Helper to check connection
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();