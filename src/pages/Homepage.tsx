// src/pages/Homepage.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Clock, 
  Star, 
  Truck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Layout } from '../components/layout/layout';
import { RestaurantCard } from '../components/food/RestaurantCard';
import { FoodCard } from '../components/food/FoodCard';
import { CategoryFilter } from '../components/food/CategoryFilter';
import { Button } from '../components/ui/button';
import { RestaurantService } from '../services/restaurantService';
import type { Restaurant, MenuItem } from '../types';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Delicious Food Delivered Fast',
      description: 'Get your favorite meals delivered in minutes',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    },
    {
      title: 'Exclusive Offers',
      description: 'Up to 50% off on your first order',
      image: 'https://images.unsplash.com/flagged/photo-1578832755387-4973ac1fc67f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODR8fGZvb2QlMjBvZmZlcnMlMjBhZnJpY2FufGVufDB8fDB8fHww',
    },
    {
      title: '24/7 Delivery',
      description: 'Order anytime, anywhere',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
    },
  ];

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setIsLoading(true);
      const [restaurants, items] = await Promise.all([
        RestaurantService.getFeaturedRestaurants(),
        RestaurantService.getPopularItems(),
      ]);
      setFeaturedRestaurants(restaurants);
      setPopularItems(items);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: '100% secure payment',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Delivery in 30-45 minutes',
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Best Quality',
      description: 'Fresh ingredients',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Live Tracking',
      description: 'Track your order in real-time',
    },
  ];

  return (
    <Layout>
      {/* Hero Section - FIXED: All elements wrapped in a single parent div */}
      <div className="relative overflow-hidden">
        <div className="relative h-[500px]">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                <div className="max-w-xl text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-xl mb-8 opacity-90">{slide.description}</p>
                  <Link to="/restaurants">
                    <Button
                      variant="primary"
                      size="lg"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="bg-golden text-orange-600 hover:bg-gray-100"
                    >
                      Order Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows - Now properly placed inside the parent div */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white transition-colors z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white transition-colors z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 pb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Browse by Category
        </h2>
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Featured Restaurants */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Restaurants
          </h2>
          <Link to="/restaurants" className="text-orange-500 hover:text-orange-600 font-medium">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 animate-pulse h-64 rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRestaurants.slice(0, 4).map((restaurant) => (
              <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>

      {/* Popular Items */}
      <div className="container mx-auto px-4 py-8 bg-gray-50 rounded-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Popular Items
          </h2>
          <Link to="/menu" className="text-orange-500 hover:text-orange-600 font-medium">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 animate-pulse h-80 rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.slice(0, 8).map((item) => (
              <FoodCard key={item.menu_item_id} item={item} showRestaurant />
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            You will be able to download our app for faster ordering and exclusive offers soon
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              className="bg-golden text-orange-600 hover:bg-gray-100"
            >
              App to be on App Store soon!
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              Download on Google Play 
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};