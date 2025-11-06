'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.scss';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, options?: { flavor?: string; parts?: number }) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  if (products.length === 0) {
    return (
      <div className={styles.noProducts}>
        <p>Aucun produit disponible pour le moment.</p>
        <p style={{ fontSize: '0.875rem', color: '#6b5e5a', marginTop: '0.5rem' }}>
          Créez des produits dans la section Admin pour les voir apparaître ici.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.productGrid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          index={index}
        />
      ))}
    </motion.div>
  );
}

