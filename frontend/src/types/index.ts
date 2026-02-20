export interface Product {
    id: number
    name: string
    price: number
    category: string
    stock_count: number
    description?: string
    subcategory?: string
    delivery_type?: string
    is_active?: boolean
    image_url?: string
}

export interface Review {
    id: number
    product_id: number
    user_id: number
    rating: number
    comment?: string
    is_verified_purchase: boolean
    created_at: string
    user?: {
        full_name: string
    }
}

export interface ReviewCreate {
    product_id: number
    rating: number
    comment?: string
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percentage: number;
  max_discount_amount?: number;
  is_active: boolean;
  valid_until?: string;
  created_at: string;
}

export interface OrderItem {
  id?: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface Message {
    id: number;
    sender: 'user' | 'admin';
    content: string;
    timestamp: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  final_amount: number;
  coupon_code?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'rejected' | 'approved';
  items: OrderItem[];
  messages: Message[];
  created_at: string;
  has_reviewed?: boolean;
}

export interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'normal' | 'high';
  messages: Message[];
  created_at: string;
  updated_at: string;
}
