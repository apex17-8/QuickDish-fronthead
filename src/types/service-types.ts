// Types for Rider Service
export interface RiderDetails {
  rider_id: number;
  user: {
    user_id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  vehicle_type: string;
  is_online: boolean;
  rating: number;
  currentLatitude: number;
  currentLongitude: number;
  last_location: string;
  created_at: string;
  updated_at: string;
}

export interface LocationUpdateData {
  latitude: number;
  longitude: number;
}

export interface RiderOrder {
  order_id: number;
  customer_name: string;
  customer_address: string;
  restaurant_name: string;
  restaurant_address: string;
  total_price: number;
  status: string;
  created_at: string;
}

export interface AvailableOrder extends RiderOrder {
  distance: number;
  estimated_pickup_time: string;
  estimated_delivery_time: string;
  delivery_fee: number;
}

export interface OrderStatusUpdate {
  orderId: number;
  status: string;
  updatedAt: string;
}

export interface DeliveryConfirmation {
  orderId: number;
  confirmedAt: string;
  riderConfirmed: boolean;
  customerConfirmed: boolean;
}

export interface RiderEarnings {
  totalEarnings: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingWithdrawal: number;
  availableBalance: number;
  earningsByPeriod: Array<{
    period: string;
    earnings: number;
    orders: number;
  }>;
}

export interface RiderPayment {
  payment_id: number;
  amount: number;
  status: string;
  payment_method: string;
  transaction_id?: string;
  created_at: string;
}

export interface WithdrawalRequest {
  riderId: number;
  amount: number;
  method: string;
  status?: string;
  requestedAt: string;
}

export interface RiderPerformance {
  rating: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
  averageDeliveryTime: number;
  acceptanceRate: number;
  cancellationRate: number;
}

export interface RiderStats {
  today: {
    deliveries: number;
    earnings: number;
    onlineHours: number;
  };
  thisWeek: {
    deliveries: number;
    earnings: number;
    rating: number;
  };
  allTime: {
    deliveries: number;
    earnings: number;
    joinedAt: string;
  };
}

export interface ChatMessage {
  message_id: number;
  orderId: number;
  senderId: number;
  senderType: 'customer' | 'rider';
  content: string;
  sent_at: string;
  is_read: boolean;
}

export interface RiderSchedule {
  riderId: number;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>;
  workingHours: number;
  availableSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

// Types for Restaurant Service
export interface RestaurantStaff {
  user_id: number;
  name: string;
  email: string;
  role: string;
  position: string;
  restaurant_id: number;
}

export interface MenuCategory {
  category_id: number;
  name: string;
  description?: string;
  restaurant_id: number;
  isActive: boolean;
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

export interface UpdateMenuCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}