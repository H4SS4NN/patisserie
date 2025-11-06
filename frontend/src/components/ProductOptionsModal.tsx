'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { getFlavorsForCategory, categoryHasParts, getPartsForCategory } from '@/config/categories';
import styles from './ProductOptionsModal.module.scss';

interface ProductOptionsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, options: { flavor?: string; parts?: number }) => void;
}

export default function ProductOptionsModal({
  product,
  onClose,
  onAddToCart,
}: ProductOptionsModalProps) {
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedParts, setSelectedParts] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  
  // La catégorie est le nom du produit (ex: "Flanc", "Cookies", "Layer cake")
  const category = product.name;
  const flavorOptions = getFlavorsForCategory(category);
  const hasParts = categoryHasParts(category);
  const parts = getPartsForCategory(category);

  // Trouver l'image du goût sélectionné
  const selectedFlavorOption = flavorOptions.find((f) => f.name === selectedFlavor);
  const selectedFlavorImage = selectedFlavorOption?.image || product.image_url || null;

  // Gérer le montage et le démontage
  useEffect(() => {
    setMounted(true);
    
    // Fermer la modal avec Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Le goût est obligatoire si la catégorie a des goûts
    if (flavorOptions.length > 0 && !selectedFlavor) {
      return;
    }

    // Le nombre de parts est obligatoire pour Layer cake
    if (hasParts && !selectedParts) {
      return;
    }

    const options: { flavor?: string; parts?: number } = {};
    if (selectedFlavor) {
      options.flavor = selectedFlavor;
    }
    if (hasParts && selectedParts) {
      options.parts = selectedParts;
    }

    onAddToCart(product, options);
    onClose();
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
      y: 30,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 30,
      transition: { duration: 0.2 },
    },
  };

  // Ne pas rendre si pas encore monté (SSR)
  if (typeof document === 'undefined' || !mounted) {
    return null;
  }

  const modalContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key="product-options-modal"
        className={styles.modalOverlay}
        onClick={onClose}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          variants={modalVariants}
        >
          <div className={styles.modalHeader}>
            <div className={styles.headerContent}>
              <h2>{product.name}</h2>
              {product.description && (
                <p className={styles.productDescription}>{product.description}</p>
              )}
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.leftPanel}>
              <form onSubmit={handleSubmit} className={styles.form}>
                {flavorOptions.length > 0 && (
                  <div className={styles.formGroup}>
                    <label htmlFor="flavor">
                      Choisissez un goût <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.flavorsList}>
                      {flavorOptions.map((flavor) => (
                        <button
                          key={flavor.name}
                          type="button"
                          className={`${styles.flavorOption} ${
                            selectedFlavor === flavor.name ? styles.selected : ''
                          }`}
                          onClick={() => setSelectedFlavor(flavor.name)}
                        >
                          <span className={styles.flavorName}>{flavor.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasParts && parts.length > 0 && (
                  <div className={styles.formGroup}>
                    <label htmlFor="parts">
                      Nombre de parts <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.optionsGrid}>
                      {parts.map((part) => (
                        <button
                          key={part}
                          type="button"
                          className={`${styles.optionButton} ${
                            selectedParts === part ? styles.selected : ''
                          }`}
                          onClick={() => setSelectedParts(part)}
                        >
                          {part} parts
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={styles.addButton}
                    disabled={
                      (flavorOptions.length > 0 && !selectedFlavor) ||
                      (hasParts && !selectedParts)
                    }
                  >
                    Ajouter au panier
                  </button>
                </div>
              </form>
            </div>

            <div className={styles.rightPanel}>
              <div className={styles.imagePreview}>
                {selectedFlavorImage ? (
                  <img src={selectedFlavorImage} alt={selectedFlavor || product.name} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    {selectedFlavor ? (
                      <>
                        <span className={styles.placeholderIcon}>{selectedFlavor.charAt(0)}</span>
                        <span className={styles.placeholderText}>{selectedFlavor}</span>
                      </>
                    ) : (
                      <>
                        <span className={styles.placeholderIcon}>{product.name.charAt(0)}</span>
                        <span className={styles.placeholderText}>Sélectionnez un goût</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

