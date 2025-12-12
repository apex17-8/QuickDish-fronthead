import React from 'react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';

interface CartSummaryProps {
  onCheckout: () => void;
  isLoading?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  onCheckout,
  isLoading = false,
}) => {
  const { subtotal, deliveryFee, tax, total, items, isEmpty } = useCart();

  const summaryItems = [
    { label: 'Subtotal', value: `KSh ${subtotal.toFixed(2)}` },
    { label: 'Delivery Fee', value: `KSh ${deliveryFee.toFixed(2)}` },
    { label: 'Tax (16%)', value: `KSh ${tax.toFixed(2)}` },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>KSh {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>By placing your order, you agree to our Terms of Service</p>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        {isEmpty ? (
          <Link to="/restaurants" className="w-full">
            <Button variant="primary" size="lg" fullWidth>
              Browse Restaurants
            </Button>
          </Link>
        ) : (
          <Button
          title='Proceed to Checkout'
            variant="primary"
            size="lg"
            fullWidth
            onClick={onCheckout}
            isLoading={isLoading}
            disabled={isEmpty || isLoading}
          >
            Proceed to Checkout ({items.length} items)
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};