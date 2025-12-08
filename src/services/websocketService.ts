// src/services/websocketService.ts - FIXED
import { io, Socket } from 'socket.io-client';

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
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Listen for order updates
    this.socket.on('order-update', (data: any) => {
      console.log('Order update received:', data);
      this.notifyListeners('order-update', data);
    });

    // Listen for rider location updates
    this.socket.on('rider-location', (data: any) => {
      console.log('Rider location update:', data);
      this.notifyListeners('rider-location', data);
    });

    // Listen for chat messages
    this.socket.on('chat-message', (data: any) => {
      console.log('Chat message received:', data);
      this.notifyListeners('chat-message', data);
    });

    // Listen for auto-assignment notifications
    this.socket.on('rider-assigned', (data: any) => {
      console.log('Rider assigned:', data);
      this.notifyListeners('rider-assigned', data);
    });

    // Listen for timeout notifications (after 5 minutes)
    this.socket.on('assignment-timeout', (data: any) => {
      console.log('Assignment timeout, notify customer care:', data);
      this.notifyListeners('assignment-timeout', data);
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

  // Join order room
  joinOrderRoom(orderId: number): void {
    this.emit('join-order-room', { orderId });
  }

  // Leave order room
  leaveOrderRoom(orderId: number): void {
    this.emit('leave-order-room', { orderId });
  }

  // Subscribe to rider location
  subscribeToRider(riderId: number): void {
    this.emit('subscribe-rider', { riderId });
  }

  // Unsubscribe from rider
  unsubscribeFromRider(riderId: number): void {
    this.emit('unsubscribe-rider', { riderId });
  }

  // Send chat message
  sendChatMessage(orderId: number, senderId: number, content: string, senderType: 'customer' | 'rider'): void {
    this.emit('send-chat-message', {
      orderId,
      senderId,
      content,
      senderType
    });
  }

  // Mark messages as read
  markMessagesAsRead(orderId: number, userId: number): void {
    this.emit('mark-messages-read', { orderId, userId });
  }

  // Helper to check connection
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();