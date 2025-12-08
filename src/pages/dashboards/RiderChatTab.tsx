// src/components/dashboard/RiderChatTab.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Clock, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface RiderChatTabProps {
  userId?: number;
}

export const RiderChatTab: React.FC<RiderChatTabProps> = ({ userId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      loadConversations();
      // Simulate some initial messages
      setMessages([
        {
          id: 1,
          sender_id: 1,
          sender_type: 'support',
          content: 'Welcome to the chat! How can we help you today?',
          created_at: new Date().toISOString(),
          sender: { name: 'Support Team' }
        },
        {
          id: 2,
          sender_id: userId,
          sender_type: 'rider',
          content: 'I need help with a delivery issue',
          created_at: new Date().toISOString(),
          sender: { name: 'You' }
        }
      ]);

      setConversations([
        { id: 1, name: 'Support Team', unread: 0, lastMessage: 'How can we help you today?', lastActive: 'Just now' },
        { id: 2, name: 'Customer - John Doe', unread: 2, lastMessage: 'Where is my order?', lastActive: '5 min ago' },
        { id: 3, name: 'Restaurant - Pizza Palace', unread: 0, lastMessage: 'Order #123 is ready', lastActive: '1 hour ago' },
      ]);
    }
  }, [userId]);

  const loadConversations = async () => {
    try {
      const response = await api.get(`/riders/${userId}/conversations`);
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message = {
      id: messages.length + 1,
      sender_id: userId,
      sender_type: 'rider',
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      sender: { name: 'You' }
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate auto-reply after 1 second
    setTimeout(() => {
      const reply = {
        id: messages.length + 2,
        sender_id: selectedChat.id,
        sender_type: selectedChat.type || 'support',
        content: 'Thanks for your message. We\'ll get back to you shortly.',
        created_at: new Date().toISOString(),
        sender: { name: selectedChat.name }
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    const newChat = {
      id: 0,
      name: 'Support Team',
      type: 'support'
    };
    setSelectedChat(newChat);
    setMessages([
      {
        id: 1,
        sender_id: 1,
        sender_type: 'support',
        content: 'How can we help you today?',
        created_at: new Date().toISOString(),
        sender: { name: 'Support Team' }
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Chats</CardTitle>
            <Badge variant="info">{conversations.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              fullWidth 
              onClick={startNewChat}
              className="mb-4"
            >
              New Chat
            </Button>
            
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat?.id === conv.id 
                    ? 'bg-orange-50 border border-orange-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  setSelectedChat(conv);
                  setMessages([{
                    id: 1,
                    sender_id: conv.id,
                    sender_type: 'support',
                    content: conv.lastMessage,
                    created_at: new Date().toISOString(),
                    sender: { name: conv.name }
                  }]);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{conv.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <Badge variant="primary" className="ml-2">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{conv.lastActive}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3">
        <CardHeader>
          {selectedChat ? (
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle>{selectedChat.name}</CardTitle>
                  <p className="text-sm text-gray-600">Online</p>
                </div>
              </div>
              <Button variant="outline" size="sm" leftIcon={<Phone className="w-4 h-4" />}>
                Call
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="mb-2">Select a chat to start messaging</CardTitle>
              <p className="text-gray-600">Choose a conversation or start a new chat</p>
            </div>
          )}
        </CardHeader>
        
        {selectedChat && (
          <>
            <CardContent className="h-[400px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === userId
                        ? 'bg-orange-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="font-medium text-xs mb-1">
                      {message.sender?.name}
                    </p>
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
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
            </div>
          </>
        )}
      </Card>
    </div>
  );
};