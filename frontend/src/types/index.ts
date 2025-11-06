export interface Product {
  id: string; // UUID from backend
  name: string;
  description?: string;
  price: number; // en centimes
  image_url?: string;
  category?: string;
  available?: boolean;
  created_at?: string;
  updated_at?: string;
  options?: {
    flavors?: string[];
    hasParts?: boolean;
    parts?: number[];
  };
}

export interface ProductCategory {
  name: string;
  flavors: string[];
  hasParts?: boolean;
  parts?: number[];
}

export interface CartItem extends Product {
  quantity: number;
  options?: Record<string, any>;
}

export interface OrderItem {
  product_id: string; // UUID
  name: string;
  qty: number;
  options?: Record<string, any>;
  price: number;
}

export interface Order {
  id?: number;
  numero_commande?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  items: OrderItem[];
  total_price: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method: PaymentMethod;
  pickup_or_delivery_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'EN_PREPARATION'
  | 'EN_CUISSON'
  | 'PRETE'
  | 'LIVREE'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export type PaymentMethod = 'CASH' | 'PAYPAL';

export interface AdminUser {
  id: number;
  username: string;
  email?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ msg: string; message?: string }>;
}

