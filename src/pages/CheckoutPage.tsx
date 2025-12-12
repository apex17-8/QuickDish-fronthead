// src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Shield, Loader, AlertCircle } from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CartSummary } from '../components/cart/CartSummary';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useOrderWorkflow } from '../hooks/useOrderWorkflow';
import { CustomerService } from '../services/customerService';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);
  
  const { items, total, clearCart, restaurantId, restaurantName } = useCart();
  const { user, customer, refreshUserData } = useAuth();
  const { placeOrder, isPlacingOrder } = useOrderWorkflow();
  const navigate = useNavigate();

  // Load customer's default address
  useEffect(() => {
    if (customer?.default_address) {
      setDeliveryAddress(customer.default_address);
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    // Get customer ID properly
    const customerId = customer?.customer_id || user.user_id;

    setIsLoading(true);
    try {
      // Update customer's default address if needed
      if (customer && deliveryAddress !== customer.default_address) {
        try {
          // FIX: Remove customer_id parameter - method only takes address
          await CustomerService.setDefaultAddress(deliveryAddress);
          await refreshUserData();
        } catch (error) {
          console.warn('Failed to update default address:', error);
          // Don't fail the order if address update fails
        }
      }

      // Prepare order data - FIXED to match backend DTO
      const orderData = {
        customer_id: customerId,
        restaurant_id: restaurantId,
        delivery_address: deliveryAddress,
        notes: instructions,
        items: items.map(item => ({
          menu_item_id: item.menu_item.menu_item_id, // FIXED property name
          quantity: item.quantity,
          special_instructions: item.specialInstructions, // FIXED property name
        })),
        // Remove total - backend calculates it
      };

      // Place order using workflow hook
      const order = await placeOrder(orderData, paymentMethod);
      
      if (order) {
        // Show success message
        toast.success(`Order #${order.order_number || order.order_id} placed successfully!`, {
          duration: 5000,
        });
        
        // Clear cart
        clearCart();
        
        // Redirect based on payment method
        if (paymentMethod === 'cash') {
          navigate(`/orders/${order.order_id}`);
        } else {
          // For online payments, show payment status
          navigate(`/orders/${order.order_id}/payment`);
        }
      }
    } catch (error: any) {
      console.error('Order placement error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address (street, building, floor, apartment)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                    required
                  />
                  {customer?.default_address && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDeliveryAddress(customer.default_address)}
                      >
                        Use default address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Any special instructions for delivery? (e.g., leave at door, call before delivery, gate code, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Please provide specific details for easier delivery
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 text-orange-500"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Credit/Debit Card</span>
                        <p className="text-sm text-gray-500">Pay with your card (Visa, MasterCard)</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="mobile"
                        checked={paymentMethod === 'mobile'}
                        onChange={() => setPaymentMethod('mobile')}
                        className="w-4 h-4 text-orange-500"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Mobile Money</span>
                        <p className="text-sm text-gray-500">M-Pesa, Airtel Money, T-Kash</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="w-4 h-4 text-orange-500"
                      />
                      <div className="ml-3">
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div>
              <CartSummary onCheckout={() => {}} isLoading={isLoading || isPlacingOrder} />
              
              {/* Security Badge */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Your payment information is encrypted and secure
                  </p>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Restaurant:</span>
                      <span className="font-medium">{restaurantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{items.length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium">30-45 minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading || isPlacingOrder}
              disabled={isLoading || isPlacingOrder || items.length === 0}
              leftIcon={isLoading || isPlacingOrder ? <Loader className="w-5 h-5 animate-spin" /> : undefined}
            >
              {isLoading || isPlacingOrder 
                ? 'Processing Order...' 
                : `Place Order - KSh ${total.toFixed(2)}`
              }
            </Button>
            
            <p className="text-sm text-gray-500 text-center mt-4">
              By placing your order, you agree to our Terms of Service
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
};