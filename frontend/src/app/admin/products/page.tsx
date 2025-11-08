'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/adminApi';
import { Product } from '@/types';
import { getFlavorsForCategory } from '@/config/categories';
import { FaPlus, FaEdit, FaTrash, FaSync, FaMagic } from 'react-icons/fa';
import { showSuccess, showError } from '@/lib/toast';
import ProductModal from '@/components/admin/ProductModal';
import styles from './page.module.scss';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      await deleteProduct(id);
      await loadProducts();
      showSuccess('Produit supprimé avec succès');
    } catch (err) {
      showError('Erreur lors de la suppression du produit');
      console.error(err);
    }
  };

  const handleSave = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id as string, productData);
        showSuccess('Produit mis à jour avec succès');
      } else {
        await createProduct(productData);
        showSuccess('Produit créé avec succès');
      }
      setShowModal(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
      console.error(err);
    }
  };

  const handleSeedProducts = async () => {
    if (!confirm('Créer tous les types de gâteaux de base ? Les produits existants ne seront pas modifiés.')) {
      return;
    }

    const defaultProducts = [
      {
        name: 'Tartes et tartelettes',
        description: 'Délicieuses tartes et tartelettes artisanales. Choisissez votre goût préféré lors de l\'ajout au panier.',
        price: 2500, // 25.00€
        available: true,
      },
      {
        name: 'Cookies',
        description: 'Cookies maison croustillants. Sélectionnez votre parfum favori lors de l\'ajout au panier.',
        price: 1200, // 12.00€
        available: true,
      },
      {
        name: 'Entremets',
        description: 'Entremets raffinés et élégants. Choisissez votre goût lors de l\'ajout au panier.',
        price: 4500, // 45.00€
        available: true,
      },
      {
        name: 'Flanc',
        description: 'Flancs onctueux et crémeux. Sélectionnez votre parfum préféré lors de l\'ajout au panier.',
        price: 2800, // 28.00€
        available: true,
      },
      {
        name: 'Layer cake',
        description: 'Layer cakes personnalisables. Choisissez votre goût et le nombre de parts (8, 12 ou 16) lors de l\'ajout au panier.',
        price: 3500, // 35.00€ - prix de base pour 8 parts
        available: true,
      },
    ];

    try {
      setLoading(true);
      let created = 0;
      let skipped = 0;

      for (const productData of defaultProducts) {
        // Vérifier si le produit existe déjà
        const exists = products.some((p) => p.name === productData.name);
        if (!exists) {
          try {
            await createProduct(productData);
            created++;
          } catch (err) {
            console.error(`Error creating ${productData.name}:`, err);
          }
        } else {
          skipped++;
        }
      }

      await loadProducts();
      
      if (created > 0) {
        showSuccess(`${created} produit(s) créé(s) avec succès${skipped > 0 ? `, ${skipped} déjà existant(s)` : ''}`);
      } else {
        showSuccess('Tous les produits existent déjà');
      }
    } catch (err: any) {
      showError('Erreur lors de la création des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCentimes: number) => {
    return (priceInCentimes / 100).toFixed(2);
  };

  const formatFlavorModifier = (modifier?: number) => {
    if (!modifier) {
      return 'Inclus';
    }
    const sign = modifier > 0 ? '+' : '';
    return `${sign}${(modifier / 100).toFixed(2)}€`;
  };

  return (
    <div className={styles.productsPage}>
      <div className={styles.pageHeader}>
        <h1>Gestion des Gâteaux</h1>
        <div className={styles.headerActions}>
          <motion.button
            className={styles.refreshButton}
            onClick={loadProducts}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <FaSync />
            Actualiser
          </motion.button>
          {products.length === 0 && (
            <motion.button
              className={styles.seedButton}
              onClick={handleSeedProducts}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              <FaMagic />
              Créer les types de base
            </motion.button>
          )}
          <motion.button
            className={styles.addButton}
            onClick={handleCreate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus />
            Ajouter un gâteau
          </motion.button>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {loading ? (
        <div className={styles.loadingState}>Chargement des produits...</div>
      ) : products.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aucun produit disponible</p>
          <button className={styles.addButton} onClick={handleCreate}>
            <FaPlus />
            Créer le premier produit
          </button>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {products.map((product, index) => {
            const fallbackFlavors = getFlavorsForCategory(product.name);
            const hasCustomFlavors = Boolean(product.flavors && product.flavors.length > 0);

            return (
              <motion.div
                key={product.id}
                className={styles.productCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={styles.productImage}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <span>Pas d'image</span>
                    </div>
                  )}
                  {!product.available && (
                    <div className={styles.unavailableBadge}>Indisponible</div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  {product.description && (
                    <p className={styles.description}>{product.description}</p>
                  )}
                  <div className={styles.productMeta}>
                    <span className={styles.price}>{formatPrice(product.price)}€</span>
                    <span
                      className={`${styles.availableBadge} ${
                        product.available ? styles.available : styles.unavailable
                      }`}
                    >
                      {product.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                  <div className={styles.productActions}>
                    <motion.button
                      className={styles.editButton}
                      onClick={() => handleEdit(product)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit />
                      Modifier
                    </motion.button>
                    <motion.button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(product.id as string)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaTrash />
                      Supprimer
                    </motion.button>
                  </div>
                  <div className={styles.flavorsSection}>
                    <span className={styles.flavorsTitle}>Goûts disponibles</span>
                    {hasCustomFlavors ? (
                      <ul className={styles.flavorsList}>
                        {product.flavors!.map((flavor) => (
                          <li key={flavor.id || flavor.name} className={styles.flavorItem}>
                            <span>{flavor.name}</span>
                            <span className={styles.flavorPrice}>
                              {formatFlavorModifier(flavor.price_modifier)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : fallbackFlavors.length > 0 ? (
                      <>
                        <p className={styles.flavorsFallbackText}>
                          Utilise la configuration standard ({fallbackFlavors.length} goûts) :
                        </p>
                        <ul className={styles.flavorsFallbackList}>
                          {fallbackFlavors.map((flavor) => (
                            <li key={flavor.name}>{flavor.name}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className={styles.flavorsFallbackText}>
                        Aucun goût personnalisé. Ajoutez-en pour proposer des choix spécifiques.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

