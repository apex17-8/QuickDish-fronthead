import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  AlertCircle,
  BarChart3,
  Download,
  Search,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { UserService } from '../../services/userService';
import { OrdersService } from '../../services/ordersService';
import { RestaurantService } from '../../services/restaurantService';
import {  UserRole } from '../../types';
import type {User} from '../../types';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeRestaurants: 0,
    pendingOrders: 0,
    activeRiders: 0,
  });
  const [recentActivities, setRecentActivities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  });

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [allUsers, orderStats, restaurants, activities] = await Promise.all([
        UserService.getAllUsers(),
        OrdersService.getOrderStats(),
        RestaurantService.getAllRestaurants(),
        fetchActivities(),
      ]);

      setUsers(allUsers.slice(0, 10));
      setStats({
        totalUsers: allUsers.length,
        totalOrders: orderStats.total,
        totalRevenue: orderStats.totalRevenue || 0,
        activeRestaurants: restaurants.length,
        pendingOrders: orderStats.pending,
        activeRiders: allUsers.filter(u => u.role === UserRole.Rider).length,
      });
     setRecentActivities(activities.map(activity => JSON.stringify(activity)));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    // Simulated activities
    return [
      { id: 1, user: 'John Doe', action: 'placed an order', time: '2 minutes ago' },
      { id: 2, user: 'Restaurant A', action: 'added new menu item', time: '15 minutes ago' },
      { id: 3, user: 'Rider Mike', action: 'completed delivery', time: '30 minutes ago' },
      { id: 4, user: 'Admin', action: 'updated user permissions', time: '1 hour ago' },
    ];
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-green-500',
      change: '+18%',
    },
    {
      title: 'Total Revenue',
      value: `KSh ${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-purple-500',
      change: '+23%',
    },
    {
      title: 'Active Restaurants',
      value: stats.activeRestaurants.toString(),
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-orange-500',
      change: '+8%',
    },
  ];

  const roles = [
    { id: 'all', label: 'All Roles' },
    { id: UserRole.Customer, label: 'Customers' },
    { id: UserRole.Rider, label: 'Riders' },
    { id: UserRole.RestaurantOwner, label: 'Restaurant Owners' },
    { id: UserRole.Manager, label: 'Managers' },
  ];

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Customer: return 'blue';
      case UserRole.Rider: return 'green';
      case UserRole.RestaurantOwner: return 'orange';
      case UserRole.Manager: return 'purple';
      case UserRole.SuperAdmin: return 'red';
      default: return 'gray';
    }
  };
const role = UserRole.Customer;
const color = getRoleColor(role);
console.log(color); // Output: blue

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management</p>
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
                    <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
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
          {/* Left Column - Users Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <CardTitle>User Management</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <select
                    title='Filter by Role'
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 text-sm font-medium text-gray-600">User</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Role</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Joined</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="py-8">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-500"></div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-600">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.user_id} className="border-b hover:bg-gray-50">
                            <td className="py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                  <Users className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">{user.email}</td>
                            <td className="py-4">
                              <Badge variant="success">
                                {user.role.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-4">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost" title="View">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* System Metrics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Uptime</span>
                      <Badge variant="success">99.9%</Badge>
                    </div>
                    <p className="text-2xl font-bold mt-2">30 days</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Response</span>
                      <Badge variant="success">Fast</Badge>
                    </div>
                    <p className="text-2xl font-bold mt-2">120ms</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Sessions</span>
                      <Badge variant="info">Live</Badge>
                    </div>
                    <p className="text-2xl font-bold mt-2">1,234</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activities & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={(activity as unknown as{id: number}).id} className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{' '}
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-sm">2 restaurants offline</span>
                    </div>
                    <Badge variant="warning">Warning</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-sm">Payment gateway issue</span>
                    </div>
                    <Badge variant="danger">Critical</Badge>
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
                  Manage Users
                </Button>
                <Button variant="outline" fullWidth leftIcon={<ShoppingBag className="w-4 h-4" />}>
                  View All Orders
                </Button>
                <Button variant="outline" fullWidth leftIcon={<TrendingUp className="w-4 h-4" />}>
                  System Analytics
                </Button>
                <Button variant="outline" fullWidth leftIcon={<Shield className="w-4 h-4" />}>
                  Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version</span>
                  <span className="font-medium">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="font-medium">Today, 02:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database Size</span>
                  <span className="font-medium">2.4 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Connections</span>
                  <span className="font-medium">45</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};