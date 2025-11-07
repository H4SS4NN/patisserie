'use client';

import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import styles from './page.module.scss';

export default function GalleryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const {
    settings: { brandName },
  } = useSiteSettings();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const formatPrice = (priceInCentimes: number) => {
    return (priceInCentimes / 100).toFixed(2);
  };

  return (
    <main className={styles.galleryPage}>
      <div className={styles.galleryHero}>
        <h1>Galerie {brandName}</h1>
        <p>Découvrez nos créations artisanales et nos chefs-d'œuvre de pâtisserie</p>
      </div>

      {products.length === 0 ? (
        <div className={styles.galleryEmpty}>
          <p>Aucun produit disponible pour le moment.</p>
        </div>
      ) : (
        <div className={styles.galleryGrid}>
          {products.map((product) => (
            <div
              key={product.id}
              className={styles.galleryItem}
              onClick={() => setSelectedProduct(product)}
            >
              <div className={styles.galleryImageContainer}>
                <div
                  className={styles.galleryImage}
                  style={{
                    backgroundImage: product.image_url
                      ? `url(${product.image_url})`
                      : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  }}
                />
                <div className={styles.galleryOverlay}>
                  <FaSearch className={styles.searchIcon} />
                </div>
              </div>
              <div className={styles.galleryInfo}>
                <h3>{product.name}</h3>
                <p className={styles.galleryPrice}>{formatPrice(product.price)}€</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedProduct(null)}>
              ×
            </button>
            <div className={styles.modalImageContainer}>
              <div
                className={styles.modalImage}
                style={{
                  backgroundImage: selectedProduct.image_url
                    ? `url(${selectedProduct.image_url})`
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                }}
              />
            </div>
            <div className={styles.modalInfo}>
              <h2>{selectedProduct.name}</h2>
              {selectedProduct.description && (
                <p className={styles.modalDescription}>{selectedProduct.description}</p>
              )}
              <p className={styles.modalPrice}>{formatPrice(selectedProduct.price)}€</p>
              <button
                className={styles.addToCartBtn}
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

