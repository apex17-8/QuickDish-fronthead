import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  Filter,
  Search,
  Plus,
  Minus
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Rating } from '../components/ui/rating';
import { FoodCard } from '../components/food/FoodCard';
import { RestaurantService } from '../services/restaurantService';
import { useCart } from '../hooks/useCart';
import type{ Restaurant, MenuItem, RestaurantMenuCategory } from '../types';
import toast from 'react-hot-toast';

export const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<RestaurantMenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { addToCart, canAddFromRestaurant } = useCart();

  useEffect(() => {
    if (id) {
      fetchRestaurantData();
    }
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      const restaurantId = parseInt(id!);
      const [restaurantData, menuData, categoriesData] = await Promise.all([
        RestaurantService.getRestaurantById(restaurantId),
        RestaurantService.getRestaurantMenu(restaurantId),
        RestaurantService.getRestaurantCategories(restaurantId),
      ]);

      setRestaurant(restaurantData);
      setMenuItems(menuData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Failed to load restaurant data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || 
      item.category?.category_id === parseInt(activeCategory);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="h-64 bg-gray-200 animate-pulse rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="h-8 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
                <div className="h-48 bg-gray-200 animate-pulse rounded-xl"></div>
              </div>
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
          <Card className="max-w-2xl mx-auto text-center p-8">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
            <p className="text-gray-600 mb-6">
              The restaurant you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="primary">Browse Restaurants</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Restaurant Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            {/* Restaurant Logo */}
            <div className="w-24 h-24 rounded-xl bg-white p-2 shadow-lg mb-4 md:mb-0 md:mr-8">
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-12 h-12 text-orange-600" />
                </div>
              )}
            </div>

            {/* Restaurant Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Rating rating={restaurant.rating || 4.5} showNumber />
                  <span className="ml-2">({Math.floor(Math.random() * 1000)} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>30-45 min • KSh 100 delivery fee</span>
                </div>
                <Badge variant={restaurant.isOpen ? 'success' : 'danger'}>
                  {restaurant.isOpen ? 'OPEN NOW' : 'CLOSED'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  <span>{restaurant.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Filter */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center">
                    <Filter className="w-5 h-5 text-gray-500 mr-2" />
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex overflow-x-auto pb-2 -mx-4 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                        activeCategory === 'all'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Items
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.category_id}
                        onClick={() => setActiveCategory(category.category_id.toString())}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                          activeCategory === category.category_id.toString()
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Menu Items Grid */}
              {filteredItems.length === 0 ? (
                <Card className="text-center p-8">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Items Found</h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? `No items matching "${searchQuery}"`
                      : 'No items in this category'}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.menu_item_id} hoverable>
                      <div className="aspect-square overflow-hidden rounded-t-xl">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ChefHat className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category?.name}</p>
                          </div>
                          <span className="font-bold text-gray-900">KSh {item.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Rating rating={4.5} size="sm" />
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{item.preparation_time} min</span>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          className="mt-4"
                          leftIcon={<Plus className="w-4 h-4" />}
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Restaurant Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Restaurant Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Opening Hours</p>
                      <p className="font-medium">8:00 AM - 11:00 PM</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Area</p>
                      <p className="font-medium">Within 10km radius</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Minimum Order</p>
                      <p className="font-medium">KSh 300</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Items */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Popular Items</h3>
                  <div className="space-y-4">
                    {menuItems.slice(0, 3).map((item) => (
                      <div key={item.menu_item_id} className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 mr-3 overflow-hidden">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">KSh {item.price}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddToCart(item)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};