'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import styles from './MobileMenu.module.scss';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleCartClick = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openCart'));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.menu}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.menuHeader}>
              <h2>Menu</h2>
              <button className={styles.closeButton} onClick={onClose}>
                <FaTimes />
              </button>
            </div>
            <nav className={styles.nav}>
              <Link
                href="/"
                className={`${styles.navLink} ${isActive('/') && pathname === '/' ? styles.active : ''}`}
                onClick={onClose}
              >
                Nos Gâteaux
              </Link>
              <Link
                href="/a-propos"
                className={`${styles.navLink} ${isActive('/a-propos') ? styles.active : ''}`}
                onClick={onClose}
              >
                À Propos
              </Link>
              <Link
                href="/galerie"
                className={`${styles.navLink} ${isActive('/galerie') ? styles.active : ''}`}
                onClick={onClose}
              >
                Galerie
              </Link>
              <Link
                href="/contact"
                className={`${styles.navLink} ${isActive('/contact') ? styles.active : ''}`}
                onClick={onClose}
              >
                Contact
              </Link>
            </nav>
            <button className={styles.cartButton} onClick={handleCartClick}>
              <FaShoppingCart />
              Panier
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

