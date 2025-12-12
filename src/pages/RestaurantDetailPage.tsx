import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Phone, Star, Clock, Truck, Shield, ChevronLeft,
  Heart, Share2, Filter, ShoppingBag, Users, CreditCard
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { RestaurantService } from '../services/restaurantService';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';
import type { Restaurant, MenuItem } from '../types';

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    } else {
      navigate('/restaurants');
    }
  }, [id]);

  const loadRestaurantData = async () => {
    setIsLoading(true);
    try {
      const [restaurantData, menuData] = await Promise.all([
        RestaurantService.getRestaurantById(parseInt(id!)),
        RestaurantService.getRestaurantMenu(parseInt(id!))
      ]);
      
      setRestaurant(restaurantData);
      setMenuItems(menuData);
    } catch (error: any) {
      console.error('Error loading restaurant:', error);
      toast.error('Failed to load restaurant details');
      navigate('/restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    try {
      addToCart({
        menuItem: item,
        quantity: 1,
        specialInstructions: ''
      });
      toast.success(`${item.name} added to cart`);
    } catch (error: any) {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
            <Button onClick={() => navigate('/restaurants')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Restaurants
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const categories = Array.from(new Set(menuItems.map(item => item.category?.name || 'Uncategorized')));
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category?.name === activeCategory);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/restaurants')}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Restaurants
        </Button>

        {/* Restaurant Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Restaurant Image */}
            <div className="md:w-1/3">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                {restaurant.logo_url ? (
                  <img 
                    src={restaurant.logo_url} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Users className="w-16 h-16 mx-auto mb-2" />
                      <p>No Image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="md:w-2/3">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {restaurant.cuisine || 'Various'}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{restaurant.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-gray-500 ml-1">({Math.floor(Math.random() * 100)} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{restaurant.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Delivery: {restaurant.deliveryTime || '30-45 min'}</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm">Free delivery over KES 500</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm">Card & Mobile Money</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm">Safe delivery</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm">Open now</span>
                </div>
              </div>

              {/* Description */}
              {restaurant.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-600">{restaurant.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Menu</h2>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('all')}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <div key={item.menu_item_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">KES {item.price.toFixed(2)}</p>
                        {item.rating && (
                          <div className="flex items-center justify-end mt-1">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            <span className="text-xs text-gray-600">{item.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{item.preparation_time} min</span>
                        {!item.is_available && (
                          <Badge variant="destructive" className="ml-2">
                            Sold Out
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.is_available}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items Available</h3>
              <p className="text-gray-600">This restaurant hasn't added any menu items yet.</p>
            </div>
          )}
        </div>

        {/* Reviews & Info Tabs */}
        <Tabs defaultValue="reviews" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="info">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Restaurant Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Cuisine</h4>
                  <p className="text-gray-600">{restaurant.cuisine || 'Various'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Price Range</h4>
                  <p className="text-gray-600">{restaurant.price_range || '$$'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Delivery Fee</h4>
                  <p className="text-gray-600">KES {restaurant.delivery_fee || '100'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};