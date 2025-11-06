'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { CATEGORY_NAMES } from '@/config/categories';
import ProductGrid from '@/components/ProductGrid';
import styles from './page.module.scss';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, products]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      console.log('Products loaded:', data);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filterProducts = () => {
    setLoading(true);
    if (selectedCategory === 'Tous') {
      setFilteredProducts(products);
    } else {
      // Filtrer par nom du produit (qui correspond à la catégorie)
      const filtered = products.filter((product) => {
        return product.name === selectedCategory;
      });
      setFilteredProducts(filtered);
    }
    setTimeout(() => setLoading(false), 100);
  };

  return (
    <main className={styles.mainContent}>
      <motion.div
        className={styles.pageHeading}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1>Découvrez Nos Gâteaux</h1>
        <p>
          Fabriqués à la main avec passion par Assiqa, des recettes classiques aux créations sur
          mesure.
        </p>
      </motion.div>

      <motion.div
        className={styles.categoryFilters}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {['Tous', ...CATEGORY_NAMES].map((category, index) => (
          <motion.button
            key={category}
            className={`${styles.filterBtn} ${selectedCategory === category ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      {loading ? (
        <div className={styles.loading}>Chargement des produits...</div>
      ) : (
        <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
      )}
    </main>
  );
}

