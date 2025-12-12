import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Truck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="text-xl font-bold">QuickFood</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Delivering delicious meals to your doorstep. Fast, reliable, and always fresh.
            </p>
            <div className="flex space-x-4">
              <a title="Facebook" href="#" className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a title="Twitter" href="#" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a title="Instagram" href="#" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a title="Linkedin" href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
              <li><Link to="/sitemap" className="text-gray-400 hover:text-white">Sitemap</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
              <li><Link to="/refund" className="text-gray-400 hover:text-white">Refund Policy</Link></li>
              <li><Link to="/security" className="text-gray-400 hover:text-white">Security</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                <span className="text-gray-400">123 Street, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">+254 700 000 000</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">support@quickfood.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-500" />
                <span className="text-sm">100% Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-blue-500" />
                <span className="text-sm">Multiple Payment Options</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-6 h-6 text-orange-500" />
                <span className="text-sm">Fast Delivery</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                © {currentYear} QuickFood. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};