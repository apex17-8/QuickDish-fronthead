// src/pages/dashboards/RestaurantAnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart, TrendingUp, DollarSign, Users, Package, 
  Star, Calendar, Download, Filter 
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useAuth } from '../../hooks/useAuth';
import { RestaurantOwnerService } from '../../services/restaurantOwnerService';
import toast from 'react-hot-toast';

export const RestaurantAnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadAnalyticsData();
    }
  }, [id, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [statsData, revenueData, paymentData] = await Promise.all([
        RestaurantOwnerService.getRestaurantStats(parseInt(id!)),
        RestaurantOwnerService.getRestaurantRevenue(parseInt(id!), getDaysFromRange()),
        RestaurantOwnerService.getPaymentStats(parseInt(id!)),
      ]);
      
      setStats(statsData);
      setRevenueData(revenueData);
      setPaymentStats(paymentData);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysFromRange = () => {
    switch(timeRange) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      case '365days': return 365;
      default: return 30;
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Insights and performance metrics for your restaurant
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/restaurant/${id}`)}
            >
              Back to Restaurant
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Time Period</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            {['7days', '30days', '90days', '365days'].map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7days' ? '7 Days' :
                 range === '30days' ? '30 Days' :
                 range === '90days' ? '90 Days' : '1 Year'}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {formatCurrency(revenueData?.totalRevenue || 0)}
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    +12.5% from last period
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <h3 className="text-2xl font-bold mt-2">{stats?.totalOrders || 0}</h3>
                  <p className="text-sm text-green-600 mt-1">
                    +{stats?.todayOrders || 0} today
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {formatCurrency(revenueData?.averageOrderValue || 0)}
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    +5.2% from last period
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Customer Rating</p>
                  <h3 className="text-2xl font-bold mt-2">{stats?.averageRating?.toFixed(1) || 'N/A'}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {stats?.totalOrders || 0} orders
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueData?.dailyStats?.length > 0 ? (
                    <div className="space-y-4">
                      {revenueData.dailyStats.slice(0, 7).reverse().map((day: any) => (
                        <div key={day.date} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {new Date(day.date).toLocaleDateString('en-KE', { weekday: 'short' })}
                          </span>
                          <div className="flex items-center space-x-4">
                            <div className="w-48 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${Math.min((parseFloat(day.revenue) / 5000) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(parseFloat(day.revenue))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No revenue data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Order Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="warning">{stats?.pendingOrders || 0}</Badge>
                        <span className="text-sm text-gray-500">
                          {(stats?.pendingOrders || 0) > 0 ? 'Needs attention' : 'All good'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Preparing</span>
                      <Badge variant="info">{stats?.preparingOrders || 0}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ready</span>
                      <Badge variant="success">{stats?.readyOrders || 0}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivered</span>
                      <Badge variant="success">{stats?.delivered || 0}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cancelled</span>
                      <Badge variant="danger">{stats?.cancelled || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Payment Stats */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Payment Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Paid</p>
                        <p className="text-2xl font-bold text-green-600">
                          {paymentStats?.paid || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          {paymentStats?.paidPercentage?.toFixed(1) || 0}%
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {paymentStats?.pending || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(paymentStats?.pending / paymentStats?.total * 100).toFixed(1) || 0}%
                        </p>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Failed</p>
                        <p className="text-2xl font-bold text-red-600">
                          {paymentStats?.failed || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(paymentStats?.failed / paymentStats?.total * 100).toFixed(1) || 0}%
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(paymentStats?.totalRevenue || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Breakdown */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
                    {revenueData?.dailyStats?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                              <th className="text-left py-3 text-sm font-medium text-gray-600">Orders</th>
                              <th className="text-left py-3 text-sm font-medium text-gray-600">Revenue</th>
                              <th className="text-left py-3 text-sm font-medium text-gray-600">Avg Order</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenueData.dailyStats.slice(0, 10).map((day: any) => (
                              <tr key={day.date} className="border-b hover:bg-gray-50">
                                <td className="py-3 text-sm">
                                  {new Date(day.date).toLocaleDateString('en-KE')}
                                </td>
                                <td className="py-3 text-sm">{day.orders}</td>
                                <td className="py-3 text-sm font-medium">
                                  {formatCurrency(parseFloat(day.revenue))}
                                </td>
                                <td className="py-3 text-sm">
                                  {formatCurrency(parseFloat(day.revenue) / parseInt(day.orders))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-600">No revenue data available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Order Trends */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Order Trends</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Peak Order Hours</p>
                        <p className="text-2xl font-bold mt-2">12:00 PM - 2:00 PM</p>
                        <p className="text-sm text-gray-500 mt-1">
                          35% of daily orders
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Average Preparation Time</p>
                        <p className="text-2xl font-bold mt-2">24 minutes</p>
                        <p className="text-sm text-gray-500 mt-1">
                          From acceptance to ready
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Popular Items */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Top Selling Items</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(item => (
                        <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Item {item}</p>
                            <p className="text-sm text-gray-600">Category</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{150 + item * 25} orders</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(1200 + item * 200)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Customer Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Repeat Customers</p>
                      <p className="text-2xl font-bold mt-2">68%</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Customers who ordered more than once
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">New Customers</p>
                      <p className="text-2xl font-bold mt-2">32%</p>
                      <p className="text-sm text-gray-500 mt-1">
                        First-time customers this period
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Orders per Customer</p>
                      <p className="text-2xl font-bold mt-2">2.4</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Average number of orders per customer
                      </p>
                    </div>
                  </div>

                  {/* Customer Feedback */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Recent Feedback</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">4.5</span>
                          </div>
                          <span className="text-sm text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          "Great food and quick delivery! Will definitely order again."
                        </p>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">5.0</span>
                          </div>
                          <span className="text-sm text-gray-500">1 week ago</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          "Excellent service! The food was fresh and delicious."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Reports */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-6 h-auto"
            >
              <Download className="w-8 h-8 mb-2 text-blue-600" />
              <span>Download Sales Report</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-6 h-auto"
            >
              <Package className="w-8 h-8 mb-2 text-green-600" />
              <span>Order Summary</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-6 h-auto"
            >
              <Users className="w-8 h-8 mb-2 text-purple-600" />
              <span>Customer Report</span>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};