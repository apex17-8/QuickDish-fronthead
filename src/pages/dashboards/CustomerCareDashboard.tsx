// src/pages/CustomerCareDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  User,
  Calendar,
  TrendingUp,
  Send
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';

export const CustomerCareDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([
    { id: 1, customer: 'John Doe', email: 'john@example.com', issue: 'Order not delivered', status: 'open', priority: 'high', createdAt: '2025-03-12 10:30', assignedTo: 'You' },
    { id: 2, customer: 'Jane Smith', email: 'jane@example.com', issue: 'Wrong item received', status: 'in_progress', priority: 'medium', createdAt: '2025-03-12 09:15', assignedTo: 'Agent 2' },
    { id: 3, customer: 'Bob Johnson', email: 'bob@example.com', issue: 'Payment failed', status: 'resolved', priority: 'low', createdAt: '2025-03-11 14:20', assignedTo: 'You' },
    { id: 4, customer: 'Alice Brown', email: 'alice@example.com', issue: 'Refund request', status: 'open', priority: 'high', createdAt: '2025-03-11 11:45', assignedTo: 'Agent 3' },
  ]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState({
    openTickets: 0,
    resolvedToday: 0,
    avgResponseTime: '15m',
    customerSatisfaction: 4.8,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    checkAuth();
    calculateStats();
  }, []);

  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'customer_care') {
      toast.error('Access denied. Customer care agents only.');
      navigate('/login');
    }
  };

  const calculateStats = () => {
    const open = tickets.filter(t => t.status === 'open').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    setStats({
      openTickets: open,
      resolvedToday: resolved,
      avgResponseTime: '15m',
      customerSatisfaction: 4.8,
    });
  };

  const handleSelectTicket = (ticket: any) => {
    setActiveConversation(ticket);
    // Mock conversation messages
    setMessages([
      { id: 1, sender: 'customer', message: 'Hello, my order hasn\'t arrived yet.', time: '10:30 AM' },
      { id: 2, sender: 'agent', message: 'Hi John, I\'m checking your order status.', time: '10:32 AM' },
      { id: 3, sender: 'agent', message: 'Your order is with the rider and should arrive in 15 minutes.', time: '10:35 AM' },
      { id: 4, sender: 'customer', message: 'Thank you for the update!', time: '10:36 AM' },
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'agent',
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Update ticket status if needed
    if (activeConversation) {
      setTickets(tickets.map(t => 
        t.id === activeConversation.id 
          ? { ...t, status: 'in_progress' }
          : t
      ));
    }

    toast.success('Message sent');
  };

  const handleUpdateStatus = (ticketId: number, newStatus: string) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));
    
    if (activeConversation?.id === ticketId) {
      setActiveConversation({ ...activeConversation, status: newStatus });
    }
    
    toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`);
    calculateStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const statsCards = [
    {
      title: 'Open Tickets',
      value: stats.openTickets.toString(),
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
    {
      title: 'Resolved Today',
      value: stats.resolvedToday.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Avg Response Time',
      value: stats.avgResponseTime,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Satisfaction',
      value: stats.customerSatisfaction.toFixed(1),
      icon: <Star className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.issue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Care Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage customer support tickets and conversations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tickets List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Status Filter Dropdown - Simple HTML select */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  
                  {/* Priority Filter Dropdown */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        activeConversation?.id === ticket.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectTicket(ticket)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">{ticket.customer}</span>
                            <Mail className="w-4 h-4 text-gray-400 ml-4 mr-2" />
                            <span className="text-sm text-gray-600">{ticket.email}</span>
                          </div>
                          <p className="mt-2">{ticket.issue}</p>
                          <div className="flex items-center mt-3 space-x-4">
                            <Badge variant={getStatusColor(ticket.status)}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {ticket.createdAt}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className="text-sm text-gray-600">Assigned to:</span>
                          <p className="font-medium">{ticket.assignedTo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Conversation */}
          <div className="space-y-6">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{activeConversation.customer}</h3>
                        <p className="text-gray-600">{activeConversation.email}</p>
                        <div className="flex items-center mt-2 space-x-3">
                          <Badge variant={getStatusColor(activeConversation.status)}>
                            {activeConversation.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getPriorityColor(activeConversation.priority)}>
                            {activeConversation.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" leftIcon={<Phone className="w-4 h-4" />}>
                          Call
                        </Button>
                        
                        {/* Status Update Dropdown */}
                        <div className="relative">
                          <select
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
                            value={activeConversation.status}
                            onChange={(e) => handleUpdateStatus(activeConversation.id, e.target.value)}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Conversation Messages */}
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Conversation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 overflow-y-auto mb-4 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                              msg.sender === 'agent'
                                ? 'bg-orange-100 text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Message Input - using textarea and button */}
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <textarea
                          placeholder="Type your response..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                          rows={2}
                        />
                      </div>
                      <Button 
                        onClick={handleSendMessage} 
                        className="self-end"
                        leftIcon={<Send className="w-4 h-4" />}
                      >
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">No Conversation Selected</h3>
                  <p className="text-gray-600">
                    Select a ticket from the list to start a conversation
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" fullWidth leftIcon={<Users className="w-4 h-4" />}>
                  View All Tickets
                </Button>
                <Button variant="outline" fullWidth leftIcon={<TrendingUp className="w-4 h-4" />}>
                  Performance Analytics
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Clock className="w-4 h-4" />}>
                  Response Templates
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Star className="w-4 h-4" />}>
                  Customer Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};