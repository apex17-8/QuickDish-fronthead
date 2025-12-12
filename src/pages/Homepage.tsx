// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Shield, 
  Truck,
  ChevronRight,
  ChefHat,
  Coffee,
  Pizza,
  Cake,
  UtensilsCrossed,
  Package,
  Heart,
  Utensils,
  Sandwich,
  Salad
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { RestaurantCard } from '../components/food/RestaurantCard';
import { FoodCard } from '../components/food/FoodCard';
import { CategoryFilter } from '../components/food/CategoryFilter';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RestaurantService } from '../services/restaurantService';
import { useAuth } from '../hooks/useAuth';
import type { Restaurant, MenuItem } from '../types';
import toast from 'react-hot-toast';

// Mock data for fallback
const MOCK_FEATURED_RESTAURANTS: Restaurant[] = [
  {
    restaurant_id: 1,
    name: 'Burger Palace',
    address: '123 Main St, Nairobi',
    phone: '+254 712 345 678',
    logo_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&auto=format&fit=crop',
    rating: 4.5,
    deliveryTime: '30-45 min',
    categories: ['Burgers', 'Fast Food'],
    isOpen: true,
    owner: {
      user_id: 1,
      name: 'John Doe',
      email: 'owner@example.com',
      phone: '+254 712 345 678',
      role: 'restaurant_owner',
      created_at: new Date(),
      updated_at: new Date(),
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    restaurant_id: 2,
    name: 'Pizza Express',
    address: '456 Kenyatta Ave, Nairobi',
    phone: '+254 723 456 789',
    logo_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&auto=format&fit=crop',
    rating: 4.2,
    deliveryTime: '40-55 min',
    categories: ['Pizza', 'Italian'],
    isOpen: true,
    owner: {
      user_id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+254 723 456 789',
      role: 'restaurant_owner',
      created_at: new Date(),
      updated_at: new Date(),
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    restaurant_id: 3,
    name: 'Coffee Haven',
    address: '789 Westlands, Nairobi',
    phone: '+254 734 567 890',
    logo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop',
    rating: 4.8,
    deliveryTime: '20-35 min',
    categories: ['Coffee', 'Breakfast', 'Desserts'],
    isOpen: true,
    owner: {
      user_id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+254 734 567 890',
      role: 'restaurant_owner',
      created_at: new Date(),
      updated_at: new Date(),
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    restaurant_id: 4,
    name: 'Chinese Dragon',
    address: '101 Thika Road, Nairobi',
    phone: '+254 745 678 901',
    logo_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop',
    rating: 4.3,
    deliveryTime: '45-60 min',
    categories: ['Chinese', 'Asian'],
    isOpen: true,
    owner: {
      user_id: 4,
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      phone: '+254 745 678 901',
      role: 'restaurant_owner',
      created_at: new Date(),
      updated_at: new Date(),
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const MOCK_POPULAR_ITEMS: MenuItem[] = [
  {
    menu_item_id: 1,
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop',
    is_available: true,
    preparation_time: 15,
    category: {
      category_id: 1,
      name: 'Burgers',
      description: 'Delicious burgers',
      isActive: true,
      restaurant: { restaurant_id: 1 },
      menuItems: [],
    },
    restaurant: MOCK_FEATURED_RESTAURANTS[0],
    created_at: new Date(),
    updated_at: new Date(),
    rating: 4.7,
  },
  {
    menu_item_id: 2,
    name: 'Pepperoni Pizza',
    description: 'Classic pizza with pepperoni and mozzarella cheese',
    price: 800,
    image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop',
    is_available: true,
    preparation_time: 20,
    category: {
      category_id: 2,
      name: 'Pizza',
      description: 'Italian pizzas',
      isActive: true,
      restaurant: { restaurant_id: 2 },
      menuItems: [],
    },
    restaurant: MOCK_FEATURED_RESTAURANTS[1],
    created_at: new Date(),
    updated_at: new Date(),
    rating: 4.5,
  },
  {
    menu_item_id: 3,
    name: 'Cappuccino',
    description: 'Freshly brewed coffee with steamed milk',
    price: 200,
    image_url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&auto=format&fit=crop',
    is_available: true,
    preparation_time: 5,
    category: {
      category_id: 3,
      name: 'Coffee',
      description: 'Coffee and tea',
      isActive: true,
      restaurant: { restaurant_id: 3 },
      menuItems: [],
    },
    restaurant: MOCK_FEATURED_RESTAURANTS[2],
    created_at: new Date(),
    updated_at: new Date(),
    rating: 4.8,
  },
  {
    menu_item_id: 4,
    name: 'Kung Pao Chicken',
    description: 'Spicy chicken with peanuts and vegetables',
    price: 600,
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop',
    is_available: true,
    preparation_time: 25,
    category: {
      category_id: 4,
      name: 'Chinese',
      description: 'Chinese dishes',
      isActive: true,
      restaurant: { restaurant_id: 4 },
      menuItems: [],
    },
    restaurant: MOCK_FEATURED_RESTAURANTS[3],
    created_at: new Date(),
    updated_at: new Date(),
    rating: 4.4,
  },
];

const heroSlides = [
  {
    title: 'Delicious Food Delivered Fast',
    description: 'Get your favorite meals from top restaurants delivered to your doorstep',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop',
    bgColor: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Exclusive Offers',
    description: 'Up to 50% off on your first order with new restaurants',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop',
    bgColor: 'from-purple-500 to-purple-600',
  },
  {
    title: '24/7 Delivery',
    description: 'Craving something? Order anytime, day or night',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop',
    bgColor: 'from-blue-500 to-blue-600',
  },
];

const categories = [
  { icon: <UtensilsCrossed className="w-6 h-6" />, name: 'Fast Food', color: 'bg-orange-100 text-orange-600' },
  { icon: <Pizza className="w-6 h-6" />, name: 'Pizza', color: 'bg-red-100 text-red-600' },
  { icon: <Coffee className="w-6 h-6" />, name: 'Coffee', color: 'bg-amber-100 text-amber-600' },
  { icon: <ChefHat className="w-6 h-6" />, name: 'Fine Dining', color: 'bg-purple-100 text-purple-600' },
  { icon: <Cake className="w-6 h-6" />, name: 'Desserts', color: 'bg-pink-100 text-pink-600' },
  { icon: <Package className="w-6 h-6" />, name: 'Groceries', color: 'bg-green-100 text-green-600' },
];

const features = [
  {
    icon: <Shield className="w-10 h-10" />,
    title: '100% Safe',
    description: 'Secure payments and sanitized delivery',
  },
  {
    icon: <Clock className="w-10 h-10" />,
    title: 'Fast Delivery',
    description: 'Average delivery in 30-45 minutes',
  },
  {
    icon: <Star className="w-10 h-10" />,
    title: 'Top Quality',
    description: 'Fresh ingredients from trusted restaurants',
  },
  {
    icon: <Truck className="w-10 h-10" />,
    title: 'Live Tracking',
    description: 'Track your order in real-time',
  },
];

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [location, setLocation] = useState<string>('Nairobi, Kenya');

  // Auto slide hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch homepage data
  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Show loading toast
      const loadingToast = toast.loading('Loading restaurants and menu...');
      
      try {
        // Try to fetch real data
        const [restaurants, items] = await Promise.all([
          RestaurantService.getFeaturedRestaurants(),
          RestaurantService.getPopularItems(),
        ]);
        
        setFeaturedRestaurants(restaurants);
        setPopularItems(items);
        
        toast.success('Loaded successfully!', { id: loadingToast });
      } catch (error) {
        console.log('Using mock data due to:', error);
        setFeaturedRestaurants(MOCK_FEATURED_RESTAURANTS);
        setPopularItems(MOCK_POPULAR_ITEMS);
        
        toast.success('Using demo data', { id: loadingToast });
      }
    } catch (error: any) {
      console.error('Homepage data error:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      navigate('/restaurants');
    } else {
      navigate(`/restaurants?category=${encodeURIComponent(categoryId)}`);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation('Near you');
          toast.success('Location updated!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to get location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mx-4 mt-4">
        <div className="relative h-[400px] md:h-[500px]">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-90`} />
              </div>
              
              <div className="container mx-auto px-4 h-full flex items-center relative z-20">
                <div className="max-w-xl text-white">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl mb-8 opacity-95">{slide.description}</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/restaurants">
                      <Button
                        size="lg"
                        className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                      >
                        Order Now
                        <ChevronRight className="ml-2" />
                      </Button>
                    </Link>
                    {!isAuthenticated && (
                      <Link to="/signup">
                        <Button
                          variant="outline"
                          size="lg"
                          className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                        >
                          Sign Up Free
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Search & Location Bar */}
      <div className="container mx-auto px-4 mt-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for restaurants, dishes, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 px-8 py-6 text-lg rounded-xl"
              >
                Search
              </Button>
            </div>
          </form>
          
          {/* Location */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>Delivering to: <strong>{location}</strong></span>
            </div>
            <button
              onClick={handleGetLocation}
              className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Change Location
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 mt-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Featured Restaurants */}
      <div className="container mx-auto px-4 mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Restaurants</h2>
            <p className="text-gray-600 mt-2">Top-rated restaurants near you</p>
          </div>
          <Link 
            to="/restaurants" 
            className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 animate-pulse h-80 rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.restaurant_id} 
                restaurant={restaurant}
                showDeliveryTime
                showRating
              />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 rounded-3xl mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose QuickDish?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We deliver more than just food - we deliver experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="container mx-auto px-4 mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Popular Dishes</h2>
            <p className="text-gray-600 mt-2">Most ordered items this week</p>
          </div>
          <Link 
            to="/menu" 
            className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
          >
            View All Menu
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 animate-pulse h-96 rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.map((item) => (
              <FoodCard 
                key={item.menu_item_id} 
                item={item}
                showRestaurant
                showAddToCart
              />
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 mt-16 mb-12">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience the Best Food Delivery?
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Join thousands of satisfied customers enjoying delicious meals delivered fast
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/signup" className="flex-1 sm:flex-none">
                    <Button
                      size="lg"
                      className="bg-white text-orange-600 hover:bg-gray-100 w-full sm:w-auto px-8 py-6 text-lg font-semibold"
                    >
                      Sign Up Free
                    </Button>
                  </Link>
                  <Link to="/login" className="flex-1 sm:flex-none">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto px-8 py-6 text-lg"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/restaurants">
                  <Button
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                  >
                    Browse Restaurants
                    <ChevronRight className="ml-2" />
                  </Button>
                </Link>
              )}
            </div>
            
            {/* App download CTA */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-lg mb-6">Download our app for better experience</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🍎</div>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-lg font-semibold">App Store</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🤖</div>
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-lg font-semibold">Google Play</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};