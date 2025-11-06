import axios from 'axios';
import { Product, Order, ApiResponse } from '@/types';

// Utiliser /api comme préfixe pour que Nginx route vers le backend
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api' // Préfixe API pour le routing Nginx
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour logger les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      requestData: error.config?.data,
    });
    return Promise.reject(error);
  }
);

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<{ products: Product[] }>('/products');
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get<{ product: Product }>(`/products/${id}`);
    return response.data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createOrder = async (orderData: Omit<Order, 'total_price' | 'id' | 'numero_commande' | 'status' | 'payment_status' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Order>> => {
  try {
    const response = await api.post<ApiResponse<Order>>('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export default api;

