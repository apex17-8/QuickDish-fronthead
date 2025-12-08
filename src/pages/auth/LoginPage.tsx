// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Smartphone, User, Truck, Building, Headphones, Shield } from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          redirectBasedOnRole(user.role);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, [isAuthenticated, navigate]);

  const redirectBasedOnRole = (role: string) => {
    switch(role) {
      case 'restaurant_owner':
      case 'manager':
        navigate('/dashboard/restaurant');
        break;
      case 'rider':
        navigate('/dashboard/rider');
        break;
      case 'customer_care':
      case 'super_admin':
        navigate('/dashboard/admin');
        break;
      case 'customer':
      default:
        navigate('/dashboard');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      //useAuth hook handles redirection
      
      if (!result.success) {
        toast.error(result.error || 'Login failed');
      }
      // Success message is shown in useAuth hook
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo account buttons for testing different roles
  const demoAccounts = [
    { 
      role: 'customer', 
      email: 'customer@example.com', 
      password: 'password123',
      icon: <User className="w-4 h-4" />,
      color: 'bg-blue-500',
      description: 'Regular customer'
    },
    { 
      role: 'restaurant_owner', 
      email: 'owner@example.com', 
      password: 'password123',
      icon: <Building className="w-4 h-4" />,
      color: 'bg-orange-500',
      description: 'Restaurant owner'
    },
    { 
      role: 'rider', 
      email: 'rider@example.com', 
      password: 'password123',
      icon: <Truck className="w-4 h-4" />,
      color: 'bg-green-500',
      description: 'Delivery rider'
    },
    { 
      role: 'manager', 
      email: 'manager@example.com', 
      password: 'password123',
      icon: <User className="w-4 h-4" />,
      color: 'bg-purple-500',
      description: 'Restaurant manager'
    },
    { 
      role: 'customer_care', 
      email: 'care@example.com', 
      password: 'password123',
      icon: <Headphones className="w-4 h-4" />,
      color: 'bg-pink-500',
      description: 'Customer support'
    },
    { 
      role: 'super_admin', 
      email: 'admin@example.com', 
      password: 'password123',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-red-500',
      description: 'System admin'
    },
  ];

  const handleDemoLogin = (demoEmail: string, demoPassword: string, role: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success(`Using ${role.replace('_', ' ')} demo account`);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Illustration/Info */}
        <div className="lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 p-8 lg:p-12 flex flex-col justify-center text-white">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Welcome to FoodExpress</h1>
              <p className="text-orange-100 text-lg">
                Order food from your favorite restaurants and get it delivered to your doorstep.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Easy Ordering</h3>
                  <p className="text-orange-100">Browse menus and order with just a few clicks</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Fast Delivery</h3>
                  <p className="text-orange-100">Get your food delivered in minutes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Secure Payments</h3>
                  <p className="text-orange-100">Your payments are safe and secure</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-orange-100">
                Join thousands of customers, restaurants, and riders using our platform
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
              <p className="text-gray-600 mt-2">Access your dashboard</p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium transition"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="py-3"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Demo Accounts Section */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium">Quick Test Accounts</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => handleDemoLogin(account.email, account.password, account.role)}
                      className="p-3 border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center">
                        <div className={`${account.color} p-2 rounded-lg mr-3 group-hover:scale-110 transition`}>
                          <div className="text-white">{account.icon}</div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-sm capitalize">{account.role.replace('_', ' ')}</span>
                            <Badge 
                              variant={
                                account.role === 'super_admin' ? 'danger' :
                                account.role === 'customer_care' ? 'warning' :
                                account.role === 'rider' ? 'success' :
                                account.role === 'restaurant_owner' || account.role === 'manager' ? 'info' : 'default'
                              } 
                              size="sm" 
                              className="ml-2"
                            >
                              {account.role === 'super_admin' ? 'Admin' :
                               account.role === 'customer_care' ? 'Support' :
                               account.role === 'rider' ? 'Rider' :
                               account.role === 'restaurant_owner' ? 'Owner' :
                               account.role === 'manager' ? 'Manager' : 'Customer'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{account.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center py-2.5"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center py-2.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center pt-6 border-t">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-orange-500 hover:text-orange-600 font-medium transition"
                >
                  Create account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};