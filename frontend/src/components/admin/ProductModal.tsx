'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { CATEGORY_NAMES } from '@/config/categories';
import styles from './ProductModal.module.scss';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    available: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? (product.price / 100).toString() : '',
        image_url: product.image_url || '',
        available: product.available !== undefined ? product.available : true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        available: true,
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Le nom est requis');
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }

      // Convertir le prix en centimes
      const priceInCentimes = Math.round(parseFloat(formData.price) * 100);

      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: priceInCentimes,
        image_url: formData.image_url.trim() || undefined,
        available: formData.available,
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
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
        type: 'spring' as const,
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

  return (
    <AnimatePresence>
      <motion.div
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
            <h2>{product ? 'Modifier le gâteau' : 'Nouveau gâteau'}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">
                Type de gâteau <span className={styles.required}>*</span>
              </label>
              <select
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Sélectionnez un type de gâteau</option>
                {CATEGORY_NAMES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className={styles.helpText}>
                Le client choisira ensuite le goût lors de l'ajout au panier.
                {formData.name === 'Layer cake' && ' Le nombre de parts sera également demandé.'}
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez le gâteau..."
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="price">
                  Prix (€) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="45.00"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="available">Disponibilité</label>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                  <label htmlFor="available" className={styles.checkboxLabel}>
                    Disponible à la vente
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image_url">URL de l'image</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image_url && (
                <div className={styles.imagePreview}>
                  <img src={formData.image_url} alt="Preview" />
                </div>
              )}
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

