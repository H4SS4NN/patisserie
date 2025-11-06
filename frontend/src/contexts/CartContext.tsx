'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, options?: { flavor?: string; parts?: number }) => void;
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

  const addToCart = (product: Product, options?: { flavor?: string; parts?: number }) => {
    setCart((prevCart) => {
      // Créer un ID unique basé sur le produit + options
      const itemKey = `${product.id}-${options?.flavor || ''}-${options?.parts || ''}`;
      
      // Vérifier si un item identique existe déjà
      const existingItem = prevCart.find((item) => {
        const itemKeyExisting = `${item.id}-${item.options?.flavor || ''}-${item.options?.parts || ''}`;
        return itemKeyExisting === itemKey;
      });

      if (existingItem) {
        return prevCart.map((item) => {
          const itemKeyExisting = `${item.id}-${item.options?.flavor || ''}-${item.options?.parts || ''}`;
          if (itemKeyExisting === itemKey) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      }

      // Construire le nom avec les options
      let displayName = product.name;
      if (options?.flavor) {
        displayName = `${product.name} - ${options.flavor}`;
      }
      if (options?.parts) {
        displayName = `${displayName} (${options.parts} parts)`;
      }

      return [
        ...prevCart,
        {
          ...product,
          name: displayName,
          quantity: 1,
          options: options || {},
        },
      ];
    });
  };

  const removeFromCart = (itemKey: string) => {
    // itemKey est au format "productId-flavor-parts"
    setCart((prevCart) => prevCart.filter((item) => {
      const itemKeyExisting = `${item.id}-${item.options?.flavor || ''}-${item.options?.parts || ''}`;
      return itemKeyExisting !== itemKey;
    }));
  };

  const updateQuantity = (itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => {
          const itemKeyExisting = `${item.id}-${item.options?.flavor || ''}-${item.options?.parts || ''}`;
          if (itemKeyExisting === itemKey) {
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

