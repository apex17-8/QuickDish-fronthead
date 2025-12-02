import React from 'react';
import { Coffee, Pizza, Sandwich, Salad, Utensils, Cake } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All', icon: Utensils, color: 'text-gray-600' },
  { id: 'burgers', name: 'Burgers', icon: Sandwich, color: 'text-orange-500' },
  { id: 'pizza', name: 'Pizza', icon: Pizza, color: 'text-red-500' },
  { id: 'salads', name: 'Salads', icon: Salad, color: 'text-green-500' },
  { id: 'desserts', name: 'Desserts', icon: Cake, color: 'text-purple-500' },
  { id: 'drinks', name: 'Drinks', icon: Coffee, color: 'text-blue-500' },
];

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex space-x-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl min-w-[80px] transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : category.color}`} />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};