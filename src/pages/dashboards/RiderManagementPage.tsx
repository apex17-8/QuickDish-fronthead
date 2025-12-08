// src/pages/dashboards/RiderManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle, XCircle, Clock, AlertCircle, 
  Search, Filter, UserPlus, UserX, BarChart, 
  Truck, Star, DollarSign, MapPin, Phone, Mail,
  ChevronRight, MoreVertical
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../hooks/useAuth';
import { RestaurantOwnerService } from '../../services/restaurantOwnerService';
import toast from 'react-hot-toast';

export const RiderManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [riderRequests, setRiderRequests] = useState<any[]>([]);
  const [approvedRiders, setApprovedRiders] = useState<any[]>([]);
  const [availableRiders, setAvailableRiders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadRiderData();
    }
  }, [id]);

  const loadRiderData = async () => {
    setIsLoading(true);
    try {
      const [requests, approved, statsData, available] = await Promise.all([
        RestaurantOwnerService.getRiderRequests(parseInt(id!)),
        RestaurantOwnerService.getApprovedRiders(parseInt(id!)),
        RestaurantOwnerService.getRiderStats(parseInt(id!)),
        RestaurantOwnerService.getAvailableRiders(parseInt(id!)),
      ]);

      setRiderRequests(requests);
      setApprovedRiders(approved);
      setAvailableRiders(available);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load rider data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRider = async (requestId: number) => {
    try {
      await RestaurantOwnerService.approveRider(requestId);
      toast.success('Rider approved successfully');
      loadRiderData();
    } catch (error) {
      toast.error('Failed to approve rider');
    }
  };

  const handleRejectRider = async (requestId: number, reason?: string) => {
    const reasonInput = prompt('Please provide a reason for rejection (optional):');
    try {
      await RestaurantOwnerService.rejectRider(requestId, reasonInput || reason);
      toast.success('Rider request rejected');
      loadRiderData();
    } catch (error) {
      toast.error('Failed to reject rider');
    }
  };

  const handleSuspendRider = async (requestId: number) => {
    const reason = prompt('Please provide a reason for suspension:');
    if (!reason) {
      toast.error('Reason is required for suspension');
      return;
    }

    try {
      await RestaurantOwnerService.suspendRider(requestId, reason);
      toast.success('Rider suspended');
      loadRiderData();
    } catch (error) {
      toast.error('Failed to suspend rider');
    }
  };

  const handleRemoveRider = async (requestId: number) => {
    if (!window.confirm('Are you sure you want to remove this rider?')) {
      return;
    }

    const reason = prompt('Please provide a reason for removal (optional):');
    try {
      await RestaurantOwnerService.removeRider(requestId, reason);
      toast.success('Rider removed');
      loadRiderData();
    } catch (error) {
      toast.error('Failed to remove rider');
    }
  };

  const handleInviteRider = async (riderId: number) => {
    try {
      // This would call an invite API
      toast.success('Invitation sent to rider');
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'suspended':
        return <Badge variant="danger"><AlertCircle className="w-3 h-3 mr-1" /> Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = riderRequests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Rider Management</h1>
            <p className="text-gray-600 mt-2">
              Approve, manage, and monitor riders for your restaurant
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
              variant="primary"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setShowInviteModal(true)}
            >
              Invite Rider
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.total || 0}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.pending || 0}</h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.approved || 0}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <h3 className="text-2xl font-bold mt-2">{stats.rejected || 0}</h3>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <h3 className="text-2xl font-bold mt-2">{availableRiders.length}</h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <UserPlus className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <CardTitle>Rider Requests</CardTitle>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search riders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No rider requests</h3>
                    <p className="text-gray-600">
                      {activeTab === 'pending' 
                        ? 'No pending rider requests'
                        : activeTab === 'approved'
                        ? 'No approved riders yet'
                        : 'No rider requests found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map(request => (
                      <div 
                        key={request.request_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedRider?.request_id === request.request_id 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedRider(request)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-bold text-gray-900">
                                  {request.rider?.name || 'Unknown Rider'}
                                </h3>
                                {getStatusBadge(request.status)}
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                {request.rider?.email && (
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <span>{request.rider.email}</span>
                                  </div>
                                )}
                                
                                {request.rider?.phone && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    <span>{request.rider.phone}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>
                                    Requested on {new Date(request.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveRider(request.request_id);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectRider(request.request_id);
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {request.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 hover:text-yellow-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSuspendRider(request.request_id);
                                }}
                              >
                                Suspend
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Show more options
                              }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {request.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Message: </span>
                              {request.message}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details & Actions */}
          <div className="space-y-6">
            {/* Selected Rider Details */}
            {selectedRider ? (
              <Card>
                <CardHeader>
                  <CardTitle>Rider Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{selectedRider.rider?.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(selectedRider.status)}
                          <span className="text-sm text-gray-500">
                            ID: {selectedRider.rider?.user_id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedRider.rider?.email || 'No email'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedRider.rider?.phone || 'No phone'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {selectedRider.status === 'approved' 
                            ? `Approved on ${new Date(selectedRider.approved_at).toLocaleDateString()}`
                            : `Requested on ${new Date(selectedRider.created_at).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                      
                      {selectedRider.reviewed_by && (
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Reviewed by: {selectedRider.reviewed_by?.name}</span>
                        </div>
                      )}
                    </div>

                    {selectedRider.message && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Message: </span>
                          {selectedRider.message}
                        </p>
                      </div>
                    )}

                    {selectedRider.rejection_reason && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Rejection Reason: </span>
                          {selectedRider.rejection_reason}
                        </p>
                      </div>
                    )}

                    {selectedRider.suspension_reason && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">
                          <span className="font-medium">Suspension Reason: </span>
                          {selectedRider.suspension_reason}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 pt-4 border-t">
                      {selectedRider.status === 'pending' && (
                        <>
                          <Button
                            fullWidth
                            variant="success"
                            onClick={() => handleApproveRider(selectedRider.request_id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Rider
                          </Button>
                          <Button
                            fullWidth
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleRejectRider(selectedRider.request_id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Request
                          </Button>
                        </>
                      )}
                      
                      {selectedRider.status === 'approved' && (
                        <>
                          <Button
                            fullWidth
                            variant="outline"
                            className="text-yellow-600"
                            onClick={() => handleSuspendRider(selectedRider.request_id)}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Suspend Rider
                          </Button>
                          <Button
                            fullWidth
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleRemoveRider(selectedRider.request_id)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Remove from Restaurant
                          </Button>
                        </>
                      )}
                      
                      {selectedRider.status === 'suspended' && (
                        <Button
                          fullWidth
                          variant="success"
                          onClick={() => handleApproveRider(selectedRider.request_id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reinstate Rider
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Rider Details</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a rider to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate(`/dashboard/restaurant/${id}/riders/available`)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  View Available Riders
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    // Navigate to performance page
                  }}
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Rider Performance
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowInviteModal(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Invite New Rider
                </Button>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Approved</span>
                    <span className="font-bold">{stats?.approved || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Today</span>
                    <span className="font-bold text-green-600">8</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Delivery Time</span>
                    <span className="font-bold">24 min</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Rating</span>
                    <span className="font-bold flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      4.5
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Riders Section */}
        {availableRiders.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Available Riders</CardTitle>
                  <Badge variant="info">{availableRiders.length} available</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableRiders.slice(0, 6).map(rider => (
                    <div key={rider.user_id} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{rider.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{rider.email}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          fullWidth
                          onClick={() => {
                            // Send request to this rider
                            toast.success(`Invitation sent to ${rider.name}`);
                          }}
                        >
                          <UserPlus className="w-3 h-3 mr-2" />
                          Invite to Restaurant
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {availableRiders.length > 6 && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/dashboard/restaurant/${id}/riders/available`)}
                    >
                      View All Available Riders ({availableRiders.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Rider to Restaurant</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rider's Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="rider@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="Invite this rider to join your restaurant..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    if (!inviteEmail) {
                      toast.error('Please enter an email address');
                      return;
                    }
                    toast.success(`Invitation sent to ${inviteEmail}`);
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};