import React, { useState } from 'react';
import { Minus, Plus, Trash2, ChefHat } from 'lucide-react';
import type{ MenuItem } from '../../types';
import { Button } from '../ui/button';

interface CartItemProps {
  item: {
    menu_item: MenuItem;
    quantity: number;
    specialInstructions?: string;
  };
  onUpdateQuantity: (menuItemId: number, quantity: number) => void;
  onRemove: (menuItemId: number) => void;
  onUpdateInstructions: (menuItemId: number, instructions: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onUpdateInstructions,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState(item.specialInstructions || '');

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      onUpdateQuantity(item.menu_item.menu_item_id, newQuantity);
    }
  };

  const handleSaveInstructions = () => {
    onUpdateInstructions(item.menu_item.menu_item_id, instructions);
    setShowInstructions(false);
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-100">
      {/* Item Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 mr-4">
        {item.menu_item.image_url ? (
          <img
            src={item.menu_item.image_url}
            alt={item.menu_item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{item.menu_item.name}</h4>
            <p className="text-sm text-gray-500">KSh {item.menu_item.price}</p>
          </div>
          <button
          title='Remove Item'
            onClick={() => onRemove(item.menu_item.menu_item_id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
            title='Decrease Quantity'
              onClick={() => handleQuantityChange(-1)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
            title='Increase Quantity'
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <span className="font-bold text-gray-900">
            KSh {(item.menu_item.price * item.quantity).toFixed(2)}
          </span>
        </div>

        {/* Special Instructions */}
        <div className="mt-2">
          {showInstructions ? (
            <div className="space-y-2">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special instructions? (e.g., no onions, extra sauce)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={2}
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveInstructions}
                >
                  Save
                </Button>
                <Button
                title='Cancel Instructions'
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowInstructions(false);
                    setInstructions(item.specialInstructions || '');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
            title='Add Special Instructions'
              onClick={() => setShowInstructions(true)}
              className="text-sm text-orange-500 hover:text-orange-600"
            >
              {item.specialInstructions ? (
                <span className="text-gray-600">
                  Instructions: {item.specialInstructions}
                </span>
              ) : (
                '+ Add special instructions'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};