import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Restaurant, MenuItem, RestaurantMenuCategory } from '../../types';
import { BACKEND_URL } from '../../utils/utils';

export const restaurantApi = createApi({
  reducerPath: 'restaurantApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BACKEND_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Restaurants', 'MenuItems', 'Categories'],
  endpoints: (builder) => ({
    // Restaurants
    getAllRestaurants: builder.query<Restaurant[], void>({
      query: () => '/restaurants',
      providesTags: ['Restaurants'],
    }),

    getRestaurantById: builder.query<Restaurant, number>({
      query: (id) => `/restaurants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Restaurants', id }],
    }),

    getFeaturedRestaurants: builder.query<Restaurant[], void>({
      query: () => '/restaurants/featured',
      providesTags: ['Restaurants'],
    }),

    searchRestaurants: builder.query<Restaurant[], string>({
      query: (query) => `/restaurants/search?q=${query}`,
      providesTags: ['Restaurants'],
    }),

    createRestaurant: builder.mutation<Restaurant, Partial<Restaurant>>({
      query: (restaurantData) => ({
        url: '/restaurants',
        method: 'POST',
        body: restaurantData,
      }),
      invalidatesTags: ['Restaurants'],
    }),

    updateRestaurant: builder.mutation<Restaurant, { id: number; restaurantData: Partial<Restaurant> }>({
      query: ({ id, restaurantData }) => ({
        url: `/restaurants/${id}`,
        method: 'PATCH',
        body: restaurantData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Restaurants', id }],
    }),

    deleteRestaurant: builder.mutation<void, number>({
      query: (id) => ({
        url: `/restaurants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Restaurants'],
    }),

    // Menu Items
    getRestaurantMenu: builder.query<MenuItem[], number>({
      query: (restaurantId) => `/restaurants/${restaurantId}/menu`,
      providesTags: ['MenuItems'],
    }),

    getMenuItemById: builder.query<MenuItem, number>({
      query: (id) => `/menu-items/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'MenuItems', id }],
    }),

    getPopularItems: builder.query<MenuItem[], number | void>({
      query: (restaurantId) => 
        restaurantId 
          ? `/menu-items/popular?restaurantId=${restaurantId}`
          : '/menu-items/popular',
      providesTags: ['MenuItems'],
    }),

    createMenuItem: builder.mutation<MenuItem, Partial<MenuItem>>({
      query: (menuItemData) => ({
        url: '/menu-items',
        method: 'POST',
        body: menuItemData,
      }),
      invalidatesTags: ['MenuItems'],
    }),

    updateMenuItem: builder.mutation<MenuItem, { id: number; menuItemData: Partial<MenuItem> }>({
      query: ({ id, menuItemData }) => ({
        url: `/menu-items/${id}`,
        method: 'PATCH',
        body: menuItemData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'MenuItems', id }],
    }),

    deleteMenuItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/menu-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MenuItems'],
    }),

    // Categories
    getRestaurantCategories: builder.query<RestaurantMenuCategory[], number>({
      query: (restaurantId) => `/restaurant-menu-categories/restaurant/${restaurantId}`,
      providesTags: ['Categories'],
    }),

    createCategory: builder.mutation<RestaurantMenuCategory, Partial<RestaurantMenuCategory>>({
      query: (categoryData) => ({
        url: '/restaurant-menu-categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<RestaurantMenuCategory, { id: number; categoryData: Partial<RestaurantMenuCategory> }>({
      query: ({ id, categoryData }) => ({
        url: `/restaurant-menu-categories/${id}`,
        method: 'PATCH',
        body: categoryData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Categories', id }],
    }),

    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/restaurant-menu-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const {
  useGetAllRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useGetFeaturedRestaurantsQuery,
  useSearchRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetRestaurantMenuQuery,
  useGetMenuItemByIdQuery,
  useGetPopularItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetRestaurantCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = restaurantApi;