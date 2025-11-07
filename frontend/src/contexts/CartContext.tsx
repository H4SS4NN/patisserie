'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, CartItemOptions } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, options?: CartItemOptions) => void;
  removeFromCart: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const buildItemKey = (productId: string, options?: CartItemOptions) => {
    const flavorKey = options?.flavorId || options?.flavor || '';
    const partsKey = options?.parts ? String(options.parts) : '';
    return `${productId}-${flavorKey}-${partsKey}`;
  };

  const addToCart = (product: Product, options?: CartItemOptions) => {
    setCart((prevCart) => {
      const itemKey = buildItemKey(product.id, options);
      const existingItem = prevCart.find((item) => buildItemKey(item.id, item.options) === itemKey);

      if (existingItem) {
        return prevCart.map((item) => {
          if (buildItemKey(item.id, item.options) === itemKey) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      }

      const flavorModifier = options?.flavorPriceModifier ?? 0;
      const unitPrice = product.price + flavorModifier;

      let displayName = product.name;
      if (options?.flavor) {
        displayName = `${product.name} - ${options.flavor}`;
      }
      if (options?.parts) {
        displayName = `${displayName} (${options.parts} parts)`;
      }

      const normalizedOptions: CartItemOptions | undefined = options
        ? {
            ...options,
            flavorPriceModifier: flavorModifier,
            basePrice: product.price,
          }
        : undefined;

      return [
        ...prevCart,
        {
          ...product,
          name: displayName,
          price: unitPrice,
          quantity: 1,
          options: normalizedOptions,
        },
      ];
    });
  };

  const removeFromCart = (itemKey: string) => {
    setCart((prevCart) => prevCart.filter((item) => buildItemKey(item.id, item.options) !== itemKey));
  };

  const updateQuantity = (itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (buildItemKey(item.id, item.options) === itemKey) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

