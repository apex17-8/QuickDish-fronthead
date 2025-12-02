import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity as updateQuantityAction,
  updateSpecialInstructions as updateSpecialInstructionsAction,
  clearCart as clearCartAction,
  selectCartItems,
  selectCartTotal,
  selectCartSubtotal,
  selectCartDeliveryFee,
  selectCartTax,
  selectCartRestaurantId,
  selectCartRestaurantName,
  selectCartItemCount,
  selectIsCartEmpty,
  selectCartLoading,
} from '../store/slices/cartSlice';
import type{ MenuItem } from '../types';

export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectCartDeliveryFee);
  const tax = useSelector(selectCartTax);
  const restaurantId = useSelector(selectCartRestaurantId);
  const restaurantName = useSelector(selectCartRestaurantName);
  const itemCount = useSelector(selectCartItemCount);
  const isEmpty = useSelector(selectIsCartEmpty);
  const isLoading = useSelector(selectCartLoading);

  const addToCart = useCallback((menuItem: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    dispatch(addToCartAction({ menuItem, quantity, specialInstructions }));
  }, [dispatch]);

  const removeFromCart = useCallback((menuItemId: number) => {
    dispatch(removeFromCartAction(menuItemId));
  }, [dispatch]);

  const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
    dispatch(updateQuantityAction({ menuItemId, quantity }));
  }, [dispatch]);

  const updateSpecialInstructions = useCallback((menuItemId: number, instructions: string) => {
    dispatch(updateSpecialInstructionsAction({ menuItemId, instructions }));
  }, [dispatch]);

  const clearCart = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  const getItemQuantity = useCallback((menuItemId: number): number => {
    const item = items.find(item => item.menu_item.menu_item_id === menuItemId);
    return item ? item.quantity : 0;
  }, [items]);

  const getItemSpecialInstructions = useCallback((menuItemId: number): string | undefined => {
    const item = items.find(item => item.menu_item.menu_item_id === menuItemId);
    return item?.specialInstructions;
  }, [items]);

  const canAddFromRestaurant = useCallback((menuItem: MenuItem): boolean => {
    if (isEmpty) return true;
    if (restaurantId === menuItem.restaurant.restaurant_id) return true;
    return false;
  }, [isEmpty, restaurantId]);

  return {
    items,
    total,
    subtotal,
    deliveryFee,
    tax,
    restaurantId,
    restaurantName,
    itemCount,
    isEmpty,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateSpecialInstructions,
    clearCart,
    getItemQuantity,
    getItemSpecialInstructions,
    canAddFromRestaurant,
  };
};