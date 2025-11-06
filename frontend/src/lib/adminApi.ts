import axios from 'axios';
import { Order, AdminUser, OrderStatus, PaymentStatus, Product } from '@/types';

// Utiliser une URL relative en production pour que Nginx gère le routing
const API_BASE_URL = typeof window !== 'undefined' 
  ? '' // Utiliser le même domaine en production (via Nginx)
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour ajouter le token JWT à chaque requête
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (non autorisé)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const adminLogin = async (
  username: string,
  password: string
): Promise<{ token?: string; user?: AdminUser; requires2FA?: boolean; tempToken?: string }> => {
  try {
    const response = await adminApi.post('/auth/login', { username, password });
    if (response.data.token && typeof window !== 'undefined') {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const adminLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  }
};

// Orders
export const getOrders = async (filters: {
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
} = {}): Promise<Order[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.start_date) params.append('date_from', filters.start_date);
    if (filters.end_date) params.append('date_to', filters.end_date);

    const response = await adminApi.get<{ orders: Order[] }>(
      `/orders/admin/orders?${params.toString()}`
    );
    return response.data.orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (id: number | string): Promise<Order> => {
  try {
    const response = await adminApi.get<{ order: Order }>(`/orders/admin/orders/${id}`);
    return response.data.order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  id: number | string,
  status: OrderStatus,
  notes?: string
): Promise<Order> => {
  try {
    const response = await adminApi.patch<{ order: Order }>(
      `/orders/admin/orders/${id}/status`,
      {
        status,
        notes,
      }
    );
    return response.data.order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  id: number | string,
  payment_status: PaymentStatus,
  paypal_payment_id?: string
): Promise<Order> => {
  try {
    const response = await adminApi.patch<{ order: Order }>(
      `/orders/admin/orders/${id}/payment`,
      {
        payment_status,
        paypal_payment_id,
      }
    );
    return response.data.order;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await adminApi.get<{ products: Product[] }>('/products');
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await adminApi.get<{ product: Product }>(`/products/${id}`);
    return response.data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await adminApi.post<{ success: boolean; product: Product }>(
      '/products/admin/products',
      productData
    );
    return response.data.product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  productData: Partial<Product>
): Promise<Product> => {
  try {
    const response = await adminApi.patch<{ success: boolean; product: Product }>(
      `/products/admin/products/${id}`,
      productData
    );
    return response.data.product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await adminApi.delete(`/products/admin/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Stats
export const getStats = async (): Promise<any> => {
  try {
    const response = await adminApi.get('/orders/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// Calendar
export const getCalendar = async (
  startDate?: string,
  endDate?: string
): Promise<Order[]> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await adminApi.get<{ orders: Order[] }>(
      `/orders/admin/calendar?${params.toString()}`
    );
    return response.data.orders || [];
  } catch (error) {
    console.error('Error fetching calendar:', error);
    throw error;
  }
};

export default adminApi;
