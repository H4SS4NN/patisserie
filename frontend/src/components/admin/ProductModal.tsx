'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { CATEGORY_NAMES, getFlavorsForCategory } from '@/config/categories';
import styles from './ProductModal.module.scss';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

interface FlavorFormState {
  id?: string;
  name: string;
  priceModifier: string;
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    available: true,
  });
  const [isCustomName, setIsCustomName] = useState(false);
  const [flavors, setFlavors] = useState<FlavorFormState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      const presetCategory = CATEGORY_NAMES.includes(product.name);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? (product.price / 100).toString() : '',
        image_url: product.image_url || '',
        available: product.available !== undefined ? product.available : true,
      });
      setIsCustomName(!presetCategory);
      setFlavors(
        (product.flavors || []).map((flavor) => ({
          id: flavor.id,
          name: flavor.name,
          priceModifier:
            typeof flavor.price_modifier === 'number'
              ? (flavor.price_modifier / 100).toFixed(2)
              : '0.00',
        }))
      );
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        available: true,
      });
      setIsCustomName(false);
      setFlavors([]);
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    if (value === '__custom__') {
      setIsCustomName(true);
      setFormData((prev) => ({
        ...prev,
        name: prev.name || '',
      }));
      return;
    }

    setIsCustomName(false);
    setFormData((prev) => ({
      ...prev,
      name: value,
    }));

    const defaultFlavors = getFlavorsForCategory(value);
    if (defaultFlavors.length > 0 && flavors.length === 0) {
      setFlavors(
        defaultFlavors.map((flavor) => ({
          name: flavor.name,
          priceModifier: '0.00',
        }))
      );
    }
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      name: value,
    }));
  };

  const addFlavor = () => {
    setFlavors((prev) => [
      ...prev,
      {
        name: '',
        priceModifier: '0.00',
      },
    ]);
  };

  const updateFlavor = (index: number, field: 'name' | 'priceModifier', value: string) => {
    setFlavors((prev) =>
      prev.map((flavor, i) =>
        i === index
          ? {
              ...flavor,
              [field]: value,
            }
          : flavor
      )
    );
  };

  const removeFlavor = (index: number) => {
    setFlavors((prev) => prev.filter((_, i) => i !== index));
  };

  const defaultCategoryFlavors = useMemo(() => {
    if (!isCustomName && formData.name) {
      return getFlavorsForCategory(formData.name);
    }
    return [];
  }, [formData.name, isCustomName]);

  const handlePrefillFlavors = () => {
    if (defaultCategoryFlavors.length === 0) {
      return;
    }

    if (
      flavors.length > 0 &&
      typeof window !== 'undefined' &&
      !window.confirm(
        'Remplacer les goûts existants par la liste par défaut ? Cette action est irréversible.'
      )
    ) {
      return;
    }

    setFlavors(
      defaultCategoryFlavors.map((flavor) => ({
        name: flavor.name,
        priceModifier: '0.00',
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        throw new Error('Le nom est requis');
      }
      const normalizedPrice = Number.parseFloat(formData.price.replace(',', '.'));
      if (!formData.price || Number.isNaN(normalizedPrice) || normalizedPrice <= 0) {
        throw new Error('Le prix doit être supérieur à 0');
      }

      const priceInCentimes = Math.round(normalizedPrice * 100);

      const formattedFlavors = flavors.map((flavor, index) => {
        const flavorName = flavor.name.trim();

        if (!flavorName) {
          throw new Error(`Le nom du goût ${index + 1} est requis`);
        }

        const modifierValue = flavor.priceModifier.trim();
        const parsedModifier =
          modifierValue === '' ? 0 : Number.parseFloat(modifierValue.replace(',', '.'));

        if (Number.isNaN(parsedModifier)) {
          throw new Error(`Le prix du goût ${flavorName} est invalide`);
        }

        return {
          name: flavorName,
          price_modifier: Math.round(parsedModifier * 100),
        };
      });

      await onSave({
        name: trimmedName,
        description: formData.description.trim() || undefined,
        price: priceInCentimes,
        image_url: formData.image_url.trim() || undefined,
        available: formData.available,
        flavors: formattedFlavors,
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
                value={isCustomName ? '__custom__' : formData.name}
                onChange={handleCategoryChange}
                className={styles.select}
                required
              >
                <option value="">Sélectionnez un type de gâteau</option>
                {CATEGORY_NAMES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">Autre (personnalisé)</option>
              </select>
              {isCustomName && (
                <input
                  type="text"
                  name="customName"
                  value={formData.name}
                  onChange={handleCustomNameChange}
                  placeholder="Nom du gâteau"
                  className={styles.customNameInput}
                  required
                />
              )}
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

            <div className={styles.formGroup}>
              <div className={styles.flavorsHeader}>
                <div>
                  <label>Goûts disponibles</label>
                  <p className={styles.helpText}>
                    Ajoutez les goûts proposés et précisez un supplément éventuel. Laissez 0.00€
                    si le goût est inclus dans le prix de base.
                  </p>
                </div>
                {defaultCategoryFlavors.length > 0 && (
                  <button
                    type="button"
                    className={styles.prefillButton}
                    onClick={handlePrefillFlavors}
                  >
                    Utiliser les goûts par défaut
                  </button>
                )}
              </div>

              <div className={styles.flavorList}>
                {flavors.length === 0 && (
                  <div className={styles.flavorsEmpty}>
                    Aucun goût ajouté pour le moment. Cliquez sur « Ajouter un goût » pour commencer.
                  </div>
                )}
                {flavors.map((flavor, index) => (
                  <div key={index} className={styles.flavorRow}>
                    <div className={styles.flavorInput}>
                      <label className={styles.srOnly} htmlFor={`flavor-name-${index}`}>
                        Nom du goût
                      </label>
                      <input
                        id={`flavor-name-${index}`}
                        type="text"
                        value={flavor.name}
                        onChange={(event) => updateFlavor(index, 'name', event.target.value)}
                        placeholder="Ex : Pistache"
                        required
                      />
                    </div>
                    <div className={styles.flavorPriceInput}>
                      <label className={styles.srOnly} htmlFor={`flavor-price-${index}`}>
                        Supplément (en €)
                      </label>
                      <span>€</span>
                      <input
                        id={`flavor-price-${index}`}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={flavor.priceModifier}
                        onChange={(event) => updateFlavor(index, 'priceModifier', event.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.removeFlavorButton}
                      onClick={() => removeFlavor(index)}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.addFlavorButton} onClick={addFlavor}>
                Ajouter un goût
              </button>
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

