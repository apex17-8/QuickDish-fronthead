import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Star, Clock, MapPin, ChevronRight,
  SlidersHorizontal, X, ChefHat, DollarSign, Truck, Shield
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { RestaurantCard } from '../components/food/RestaurantCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { RestaurantService } from '../services/restaurantService';
import toast from 'react-hot-toast';
import type { Restaurant } from '../types';

export const RestaurantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'all';
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [activeCategory, setActiveCategory] = useState(categoryFilter);
  const [filters, setFilters] = useState({
    rating: 0,
    deliveryTime: '',
    priceRange: [0, 5000] as [number, number],
    isOpen: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadRestaurants();
    loadCategories();
  }, [activeCategory, filters]);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const data = await RestaurantService.getAllRestaurants(1, 50, {
        search: searchQuery,
        category: activeCategory !== 'all' ? activeCategory : undefined,
        rating: filters.rating > 0 ? filters.rating : undefined,
        isOpen: filters.isOpen,
        sortBy: 'rating',
        sortOrder: 'desc'
      });
      setRestaurants(data.items);
    } catch (error: any) {
      console.error('Error loading restaurants:', error);
      toast.error('Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await RestaurantService.getAllCategories();
      setCategories(['all', ...data]);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(['all', 'Burgers', 'Pizza', 'Coffee', 'Chinese', 'Italian']);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/restaurants?search=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      window.location.href = '/restaurants';
    } else {
      window.location.href = `/restaurants?category=${encodeURIComponent(category)}`;
    }
  };

  const clearFilters = () => {
    setFilters({
      rating: 0,
      deliveryTime: '',
      priceRange: [0, 5000],
      isOpen: true,
    });
    setActiveCategory('all');
    setSearchInput('');
    window.location.href = '/restaurants';
  };

  const featuredRestaurants = restaurants.slice(0, 4);
  const allRestaurants = restaurants.slice(4);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing Restaurants
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Order from the best restaurants in your area. Fast delivery, great prices, and amazing food!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for restaurants, cuisines, or dishes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-12 pr-24 py-6 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 px-6 py-4"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              {(activeCategory !== 'all' || searchQuery || filters.rating > 0) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="text-gray-600">
              Showing <span className="font-bold">{restaurants.length}</span> restaurants
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <Badge
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  activeCategory === category 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category === 'all' ? 'All Categories' : category}
              </Badge>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white border rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[4, 3, 2, 1].map(rating => (
                      <Button
                        key={rating}
                        type="button"
                        variant={filters.rating === rating ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, rating }))}
                        className="flex items-center gap-1"
                      >
                        <Star className="w-4 h-4" />
                        {rating}+
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={filters.rating === 0 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, rating: 0 }))}
                    >
                      Any
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        priceRange: [Number(e.target.value), prev.priceRange[1]] 
                      }))}
                      className="w-24"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        priceRange: [prev.priceRange[0], Number(e.target.value)] 
                      }))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={filters.isOpen ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, isOpen: true }))}
                    >
                      Open Now
                    </Button>
                    <Button
                      type="button"
                      variant={!filters.isOpen ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, isOpen: false }))}
                    >
                      Show All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Restaurants */}
        {featuredRestaurants.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Restaurants</h2>
              <Link 
                to="/restaurants?sortBy=rating" 
                className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
              >
                View All Top Rated
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRestaurants.map(restaurant => (
                <RestaurantCard 
                  key={restaurant.restaurant_id} 
                  restaurant={restaurant}
                  showDeliveryTime
                  showRating
                  showCategories
                />
              ))}
            </div>
          </div>
        )}

        {/* All Restaurants */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Restaurants'}
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse h-80 rounded-2xl" />
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRestaurants.map(restaurant => (
                <RestaurantCard 
                  key={restaurant.restaurant_id} 
                  restaurant={restaurant}
                  showDeliveryTime
                  showRating
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Restaurants Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No restaurants found for "${searchQuery}". Try a different search.`
                  : 'No restaurants available at the moment.'}
              </p>
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 bg-gray-50 rounded-3xl p-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Order With Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best food delivery experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Average delivery in 30-45 minutes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Competitive prices and great offers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600 text-sm">Secure payments and sanitized delivery</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Top Quality</h3>
              <p className="text-gray-600 text-sm">Fresh ingredients from trusted restaurants</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};