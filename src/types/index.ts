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

export interface UpdateUser {
  name: string;
  email: string;
  phone: string;
  address: string;
}

//UserRole enum without decorator syntax
export enum UserRole {
  SuperAdmin = 'super_admin',
  RestaurantOwner = 'restaurant_owner',
  Manager = 'manager',
  CustomerCare = 'customer_care',
  Rider = 'rider',
  Customer = 'customer',
}
// Restaurant Owner Service Types
export interface CreateRestaurantData {
  name: string;
  address: string;
  phone: string;
  logo_url?: string;
  description?: string;
  categories?: string[];
  owner_id: number;
}

export interface UpdateRestaurantData {
  name?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  description?: string;
  categories?: string[];
  isOpen?: boolean;
}

export interface CreateMenuItemData {
  name: string;
  description: string;
  price: number;
  category_id: number;
  preparation_time: number;
  is_available: boolean;
  image_url?: string;
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  category_id?: number;
  preparation_time?: number;
  is_available?: boolean;
  image_url?: string;
}

export interface CreateMenuCategoryData {
  name: string;
  description?: string;
  restaurant_id: number;
  isActive?: boolean;
}

export interface UpdateMenuCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface RestaurantStaffMember {
  staff_id: number;
  user: User;
  restaurant: Restaurant;
  role: 'manager' | 'chef' | 'cashier' | 'waiter';
  position: string;
  hired_date: string;
  is_active: boolean;
}

export interface AddStaffMemberData {
  user_id: number;
  restaurant_id: number;
  role: 'manager' | 'chef' | 'cashier' | 'waiter';
  position: string;
}

export interface RestaurantStats {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  revenue: number;
  averageRating: number;
  popularItems: MenuItem[];
}

export interface RevenueStats {
  dailyStats: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueChangePercentage: number;
}

export interface PaymentStats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
  paidPercentage: number;
  totalRevenue: number;
  paymentMethods: Record<string, number>;
}

export interface RiderRequest {
  request_id: number;
  rider: Rider;
  restaurant: Restaurant;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  request_date: string;
  approved_date?: string;
  rejected_date?: string;
  suspended_date?: string;
  rejection_reason?: string;
  suspension_reason?: string;
  reviewed_by?: User;
}

export interface RiderPerformance {
  rider_id: number;
  total_deliveries: number;
  on_time_deliveries: number;
  late_deliveries: number;
  average_delivery_time: number; // in minutes
  acceptance_rate: number;
  cancellation_rate: number;
  customer_rating: number;
  completion_rate: number;
  performance_score: number;
}

export interface RiderStats {
  total_riders: number;
  active_riders: number;
  pending_requests: number;
  approved_riders: number;
  suspended_riders: number;
  average_rating: number;
  top_performers: RiderPerformance[];
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

// FIXED: Update CreateOrderDto to match backend
export interface CreateOrderDto {
  customer_id: number; // Changed from customerId
  restaurant_id: number; // Changed from restaurantId
  delivery_address: string; // Changed from deliveryAddress
  notes?: string;
  items: Array<{
    menu_item_id: number; // Changed from menuItemId
    quantity: number;
    special_instructions?: string; // Changed from specialInstructions
  }>;
  delivery_latitude?: number; // Changed from deliveryLatitude
  delivery_longitude?: number; // Changed from deliveryLongitude
}

// NEW: Add CreateOrderWithPaymentData interface
export interface CreateOrderWithPaymentData {
  customer_id: number;
  restaurant_id: number;
  delivery_address: string;
  notes?: string;
  items: Array<{
    menu_item_id: number;
    quantity: number;
    special_instructions?: string;
  }>;
  delivery_latitude?: number;
  delivery_longitude?: number;
  email: string;
  amount: number;
  callback_url: string;
  payment_method?: 'card' | 'mobile_money';
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
  gateway_response?: string;
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
export interface WebSocketUser {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface OrderUpdateEvent {
  orderId: number;
  status: OrderStatus;
  updatedAt: string;
  estimatedDeliveryTime?: string;
  riderId?: number;
  notes?: string;
}

export interface RiderAssignedEvent {
  orderId: number;
  riderId: number;
  riderName: string;
  riderPhone?: string;
  riderEmail?: string;
  assignedAt: string;
  estimatedArrivalTime?: string;
  vehicleType?: string;
}

export interface RiderLocationEvent {
  riderId: number;
  orderId?: number;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
  speed?: number;
  heading?: number;
}

export interface ChatMessageEvent {
  message_id: number;
  orderId: number;
  senderId: number;
  senderType: 'customer' | 'rider';
  content: string;
  timestamp: string;
  is_read: boolean;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

export interface TypingIndicatorEvent {
  orderId: number;
  userId: number;
  userType: 'customer' | 'rider';
  isTyping: boolean;
}

export interface AssignmentTimeoutEvent {
  orderId: number;
  timeoutAt: string;
  reason?: string;
  assignmentAttempts: number;
}

export interface OrderRatedEvent {
  orderId: number;
  rating: number;
  feedback?: string;
  ratedAt: string;
  ratedBy: 'customer' | 'rider';
}

export interface UnreadCountEvent {
  orderId: number;
  userId: number;
  unreadCount: number;
  lastMessageTime?: string;
}

export interface PaymentUpdateEvent {
  orderId: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  paymentReference?: string;
  updatedAt: string;
}

export interface OrderDeliveredEvent {
  orderId: number;
  deliveredAt: string;
  riderId: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  customerConfirmed: boolean;
  riderConfirmed: boolean;
}

// WebSocket Event Map Types
export type WebSocketEventType =
  | 'order-update'
  | 'rider-assigned'
  | 'rider-location'
  | 'chat-message'
  | 'typing-indicator'
  | 'assignment-timeout'
  | 'order-rated'
  | 'unread-count'
  | 'payment-update'
  | 'order-delivered'
  | 'order-accepted'
  | 'order-ready'
  | 'order-picked-up'
  | 'connect'
  | 'disconnect'
  | 'error';

export type WebSocketEventDataMap = {
  'order-update': OrderUpdateEvent;
  'rider-assigned': RiderAssignedEvent;
  'rider-location': RiderLocationEvent;
  'chat-message': ChatMessageEvent;
  'typing-indicator': TypingIndicatorEvent;
  'assignment-timeout': AssignmentTimeoutEvent;
  'order-rated': OrderRatedEvent;
  'unread-count': UnreadCountEvent;
  'payment-update': PaymentUpdateEvent;
  'order-delivered': OrderDeliveredEvent;
  'order-accepted': { orderId: number; acceptedAt: string };
  'order-ready': { orderId: number; readyAt: string };
  'order-picked-up': { orderId: number; pickedUpAt: string; riderId: number };
  'connect': void;
  'disconnect': void;
  'error': Error;
};

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