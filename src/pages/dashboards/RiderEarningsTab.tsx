// src/components/dashboard/RiderEarningsTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Wallet, Clock, CheckCircle, 
  AlertCircle, CreditCard, Download, Calendar 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface RiderEarningsTabProps {
  userId?: number;
}

export const RiderEarningsTab: React.FC<RiderEarningsTabProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      loadEarningsData();
    }
  }, [userId]);

  const loadEarningsData = async () => {
    setIsLoading(true);
    try {
      const [paymentsResponse, statsResponse] = await Promise.all([
        api.get(`/payments/user/${userId}`),
        api.get(`/riders/${userId}/earnings?range=month`),
      ]);

      setPayments(paymentsResponse.data || []);
      setEarningsData(statsResponse.data || {});
    } catch (error) {
      console.error('Failed to load earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount?.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}`;
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

  const totalEarnings = payments
    .filter((p: any) => p.status === 'COMPLETED')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p: any) => p.status === 'PENDING')
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(totalEarnings)}
                </h3>
                <p className="text-sm text-green-600 mt-1">All-time earnings</p>
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
                <p className="text-sm text-gray-600">Pending</p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(pendingAmount)}
                </h3>
                <p className="text-sm text-yellow-600 mt-1">
                  {payments.filter((p: any) => p.status === 'PENDING').length} payments
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Payments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => loadEarningsData()}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment: any) => (
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
                          {formatDate(payment.created_at)}
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

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                  Export Statement
                </Button>
                <Button variant="outline" className="w-full" leftIcon={<Calendar className="w-4 h-4" />}>
                  View History
                </Button>
                <Button variant="primary" className="w-full" leftIcon={<TrendingUp className="w-4 h-4" />}>
                  Request Withdrawal
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};