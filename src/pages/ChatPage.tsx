// src/pages/ChatPage.tsx - CORRECT VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Phone, MapPin, User, Clock, X, Star, MessageSquare } from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebsockets';
import { ChatService } from '../services/chatService';
import { OrdersService } from '../services/ordersService';
import { useOrderWorkflow } from '../hooks/useOrderWorkflow';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  sender_id: number;
  sender_type: 'customer' | 'rider';
  content: string;
  created_at: string;
  read_at?: string;
  sender?: {
    name: string;
  };
}

export const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, subscribeToChat, markMessagesAsRead, typingStart, typingStop } = useWebSocket();
  const { rateOrder, shouldRateOrder } = useOrderWorkflow();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (id && user) {
      fetchOrderDetails();
      loadMessages();
      
      // Subscribe to chat updates
      const unsubscribe = subscribeToChat(
        parseInt(id),
        user.user_id,
        user.role === 'customer' ? 'customer' : 'rider',
        handleIncomingMessage
      );

      // Mark messages as read
      markMessagesAsRead(parseInt(id), user.user_id);

      return () => {
        unsubscribe();
      };
    }
  }, [id, user]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const orderData = await OrdersService.getOrderWithDetails(parseInt(id!));
      setOrder(orderData);
      
      // Determine other user
      if (user?.role === 'customer' && orderData.rider) {
        setOtherUser(orderData.rider.user);
      } else if (user?.role === 'rider' && orderData.customer) {
        setOtherUser(orderData.customer.user);
      }

      // Check if chat should be closed (order delivered and rated)
      if (orderData.status === 'delivered' && orderData.customer_rating) {
        toast.info('Chat closed - Order has been rated');
        setTimeout(() => navigate('/orders'), 3000);
      }

      // Show rating prompt if needed
      if (shouldRateOrder(orderData.status, !orderData.customer_rating)) {
        setShowRating(true);
      }
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const chatMessages = await ChatService.getOrderMessages(parseInt(id!));
      setMessages(chatMessages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleIncomingMessage = (data: any) => {
    if (data.type === 'newMessage') {
      setMessages(prev => [...prev, data.message]);
      
      // Mark as read
      if (user && data.message.sender_id !== user.user_id) {
        markMessagesAsRead(parseInt(id!), user.user_id);
      }
    } else if (data.type === 'userTyping') {
      if (data.userId !== user?.user_id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user || !id) return;

    const messageContent = newMessage.trim();
    
    // Send via WebSocket for real-time
    sendMessage(
      parseInt(id),
      user.user_id,
      messageContent,
      user.role === 'customer' ? 'customer' : 'rider'
    );

    // Also send via REST API for persistence
    try {
      await ChatService.sendMessage(
        parseInt(id),
        user.user_id,
        user.role === 'customer' ? 'customer' : 'rider',
        messageContent
      );
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    setNewMessage('');
    typingStop(parseInt(id), user.user_id, user.role === 'customer' ? 'customer' : 'rider');
  }, [newMessage, user, id, sendMessage, typingStop]);

  const handleTyping = () => {
    if (user && id) {
      typingStart(parseInt(id), user.user_id, user.role === 'customer' ? 'customer' : 'rider');
    }
  };

  const handleStopTyping = () => {
    if (user && id) {
      typingStop(parseInt(id), user.user_id, user.role === 'customer' ? 'customer' : 'rider');
    }
  };

  const handleRateSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    const success = await rateOrder(parseInt(id!), rating, feedback);
    if (success) {
      setShowRating(false);
      toast.success('Thank you for your rating! Chat will close shortly.');
      
      // Close chat after 3 seconds
      setTimeout(() => navigate('/orders'), 3000);
    }
  };

  const handleCall = () => {
    if (otherUser?.phone) {
      window.open(`tel:${otherUser.phone}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-500"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-8">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              This order doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/orders')}>
              Back to Orders
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const canChat = order.status === 'picked_up' || order.status === 'on_the_way';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">
                      Chat for Order #{order.order_number}
                    </h2>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant={
                        order.status === 'picked_up' ? 'success' :
                        order.status === 'on_the_way' ? 'info' :
                        'default'
                      }>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      {otherUser && (
                        <span className="text-gray-600">
                          with {otherUser.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleCall} leftIcon={<Phone className="w-4 h-4" />}>
                    Call
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<MapPin className="w-4 h-4" />}>
                    Track
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div 
                ref={chatContainerRef}
                className="h-[400px] overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_id === user?.user_id
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {canChat ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    onFocus={handleTyping}
                    onBlur={handleStopTyping}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>Chat is closed for this order.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Prompt */}
          {showRating && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg flex items-center">
                      <Star className="w-5 h-5 text-orange-500 mr-2" />
                      Rate Your Order
                    </h3>
                    <p className="text-gray-600">How was your experience?</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowRating(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? 'text-orange-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Any feedback? (optional)"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                  />
                  <Button onClick={handleRateSubmit} className="w-full">
                    Submit Rating
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};