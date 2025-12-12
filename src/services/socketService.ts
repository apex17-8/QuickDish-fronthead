// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import type { LocationUpdate, OrderUpdateEvent, WebSocketEventType, WebSocketEventDataMap } from '../types';

export type Namespace = 'orders' | 'rider-tracking' | 'tracking' | 'chat' | 'order-status';

// Client-side emit events
type ClientEventType =
  | 'joinChat'
  | 'leaveChat'
  | 'sendMessage'
  | 'typingStart'
  | 'typingStop'
  | 'subscribeRider'
  | 'unsubscribeRider'
  | 'updateRiderLocation'
  | 'joinOrderRoom'
  | 'leaveOrderRoom'
  | 'broadcastOrderUpdate'
  | 'markRead'; // Added for message read events

type Listener<T = unknown> = (data: T) => void;

class SocketService {
  private sockets: Map<Namespace, Socket> = new Map();
  private listeners: Map<string, Listener[]> = new Map();
  private isConnecting: Map<Namespace, boolean> = new Map();

  connect(namespace: Namespace): void {
    if (this.sockets.get(namespace)?.connected || this.isConnecting.get(namespace)) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error(`[SocketService] No auth token found for namespace ${namespace}`);
      return;
    }

    this.isConnecting.set(namespace, true);

    const url = import.meta.env.VITE_WS_URL || 'http://localhost:8000';
    const socket = io(`${url}/${namespace}`, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.sockets.set(namespace, socket);
    this.setupListeners(namespace, socket);
  }

  private setupListeners(namespace: Namespace, socket: Socket) {
    socket.on('connect', () => {
      console.log(`[${namespace}] Connected: ${socket.id}`);
      this.isConnecting.set(namespace, false);
      this.notifyListeners(`${namespace}:connect`, undefined);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[${namespace}] Disconnected: ${reason}`);
      this.isConnecting.set(namespace, false);
      this.notifyListeners(`${namespace}:disconnect`, reason);
    });

    socket.on('error', (error: Error) => {
      console.error(`[${namespace}] Error:`, error);
      this.notifyListeners(`${namespace}:error`, error);
    });

    // Strongly typed server events
    socket.onAny((event: WebSocketEventType, data: WebSocketEventDataMap[typeof event]) => {
      this.notifyListeners(`${namespace}:${event}`, data);
    });
  }

  emitServer<E extends WebSocketEventType>(namespace: Namespace, event: E, data?: WebSocketEventDataMap[E]) {
    const socket = this.sockets.get(namespace);
    if (socket?.connected) socket.emit(event, data);
    else console.warn(`[${namespace}] Cannot emit, socket not connected: ${event}`);
  }

  emitClient<E extends ClientEventType>(namespace: Namespace, event: E, data?: unknown) {
    const socket = this.sockets.get(namespace);
    if (socket?.connected) socket.emit(event, data);
    else console.warn(`[${namespace}] Cannot emit client event, socket not connected: ${event}`);
  }

  on<T = unknown>(key: string, callback: Listener<T>) {
    if (!this.listeners.has(key)) this.listeners.set(key, []);
    this.listeners.get(key)!.push(callback);
  }

  off<T = unknown>(key: string, callback: Listener<T>) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx !== -1) callbacks.splice(idx, 1);
    }
  }

  private notifyListeners<T = unknown>(key: string, data: T) {
    this.listeners.get(key)?.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[SocketService] Listener error ${key}:`, err);
      }
    });
  }

  disconnect(namespace: Namespace) {
    const socket = this.sockets.get(namespace);
    socket?.disconnect();
    this.sockets.delete(namespace);
    this.isConnecting.set(namespace, false);
  }

  // NEW METHOD: Check if any namespace is connected
  isConnected(): boolean {
    // Check if any namespace is connected
    const ordersConnected = this.sockets.get('orders')?.connected || false;
    const chatConnected = this.sockets.get('chat')?.connected || false;
    const trackingConnected = this.sockets.get('tracking')?.connected || false;
    const riderTrackingConnected = this.sockets.get('rider-tracking')?.connected || false;
    
    return ordersConnected || chatConnected || trackingConnected || riderTrackingConnected;
  }

  // ----- Chat helpers -----
  joinChat(orderId: number, userId: number, userType: 'customer' | 'rider') {
    this.emitClient('chat', 'joinChat', { orderId, userId, userType });
  }

  leaveChat(orderId: number, userId: number) {
    this.emitClient('chat', 'leaveChat', { orderId, userId });
  }

  sendMessage(orderId: number, senderId: number, message: string, senderType: 'customer' | 'rider') {
    this.emitClient('chat', 'sendMessage', { orderId, senderId, message, senderType });
  }

  typingStart(orderId: number, userId: number, userType: 'customer' | 'rider') {
    this.emitClient('chat', 'typingStart', { orderId, userId, userType });
  }

  typingStop(orderId: number, userId: number, userType: 'customer' | 'rider') {
    this.emitClient('chat', 'typingStop', { orderId, userId, userType });
  }

  markMessagesAsRead(orderId: number, userId: number) {
    this.emitClient('chat', 'markRead', { orderId, userId });
  }

  // ----- Rider tracking helpers -----
  subscribeRider(riderId: number) {
    this.emitClient('rider-tracking', 'subscribeRider', { riderId });
  }

  unsubscribeRider(riderId: number) {
    this.emitClient('rider-tracking', 'unsubscribeRider', { riderId });
  }

  updateRiderLocation(payload: Omit<LocationUpdate, 'timestamp'> & { riderId?: number; orderId?: number }) {
    this.emitClient('tracking', 'updateRiderLocation', { ...payload, timestamp: new Date().toISOString() });
  }

  // ----- Orders -----
  joinOrderRoom(orderId: number) {
    this.emitClient('orders', 'joinOrderRoom', { orderId });
  }

  leaveOrderRoom(orderId: number) {
    this.emitClient('orders', 'leaveOrderRoom', { orderId });
  }

  broadcastOrderUpdate(payload: OrderUpdateEvent) {
    this.emitClient('orders', 'broadcastOrderUpdate', payload);
  }

  // Optional helper for checking connection status
  isNamespaceConnected(namespace: Namespace) {
    return this.sockets.get(namespace)?.connected ?? false;
  }

  getSocketId(namespace: Namespace): string | null {
    return this.sockets.get(namespace)?.id ?? null;
  }

  // Get all connected namespaces
  getConnectedNamespaces(): Namespace[] {
    const connected: Namespace[] = [];
    for (const [namespace, socket] of this.sockets.entries()) {
      if (socket.connected) {
        connected.push(namespace);
      }
    }
    return connected;
  }
}

export const socketService = new SocketService();
export default SocketService;