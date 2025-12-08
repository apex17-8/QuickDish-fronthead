// src/pages/dashboards/RiderEarningsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, Calendar, Download,
  CreditCard, Wallet, BarChart, PieChart,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const RiderEarningsPage: React.FC<{ userId?: number }> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [earningsData, setEarningsData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadEarningsData();
    }
  }, [userId, timeRange]);

  const loadEarningsData = async () => {
    setIsLoading(true);
    try {
      const [paymentsResponse, statsResponse] = await Promise.all([
        api.get(`/payments/user/${userId}`),
        api.get(`/riders/${userId}/earnings?range=${timeRange}`),
      ]);

      setPayments(paymentsResponse.data);
      setEarningsData(statsResponse.data);
    } catch (error) {
      toast.error('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      dateStyle: 'medium'
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'PENDING': return <Badge variant="warning">Pending</Badge>;
      case 'FAILED': return <Badge variant="danger">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(earningsData?.totalEarnings || 0)}
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  +12.5% from last {timeRange}
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
                <p className="text-sm text-gray-600">Available Balance</p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(earningsData?.availableBalance || 0)}
                </h3>
                <p className="text-sm text-blue-600 mt-1">Ready for withdrawal</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(earningsData?.pendingAmount || 0)}
                </h3>
                <p className="text-sm text-yellow-600 mt-1">
                  {earningsData?.pendingCount || 0} payments
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment History</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeRange('week')}
                  className={timeRange === 'week' ? 'bg-orange-50' : ''}
                >
                  Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeRange('month')}
                  className={timeRange === 'month' ? 'bg-orange-50' : ''}
                >
                  Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeRange('year')}
                  className={timeRange === 'year' ? 'bg-orange-50' : ''}
                >
                  Year
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map(payment => (
                    <div key={payment.payment_id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            payment.status === 'COMPLETED' ? 'bg-green-100' :
                            payment.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            {payment.status === 'COMPLETED' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : payment.status === 'PENDING' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">Payment #{payment.payment_number}</span>
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              Order #{payment.order_id} • {formatDate(payment.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-600">{payment.gateway}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Withdrawal Form */}
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Request Withdrawal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Available Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(earningsData?.availableBalance || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Minimum Withdrawal</p>
                      <p className="text-2xl font-bold">KES 500</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (KES)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter amount"
                        min="500"
                        max={earningsData?.availableBalance}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select method</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                    
                    <Button variant="primary" fullWidth>
                      Request Withdrawal
                    </Button>
                  </div>
                </div>

                {/* Withdrawal History */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Recent Withdrawals</h3>
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No withdrawal history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {withdrawals.map((withdrawal, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Withdrawal #{withdrawal.id}</p>
                              <p className="text-sm text-gray-600">{formatDate(withdrawal.date)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(withdrawal.amount)}</p>
                              <Badge variant={withdrawal.status === 'completed' ? 'success' : 'warning'}>
                                {withdrawal.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="w-5 h-5 mr-2" />
                Earnings Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Earnings Chart */}
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Earnings Trend</h3>
                  <div className="h-64 flex items-end space-x-2">
                    {[1200, 1800, 2400, 1900, 2800, 3200, 2900].map((amount, index) => (
                      <div key={index} className="flex-1">
                        <div 
                          className="bg-orange-500 rounded-t-lg"
                          style={{ height: `${(amount / 3500) * 100}%` }}
                        />
                        <p className="text-xs text-center mt-2">Day {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Avg. Delivery Fee</p>
                          <h3 className="text-2xl font-bold mt-2">KES 150</h3>
                          <p className="text-sm text-gray-500 mt-1">Per delivery</p>
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
                          <p className="text-sm text-gray-600">Total Deliveries</p>
                          <h3 className="text-2xl font-bold mt-2">{earningsData?.totalDeliveries || 0}</h3>
                          <p className="text-sm text-gray-500 mt-1">This {timeRange}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <PieChart className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Export Report */}
                <div className="flex justify-end">
                  <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};