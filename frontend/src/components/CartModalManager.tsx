'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cart from './Cart';
import OrderForm from './OrderForm';

export default function CartModalManager() {
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleOpenCart = () => {
      setShowCart(true);
    };

    window.addEventListener('openCart', handleOpenCart);

    return () => {
      window.removeEventListener('openCart', handleOpenCart);
    };
  }, []);

  const handleCheckout = () => {
    setShowCart(false);
    setShowOrderForm(true);
  };

  const handleOrderComplete = () => {
    setShowOrderForm(false);
    // Le toast sera affiché dans OrderForm
  };

  if (!mounted || typeof document === 'undefined' || !document.body) return null;

  return (
    <>
      {showCart &&
        createPortal(
          <Cart key="cart-modal" onClose={() => setShowCart(false)} onCheckout={handleCheckout} />,
          document.body
        )}
      {showOrderForm &&
        createPortal(
          <OrderForm
            key="orderform-modal"
            onClose={() => setShowOrderForm(false)}
            onComplete={handleOrderComplete}
          />,
          document.body
        )}
    </>
  );
}

