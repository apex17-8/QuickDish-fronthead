import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Bell,
  User as UserIcon,
  MapPin,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  /** -------------------------
   *   SAFER SEARCH HANDLER
   *  ------------------------- */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  /** -------------------------
   *   MENU ITEMS - MEMOIZED
   *  ------------------------- */
  const userMenuItems = useMemo(
    () => [
      { label: 'Profile', href: '/profile' },
      { label: 'Orders', href: '/orders' },
      { label: 'Settings', href: '/settings' },
      { label: 'Logout', onClick: logout },
    ],
    [logout]
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="text-xl font-bold text-gray-900">QuickFood</span>
          </Link>

          {/* Location Selector */}
          <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Chuka, Kenya</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold 
                  rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button title="Notifications" className="relative">
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3 h-3"></span>
            </button>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium text-gray-900">Welcome!</p>
                      <p className="text-sm text-gray-500">{user?.name || 'User'}</p>
                    </div>

                    {userMenuItems.map((item, i) => (
                      <Link
                        key={i}
                        to={item.href ?? '#'}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          item.onClick?.();
                        }}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              title="Menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-orange-500">
                Home
              </Link>
              <Link to="/restaurants" className="text-gray-700 hover:text-orange-500">
                Restaurants
              </Link>
              <Link to="/offers" className="text-gray-700 hover:text-orange-500">
                Offers
              </Link>
              <Link to="/help" className="text-gray-700 hover:text-orange-500">
                Help
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
