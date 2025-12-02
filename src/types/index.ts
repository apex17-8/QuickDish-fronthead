// ============= USER TYPES =============
export interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export enum UserRole {
  SuperAdmin = 'super_admin',
  RestaurantOwner = 'restaurant_owner',
  Manager = 'manager',
  CustomerCare = 'customer_care',
  Rider = 'rider',
  Customer = 'customer',
}

// ============= AUTH TYPES =============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

// ============= RESTAURANT TYPES =============
export interface Restaurant {
  restaurant_id: number;
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  rating: number;
  deliveryTime?: string;
  categories?: string[];
  isOpen?: boolean;
  owner: User;
  created_at: Date;
  updated_at: Date;
  menuCategories?: RestaurantMenuCategory[];
  menuItems?: MenuItem[];
}

// ============= MENU & FOOD TYPES =============
export interface MenuItem {
  menu_item_id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
  category: RestaurantMenuCategory;
  restaurant: Restaurant;
  created_at: Date;
  updated_at: Date;
  rating?: number;
}

export interface RestaurantMenuCategory {
  category_id: number;
  name: string;
  description?: string;
  isActive: boolean;
  restaurant: Restaurant;
  menuItems: MenuItem[];
}

// ============= RIDER TYPES =============
export interface Rider {
  rider_id: number;
  user: User;
  vehicle_type: string;
  is_online: boolean;
  rating: number;
  currentLatitude: number;
  currentLongitude: number;
  last_location: string;
  created_at: Date;
  updated_at: Date;
  locations?: RiderLocation[];
  orders?: Order[];
}

export interface RiderLocation {
  id: number;
  rider: Rider;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: Date;
}

// ============= CUSTOMER TYPES =============
export interface Customer {
  customer_id: number;
  user: User;
  loyalty_points: number;
  default_address: string;
  orders?: Order[];
}

// ============= ORDER TYPES =============
export type OrderStatus = 
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'awaiting_confirmation'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  order_id: number;
  total_price: number;
  status: OrderStatus;
  delivery_address: string;
  notes?: string;
  amount_paid: number;
  payment_status: PaymentStatus;
  payment_reference?: string;
  customer_confirmed: boolean;
  rider_confirmed: boolean;
  assigned_at?: Date;
  accepted_at?: Date;
  picked_up_at?: Date;
  assignment_attempts: number;
  requires_manual_assignment: boolean;
  customer_rating?: number;
  customer_feedback?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  customer: Customer;
  restaurant: Restaurant;
  rider?: Rider;
  orderItems?: OrderItem[];
  statusLogs?: OrderStatusLog[];
  messages?: Message[];
  payments?: Payment[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  order_item_id: number;
  order: Order;
  menu_item: MenuItem;
  quantity: number;
  price_at_purchase: number;
  special_instructions?: string;
  subtotal: number;
}

export interface OrderStatusLog {
  id: number;
  order: Order;
  from_status: OrderStatus;
  to_status: OrderStatus;
  changed_by?: User;
  changed_by_role?: string;
  notes?: string;
  changed_at: Date;
}

// ============= PAYMENT TYPES =============
export interface Payment {
  payment_id: number;
  payment_number: string;
  user: User;
  order: Order;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: 'card' | 'mobile_money' | 'cash';
  gateway: 'paystack' | 'stripe' | 'manual';
  transaction_id?: string;
  payment_reference?: string;
  authorization_url?: string;
  gateway_response?: any;
  failure_reason?: string;
  paid_at?: Date;
  failed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============= MESSAGE TYPES =============
export interface Message {
  message_id: number;
  sender_type: 'customer' | 'rider';
  order: Order;
  sender: User;
  content: string;
  is_read: boolean;
  sent_at: Date;
  deleted_at?: Date;
}

// ============= CART TYPES =============
export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Cart {
  items: CartItem[];
  restaurantId?: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

// ============= WEBSOCKET TYPES =============
export interface SocketEvent {
  type: string;
  payload: any;
}

export interface RiderLocationUpdate {
  riderId: number;
  orderId: number;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: Date;
}

export interface OrderUpdateEvent {
  orderId: number;
  type: 'riderAssigned' | 'statusUpdate' | 'orderRated' | 'orderDelivered' | 'chatCleared' | 'paymentUpdate';
  data: any;
}

// ============= UI TYPES =============
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export interface SearchFilters {
  category?: string;
  rating?: number;
  priceRange?: [number, number];
  deliveryTime?: string;
  sortBy?: 'rating' | 'price' | 'deliveryTime';
  sortOrder?: 'asc' | 'desc';
}

// ============= FORM TYPES =============
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

export interface AddressFormData {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

// ============= API RESPONSE TYPES =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}