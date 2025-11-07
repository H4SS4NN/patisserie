'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaBars } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import MobileMenu from './MobileMenu';
import styles from './Header.module.scss';

export default function Header() {
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    settings: { brandName },
  } = useSiteSettings();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <motion.header
        className={styles.header}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Link href="/" className={styles.headerLeft}>
          <div className={styles.logoIcon}>
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className={styles.logoText}>{brandName}</h2>
        </Link>
        <div className={styles.headerRight}>
          <nav className={styles.navLinks}>
            <Link href="/" className={isActive('/') && pathname === '/' ? styles.active : ''}>
              Nos Gâteaux
            </Link>
            <Link href="/a-propos" className={isActive('/a-propos') ? styles.active : ''}>
              À Propos
            </Link>
            <Link href="/galerie" className={isActive('/galerie') ? styles.active : ''}>
              Galerie
            </Link>
            <Link href="/contact" className={isActive('/contact') ? styles.active : ''}>
              Contact
            </Link>
          </nav>
          <CartButton cartCount={cartCount} />
          <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
        </div>
      </motion.header>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}

function CartButton({ cartCount }: { cartCount: number }) {
  return (
    <motion.button
      className={styles.cartButton}
      onClick={() => {
        // This will be handled by the layout
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('openCart'));
        }
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaShoppingCart />
      {cartCount > 0 && (
        <motion.span
          className={styles.cartBadge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
        >
          {cartCount}
        </motion.span>
      )}
    </motion.button>
  );
}

function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className={styles.mobileMenuButton}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Ouvrir le menu"
    >
      <FaBars />
    </motion.button>
  );
}

