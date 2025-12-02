import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { Button } from '../components/ui/button';
import { useCart } from '../hooks/useCart';
import { Card } from '../components/ui/card';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const {
    items,
    restaurantName,
    clearCart,
    updateQuantity,
    updateSpecialInstructions,
    removeFromCart,
    isEmpty,
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (items.length > 0) {
      if (window.confirm('Are you sure you want to clear your cart?')) {
        clearCart();
        toast.success('Cart cleared');
      }
    }
  };

  if (isEmpty) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto text-center p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some delicious food from our restaurants to get started!
            </p>
            <Link to="/restaurants">
              <Button variant="primary" size="lg">
                Browse Restaurants
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            {restaurantName && (
              <p className="text-gray-600 mt-2">
                Ordering from: <span className="font-semibold">{restaurantName}</span>
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <Link to="/restaurants">
              <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Continue Shopping
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleClearCart}
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <CartItem
                    key={item.menu_item.menu_item_id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onUpdateInstructions={updateSpecialInstructions}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <CartSummary onCheckout={handleCheckout} />
          </div>
        </div>
      </div>
    </Layout>
  );
};