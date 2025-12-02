import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type{ Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const isOpen = restaurant.isOpen ?? true;

  return (
    <Card hoverable className="h-full">
      <Link to={`/restaurants/${restaurant.restaurant_id}`}>
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center">
              <span className="text-orange-800 font-bold text-xl">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={isOpen ? 'success' : 'danger'}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </Badge>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-semibold">{restaurant.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/restaurants/${restaurant.restaurant_id}`}>
          <h3 className="font-bold text-lg text-gray-900 hover:text-orange-500 mb-2">
            {restaurant.name}
          </h3>
        </Link>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{restaurant.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>30-45 min</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {restaurant.categories?.slice(0, 2).map((category, index) => (
              <Badge key={index} variant="default" size="sm">
                {typeof category === 'string' ? category : category.name}
              </Badge>
            ))}
            {restaurant.categories && restaurant.categories.length > 2 && (
              <Badge variant="default" size="sm">
                +{restaurant.categories.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};