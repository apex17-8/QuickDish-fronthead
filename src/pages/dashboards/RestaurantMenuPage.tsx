// src/pages/dashboards/RestaurantMenuPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, ChefHat, Package, DollarSign, 
  Star, Search, Filter, ShoppingBag, X, Save 
} from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../hooks/useAuth';
import { RestaurantOwnerService } from '../../services/restaurantOwnerService';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const RestaurantMenuPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
  });

  useEffect(() => {
    if (id) {
      loadMenuData();
      loadCategories();
    }
  }, [id]);

  const loadMenuData = async () => {
    setIsLoading(true);
    try {
      const restaurant = await RestaurantOwnerService.getRestaurantById(parseInt(id!));
      setMenuItems(restaurant.menuItems || []);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/restaurant-menu-categories');
      setCategories(response.data.filter((cat: any) => 
        !id || cat.restaurant?.restaurant_id === parseInt(id!)
      ));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.price || !newItem.category_id) {
      toast.error('Please fill in required fields: Name, Price, Category');
      return;
    }

    try {
      const menuItemData = {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        categoryId: parseInt(newItem.category_id),
        restaurantId: parseInt(id!),
        image_url: newItem.image_url,
        is_available: newItem.is_available ? 1 : 0,
      };

      const response = await RestaurantOwnerService.addMenuItem(
        parseInt(id!),
        menuItemData
      );
      
      toast.success('Menu item added successfully');
      setShowAddForm(false);
      setNewItem({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        is_available: true,
      });
      loadMenuData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add menu item');
    }
  };

  const handleUpdateMenuItem = async (itemId: number, updateData: any) => {
    try {
      await api.patch(`/menu-items/${itemId}`, updateData);
      toast.success('Menu item updated successfully');
      loadMenuData();
      setEditingItem(null);
    } catch (error: any) {
      toast.error('Failed to update menu item');
    }
  };

  const handleDeleteMenuItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await api.delete(`/menu-items/${itemId}`);
        toast.success('Menu item deleted successfully');
        loadMenuData();
      } catch (error) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  const handleAddCategory = async (categoryName: string) => {
    if (!categoryName.trim()) {
      toast.error('Please enter category name');
      return;
    }

    try {
      await api.post('/restaurant-menu-categories', {
        name: categoryName,
        restaurantId: parseInt(id!),
        description: '',
      });
      toast.success('Category added successfully');
      loadCategories();
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           item.category?.category_id?.toString() === selectedCategory ||
                           item.category_id?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your restaurant's menu items and categories
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/restaurant/${id}`)}
            >
              Back to Restaurant
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddForm(true)}
            >
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="info">
              {filteredItems.length} items
            </Badge>
            <Badge variant="success">
              {menuItems.filter(item => item.is_available).length} available
            </Badge>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingItem) && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingItem ? 
                (e) => {
                  e.preventDefault();
                  handleUpdateMenuItem(editingItem.menu_item_id, {
                    name: editingItem.name,
                    description: editingItem.description,
                    price: parseFloat(editingItem.price),
                  });
                } : 
                handleAddMenuItem}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={editingItem ? editingItem.name : newItem.name}
                      onChange={(e) => editingItem ?
                        setEditingItem({...editingItem, name: e.target.value}) :
                        setNewItem({...newItem, name: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Item name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (KES) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingItem ? editingItem.price : newItem.price}
                        onChange={(e) => editingItem ?
                          setEditingItem({...editingItem, price: e.target.value}) :
                          setNewItem({...newItem, price: e.target.value})
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingItem ? editingItem.description : newItem.description}
                    onChange={(e) => editingItem ?
                      setEditingItem({...editingItem, description: e.target.value}) :
                      setNewItem({...newItem, description: e.target.value})
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    placeholder="Item description..."
                  />
                </div>

                {!editingItem && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={newItem.category_id}
                        onChange={(e) => setNewItem({...newItem, category_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category.category_id} value={category.category_id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL (optional)
                      </label>
                      <input
                        type="url"
                        value={newItem.image_url}
                        onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                )}

                {!editingItem && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={newItem.is_available}
                      onChange={(e) => setNewItem({...newItem, is_available: e.target.checked})}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                      Item is available for ordering
                    </label>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChefHat className="w-5 h-5 mr-2" />
              Menu Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <Badge key={category.category_id} variant="outline" size="lg">
                  {category.name}
                  <span className="ml-2 text-gray-500">
                    ({menuItems.filter(item => 
                      item.category?.category_id === category.category_id ||
                      item.category_id === category.category_id
                    ).length})
                  </span>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="New category name..."
                id="newCategory"
                className="flex-1"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById('newCategory') as HTMLInputElement;
                  if (input.value) {
                    handleAddCategory(input.value);
                    input.value = '';
                  }
                }}
              >
                Add Category
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No matching items' : 'No menu items yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try changing your search criteria' 
                  : 'Add your first menu item to get started'}
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddForm(true)}
              >
                Add First Menu Item
              </Button>
            </div>
          ) : (
            filteredItems.map(item => (
              <Card key={item.menu_item_id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                    <Badge variant={item.is_available ? 'success' : 'danger'}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">KES {item.price}</span>
                    {item.category && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{item.category.name}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {item.image_url && (
                    <div className="mb-4">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </CardContent>
                
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUpdateMenuItem(item.menu_item_id, {
                        is_available: item.is_available ? 0 : 1
                      })}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMenuItem(item.menu_item_id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};