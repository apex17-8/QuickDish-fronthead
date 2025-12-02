import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Rating } from '../ui/rating';
import { Button } from '../ui/button';
import { useCart } from '../../hooks/useCart';
import type{ MenuItem } from '../../types';
import toast from 'react-hot-toast';

interface FoodCardProps {
  item: MenuItem;
  showRestaurant?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  showRestaurant = false,
}) => {
  const { addToCart, canAddFromRestaurant } = useCart();

  const handleAddToCart = () => {
    if (!canAddFromRestaurant(item)) {
      toast.error(
        'You can only order from one restaurant at a time. Clear your cart to order from a different restaurant.',
        { duration: 5000 }
      );
      return;
    }

    addToCart(item, 1);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <Card hoverable className="h-full">
      <Link to={`/menu/${item.menu_item_id}`}>
        <div className="aspect-square overflow-hidden rounded-t-xl">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link to={`/menu/${item.menu_item_id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-orange-500">
                {item.name}
              </h3>
            </Link>
            {showRestaurant && (
              <p className="text-sm text-gray-500 mt-1">
                {item.restaurant.name}
              </p>
            )}
          </div>
          <span className="font-bold text-gray-900">KSh {item.price}</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <Rating rating={4.5} showNumber size="sm" />
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>{item.preparation_time} min</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          variant="primary"
          size="sm"
          fullWidth
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};