'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import styles from './Cart.module.scss';

interface CartProps {
  onClose: () => void;
  onCheckout: () => void;
}

export default function Cart({ onClose, onCheckout }: CartProps) {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  const formatPrice = (priceInCentimes: number) => {
    return (priceInCentimes / 100).toFixed(2);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  };

  if (cart.length === 0) {
    return (
      <motion.div
        className={styles.cartOverlay}
        onClick={onClose}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
          <motion.div
            className={styles.cartModal}
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
          >
            <div className={styles.cartHeader}>
              <h2>Panier</h2>
              <button className={styles.closeButton} onClick={onClose}>
                ×
              </button>
            </div>
            <div className={styles.cartEmpty}>
              <p>Votre panier est vide</p>
            </div>
          </motion.div>
        </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.cartOverlay}
      onClick={onClose}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
        <motion.div
          className={styles.cartModal}
          onClick={(e) => e.stopPropagation()}
          variants={modalVariants}
        >
          <div className={styles.cartHeader}>
            <h2>Panier</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles.cartItems}>
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={styles.cartItem}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={styles.cartItemInfo}>
                    <h4>{item.name}</h4>
                    <p className={styles.cartItemPrice}>{formatPrice(item.price)}€</p>
                  </div>
                  <div className={styles.cartItemControls}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => {
                        const itemKey = `${item.id}-${item.options?.flavor || ''}-${item.options?.parts || ''}`;
                        updateQuantity(itemKey, item.quantity - 1);
                      }}
                    >
                      −
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => {
                        const itemKey = `${item.id}-${item.options?.flavor || ''}-${item.options?.parts || ''}`;
                        updateQuantity(itemKey, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => {
                        const itemKey = `${item.id}-${item.options?.flavor || ''}-${item.options?.parts || ''}`;
                        removeFromCart(itemKey);
                      }}
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className={styles.cartItemTotal}>
                    {formatPrice(item.price * item.quantity)}€
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className={styles.cartFooter}>
            <div className={styles.cartTotal}>
              <strong>Total: {formatPrice(getTotalPrice())}€</strong>
            </div>
            <CartCheckoutButton onCheckout={onCheckout} />
          </div>
        </motion.div>
      </motion.div>
  );
}

function CartCheckoutButton({ onCheckout }: { onCheckout: () => void }) {
  return (
    <button className={styles.checkoutButton} onClick={onCheckout}>
      Passer la commande
    </button>
  );
}

