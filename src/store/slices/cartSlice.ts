import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type{ CartItem } from '../../types';
import type { MenuItem } from '../../types';

interface CartState {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  isLoading: boolean;
}

const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 100;
  const tax = subtotal * 0.16;
  const total = subtotal + deliveryFee + tax;
  
  return { subtotal, deliveryFee, tax, total };
};

const saveCartToLocalStorage = (items: CartItem[], restaurantId: number | null, restaurantName: string | null) => {
  localStorage.setItem('cart', JSON.stringify(items));
  if (restaurantId) {
    localStorage.setItem('cartRestaurantId', restaurantId.toString());
    if (restaurantName) {
      localStorage.setItem('cartRestaurantName', restaurantName);
    }
  }
};

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  restaurantId: localStorage.getItem('cartRestaurantId') ? parseInt(localStorage.getItem('cartRestaurantId')!) : null,
  restaurantName: localStorage.getItem('cartRestaurantName') || null,
  ...calculateCartTotals(JSON.parse(localStorage.getItem('cart') || '[]')),
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ menuItem: MenuItem; quantity: number; specialInstructions?: string }>) => {
      const { menuItem, quantity, specialInstructions } = action.payload;
      
      // Check if we're adding from a different restaurant
      if (state.restaurantId && state.restaurantId !== menuItem.restaurant.restaurant_id) {
        // Clear cart and start new
        state.items = [];
        state.restaurantId = menuItem.restaurant.restaurant_id;
        state.restaurantName = menuItem.restaurant.name;
      } else if (!state.restaurantId) {
        // First item in cart
        state.restaurantId = menuItem.restaurant.restaurant_id;
        state.restaurantName = menuItem.restaurant.name;
      }

      const existingItemIndex = state.items.findIndex(
        item => item.menu_item.menu_item_id === menuItem.menu_item_id
      );

      if (existingItemIndex !== -1) {
        // Update existing item
        state.items[existingItemIndex].quantity += quantity;
        if (specialInstructions) {
          state.items[existingItemIndex].specialInstructions = specialInstructions;
        }
      } else {
        // Add new item
        state.items.push({
          menu_item: menuItem,
          quantity,
          specialInstructions,
        });
      }

      // Recalculate totals
      const totals = calculateCartTotals(state.items);
      state.subtotal = totals.subtotal;
      state.deliveryFee = totals.deliveryFee;
      state.tax = totals.tax;
      state.total = totals.total;

      // Save to localStorage
      saveCartToLocalStorage(state.items, state.restaurantId, state.restaurantName);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const menuItemId = action.payload;
      state.items = state.items.filter(item => item.menu_item.menu_item_id !== menuItemId);
      
      // If cart is empty, clear restaurant info
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
        localStorage.removeItem('cartRestaurantId');
        localStorage.removeItem('cartRestaurantName');
      }

      // Recalculate totals
      const totals = calculateCartTotals(state.items);
      state.subtotal = totals.subtotal;
      state.deliveryFee = totals.deliveryFee;
      state.tax = totals.tax;
      state.total = totals.total;

      // Save to localStorage
      saveCartToLocalStorage(state.items, state.restaurantId, state.restaurantName);
    },

    updateQuantity: (state, action: PayloadAction<{ menuItemId: number; quantity: number }>) => {
      const { menuItemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.menu_item.menu_item_id === menuItemId);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }

        // Recalculate totals
        const totals = calculateCartTotals(state.items);
        state.subtotal = totals.subtotal;
        state.deliveryFee = totals.deliveryFee;
        state.tax = totals.tax;
        state.total = totals.total;

        // Save to localStorage
        saveCartToLocalStorage(state.items, state.restaurantId, state.restaurantName);
      }
    },

    updateSpecialInstructions: (state, action: PayloadAction<{ menuItemId: number; instructions: string }>) => {
      const { menuItemId, instructions } = action.payload;
      const itemIndex = state.items.findIndex(item => item.menu_item.menu_item_id === menuItemId);
      
      if (itemIndex !== -1) {
        state.items[itemIndex].specialInstructions = instructions;
        saveCartToLocalStorage(state.items, state.restaurantId, state.restaurantName);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = null;
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.tax = 0;
      state.total = 0;
      
      localStorage.removeItem('cart');
      localStorage.removeItem('cartRestaurantId');
      localStorage.removeItem('cartRestaurantName');
    },

    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateSpecialInstructions,
  clearCart,
  setCartLoading,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartSubtotal = (state: { cart: CartState }) => state.cart.subtotal;
export const selectCartDeliveryFee = (state: { cart: CartState }) => state.cart.deliveryFee;
export const selectCartTax = (state: { cart: CartState }) => state.cart.tax;
export const selectCartRestaurantId = (state: { cart: CartState }) => state.cart.restaurantId;
export const selectCartRestaurantName = (state: { cart: CartState }) => state.cart.restaurantName;
export const selectCartItemCount = (state: { cart: CartState }) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectIsCartEmpty = (state: { cart: CartState }) => state.cart.items.length === 0;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.isLoading;

export default cartSlice.reducer;
