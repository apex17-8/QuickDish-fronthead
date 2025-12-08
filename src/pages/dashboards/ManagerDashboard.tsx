// src/pages/ManagerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  Star,
  ChefHat,
  ShoppingBag,
  BarChart3,
  Settings,
  AlertCircle,
  Filter,
  Download,
  Calendar,
  Target
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [restaurantId] = useState(1);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    avgOrderValue: 0,
    customerSatisfaction: 4.7,
    staffPerformance: 8.5,
    inventoryLevel: 85,
  });
  const [staff, setStaff] = useState<any[]>([
    { id: 1, name: 'John Chef', role: 'chef', status: 'active', performance: 9.2, todayOrders: 45 },
    { id: 2, name: 'Sarah Server', role: 'server', status: 'active', performance: 8.8, todayOrders: 38 },
    { id: 3, name: 'Mike Prep', role: 'prep', status: 'break', performance: 7.9, todayOrders: 32 },
    { id: 4, name: 'Lisa Cashier', role: 'cashier', status: 'active', performance: 9.0, todayOrders: 40 },
  ]);
  const [inventory, setInventory] = useState<any[]>([
    { id: 1, item: 'Beef Patties', current: 150, min: 50, status: 'good' },
    { id: 2, item: 'Buns', current: 200, min: 100, status: 'good' },
    { id: 3, item: 'Lettuce', current: 30, min: 40, status: 'low' },
    { id: 4, item: 'Cheese Slices', current: 180, min: 80, status: 'good' },
  ]);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    checkAuth();
    fetchManagerData();
  }, [timeRange]);

  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'manager') {
      toast.error('Access denied. Restaurant managers only.');
      navigate('/login');
    }
  };

  const fetchManagerData = async () => {
    try {
      // Mock data
      setStats({
        todayRevenue: 12560,
        todayOrders: 156,
        avgOrderValue: 80.5,
        customerSatisfaction: 4.7,
        staffPerformance: 8.5,
        inventoryLevel: 85,
      });
    } catch (error) {
      toast.error('Failed to load manager data');
    }
  };

  const statsCards = [
    {
      title: "Today's Revenue",
      value: `KSh ${stats.todayRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      change: '+12%',
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders.toString(),
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: '+8%',
    },
    {
      title: 'Avg Order Value',
      value: `KSh ${stats.avgOrderValue.toFixed(2)}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-purple-500',
      change: '+5%',
    },
    {
      title: 'Customer Satisfaction',
      value: stats.customerSatisfaction.toFixed(1),
      icon: <Star className="w-6 h-6" />,
      color: 'bg-yellow-500',
    },
  ];

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'break': return 'warning';
      case 'off': return 'danger';
      default: return 'default';
    }
  };

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'low': return 'warning';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const timeRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Burger King - Nairobi Branch Management</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
              Schedule
            </Button>
            <Button variant="primary" leftIcon={<Settings className="w-4 h-4" />}>
              Settings
            </Button>
          </div>
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
                    {stat.change && (
                      <p className="text-sm text-green-600 mt-1">{stat.change} from yesterday</p>
                    )}
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
          {/* Left Column - Staff & Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Staff Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Staff Management
                </CardTitle>
                <Button variant="outline" size="sm">
                  + Add Staff
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Staff Member</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Role</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Performance</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Today's Orders</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((member) => (
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <Users className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="font-medium">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge variant="info">{member.role}</Badge>
                          </td>
                          <td className="py-4">
                            <Badge variant={getStaffStatusColor(member.status)}>
                              {member.status}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center">
                              <Target className="w-4 h-4 text-orange-500 mr-2" />
                              <span className="font-bold">{member.performance}/10</span>
                            </div>
                          </td>
                          <td className="py-4 font-bold">{member.todayOrders}</td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                Schedule
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance Analytics
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  {/* Time range filter using buttons */}
                  <div className="flex space-x-1">
                    {timeRanges.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setTimeRange(range.id)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          timeRange === range.id
                            ? 'bg-orange-100 text-orange-600'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex flex-col justify-between">
                  <div className="flex justify-between items-end h-48">
                    {[65, 80, 90, 75, 85, 95, 70].map((height, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                        <p className="text-xs mt-2 text-gray-600">Day {index + 1}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Peak Hour</p>
                      <p className="font-bold">12:00 PM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Best Performer</p>
                      <p className="font-bold">John Chef</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Avg Prep Time</p>
                      <p className="font-bold">18min</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Inventory & Quick Actions */}
          <div className="space-y-6">
            {/* Inventory Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Inventory Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-gray-600">
                          {item.current} / {item.min} min
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={getInventoryStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        {item.status === 'low' && (
                          <AlertCircle className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Inventory Level</span>
                    <span className="font-bold">{stats.inventoryLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${stats.inventoryLevel}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Average Performance</span>
                    <span className="font-bold">{stats.staffPerformance}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${stats.staffPerformance * 10}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Training Required</span>
                    <span className="font-bold">2 staff</span>
                  </div>
                  <div className="flex space-x-2">
                    {staff.filter(s => s.performance < 8).map(s => (
                      <Badge key={s.id} variant="warning">{s.name.split(' ')[0]}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" fullWidth leftIcon={<Users className="w-4 h-4" />}>
                  Manage Staff Schedule
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Package className="w-4 h-4" />}>
                  Order Inventory
                </Button>
                <Button variant="outline" fullWidth leftIcon={<DollarSign className="w-4 h-4" />}>
                  View Financial Report
                </Button>
                <Button variant="outline" fullWidth leftIcon={<ChefHat className="w-4 h-4" />}>
                  Update Menu Items
                </Button>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium">Lettuce running low</p>
                  <p className="text-xs text-gray-600 mt-1">Order more inventory</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium">Staff meeting at 3 PM</p>
                  <p className="text-xs text-gray-600 mt-1">Monthly performance review</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};