// src/services/chatService.ts
import api from './api';
import { webSocketService } from './websocketService';

export interface Message {
  id: number;
  order_id: number;
  sender_id: number;
  sender_type: 'customer' | 'rider';
  content: string;
  created_at: string;
  read_at?: string;
}

export const ChatService = {
  // Send message via REST API
  sendMessage: async (
    orderId: number,
    senderId: number,
    senderType: 'customer' | 'rider',
    content: string
  ): Promise<Message> => {
    const response = await api.post<Message>('/messages', {
      orderId,
      senderId,
      senderType,
      content,
    });
    return response.data;
  },

  // Get order messages
  getOrderMessages: async (orderId: number): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/messages/${orderId}`);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (orderId: number, userId: number): Promise<void> => {
    await api.patch(`/messages/${orderId}/read`, { userId });
  },

  // Get unread count
  getUnreadCount: async (orderId: number, userId: number): Promise<number> => {
    const response = await api.get(`/messages/${orderId}/unread/${userId}`);
    return response.data.count || 0;
  },

  // WebSocket methods
  joinChat: (orderId: number, userId: number, userType: 'customer' | 'rider') => {
    webSocketService.joinOrderRoom(orderId);
    // Auto-subscribe to chat
    webSocketService.on('chat-message', (data) => {
      if (data.orderId === orderId) {
        // Handle incoming message
        console.log('New chat message:', data);
      }
    });
  },

  leaveChat: (orderId: number, userId: number) => {
    webSocketService.leaveOrderRoom(orderId);
    webSocketService.off('chat-message', () => {});
  },

  sendMessageViaWebSocket: (
    orderId: number,
    senderId: number,
    content: string,
    senderType: 'customer' | 'rider'
  ) => {
    webSocketService.sendChatMessage(orderId, senderId, content, senderType);
  },
};