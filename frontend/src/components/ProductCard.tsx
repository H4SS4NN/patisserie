'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { getFlavorNamesForCategory, categoryHasParts } from '@/config/categories';
import ProductOptionsModal from './ProductOptionsModal';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, options?: { flavor?: string; parts?: number }) => void;
  index?: number;
}

export default function ProductCard({ product, onAddToCart, index = 0 }: ProductCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  // Le nom du produit est la catégorie (ex: "Flanc", "Cookies", "Layer cake")
  const category = product.name;
  const flavorNames = getFlavorNamesForCategory(category);
  const hasParts = categoryHasParts(category);
  const hasOptions = flavorNames.length > 0 || hasParts;

  const formatPrice = (priceInCentimes: number) => {
    return (priceInCentimes / 100).toFixed(2);
  };

  const handleClick = () => {
    if (hasOptions) {
      setShowOptions(true);
    } else {
      onAddToCart(product);
    }
  };

  const handleAddWithOptions = (product: Product, options: { flavor?: string; parts?: number }) => {
    onAddToCart(product, options);
  };

  return (
    <motion.div
      className={styles.productCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.productImageContainer}>
        <div
          className={styles.productImage}
          style={{
            backgroundImage: product.image_url
              ? `url(${product.image_url})`
              : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          }}
        />
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productDescription}>
          {product.description || 'Délicieux produit artisanal fait à la main.'}
        </p>
        <div className={styles.productFooter}>
          <span className={styles.productPrice}>{formatPrice(product.price)}€</span>
          <button className={styles.productButton} onClick={handleClick}>
            Choisir
          </button>
        </div>
      </div>
      {showOptions && (
        <ProductOptionsModal
          product={product}
          onClose={() => {
            setShowOptions(false);
          }}
          onAddToCart={(product, options) => {
            handleAddWithOptions(product, options);
            setShowOptions(false);
          }}
        />
      )}
    </motion.div>
  );
}

