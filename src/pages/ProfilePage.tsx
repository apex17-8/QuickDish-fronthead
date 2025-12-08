import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  CreditCard,
  Star,
  History,
  Bell,
  Shield,
  Camera,
  Save,
  Edit,
  X
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useAuth } from '../hooks/useAuth';
import { UserService } from '../services/userService';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    riderMessages: true,
    ratingReminders: false,
    newsletter: true,
  });

  const handleProfileUpdate = async () => {
    try {
      await UserService.updateProfile(formData);
      updateUser(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await UserService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'loyalty', label: 'Loyalty', icon: Star },
  ];

  const paymentMethods = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'M-Pesa', phone: '+254 700 123 456', isDefault: false },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Tabs */}
            <div>
              <Card>
                <CardContent className="p-6">
                  {/* Profile Summary */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:shadow-lg">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-lg">{user?.name}</h3>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                    <Badge variant="info" className="mt-2">
                      {user?.role?.replace('_', ' ') || 'Customer'}
                    </Badge>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? 'bg-orange-50 text-orange-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Save className="w-4 h-4" />}
                          onClick={handleProfileUpdate}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<X className="w-4 h-4" />}
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit className="w-4 h-4" />}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="inline w-4 h-4 mr-1" />
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        ) : (
                          <p className="font-medium">{user?.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline w-4 h-4 mr-1" />
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        ) : (
                          <p className="font-medium">{user?.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="inline w-4 h-4 mr-1" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        ) : (
                          <p className="font-medium">{user?.phone}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="inline w-4 h-4 mr-1" />
                          Default Address
                        </label>
                        {isEditing ? (
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows={2}
                          />
                        ) : (
                          <p className="font-medium">123 Street, Nairobi, Kenya</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, newPassword: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <Button
                          variant="primary"
                          onClick={handlePasswordChange}
                          disabled={
                            !passwordData.currentPassword ||
                            !passwordData.newPassword ||
                            !passwordData.confirmPassword
                          }
                        >
                          Update Password
                        </Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Verification</p>
                          <p className="text-sm text-gray-600">
                            Receive verification codes via SMS
                          </p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Receive notifications about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() =>
                                setNotifications({ ...notifications, [key]: !value })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <Button variant="primary" className="mt-6">
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Payment Methods</CardTitle>
                    <Button variant="primary" size="sm">
                      Add Payment Method
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <CreditCard className="w-8 h-8 text-gray-400 mr-4" />
                            <div>
                              <p className="font-medium">{method.type}</p>
                              {method.last4 && (
                                <p className="text-sm text-gray-600">•••• {method.last4}</p>
                              )}
                              {method.phone && (
                                <p className="text-sm text-gray-600">{method.phone}</p>
                              )}
                              {method.expiry && (
                                <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {method.isDefault && (
                              <Badge variant="success">Default</Badge>
                            )}
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            {!method.isDefault && (
                              <Button variant="ghost" size="sm" className="text-red-500">
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loyalty Tab */}
              {activeTab === 'loyalty' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Loyalty Program</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-white">250</p>
                          <p className="text-white text-sm">POINTS</p>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Gold Member</h3>
                      <p className="text-gray-600 mt-2">
                        You need 50 more points to reach Platinum
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Recent Points</h4>
                        <div className="space-y-3">
                          {[
                            { date: 'Today', points: '+25', reason: 'Order #1234' },
                            { date: 'Yesterday', points: '+50', reason: 'Referral Bonus' },
                            { date: 'Jan 10', points: '+15', reason: 'Order #1231' },
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{item.reason}</p>
                                <p className="text-sm text-gray-600">{item.date}</p>
                              </div>
                              <span className="font-bold text-green-600">{item.points}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Available Rewards</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-orange-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">10% Off Next Order</span>
                              <Badge variant="warning">50 points</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Redeem for 10% discount on your next order
                            </p>
                          </div>
                          <div className="p-4 border border-orange-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Free Delivery</span>
                              <Badge variant="warning">100 points</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Get free delivery on your next order
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};