'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from '@/lib/api';
import { Order, PaymentMethod } from '@/types';
import { showSuccess, showError } from '@/lib/toast';
import styles from './OrderForm.module.scss';

interface OrderFormProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function OrderForm({ onClose, onComplete }: OrderFormProps) {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    pickup_or_delivery_date: '',
    payment_method: 'CASH' as PaymentMethod,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (priceInCentimes: number) => {
    return (priceInCentimes / 100).toFixed(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Préparer les items pour l'API
      const items = cart.map((item) => {
        // S'assurer que l'ID est bien un string (UUID)
        const productId = typeof item.id === 'string' ? item.id : String(item.id);
        
        // Vérifier que c'est un UUID valide
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(productId)) {
          throw new Error(`Invalid product ID format: ${productId}. Expected UUID. Please clear your cart and add products again.`);
        }

        return {
          product_id: productId,
          name: item.name.trim(),
          qty: parseInt(String(item.quantity), 10), // S'assurer que c'est un entier
          options: item.options || {},
          price: parseInt(String(item.price), 10), // S'assurer que c'est un entier
        };
      });

      // Convertir la date locale en ISO8601 avec timezone
      let pickupDate = formData.pickup_or_delivery_date;
      if (pickupDate) {
        const dateObj = new Date(pickupDate);
        if (!isNaN(dateObj.getTime())) {
          pickupDate = dateObj.toISOString();
        } else {
          throw new Error('Date invalide');
        }
      } else {
        throw new Error('Date de retrait requise');
      }

      // Nettoyer le numéro de téléphone
      let cleanedPhone = formData.client_phone.trim().replace(/[\s\-\.]/g, '');
      if (cleanedPhone.startsWith('0')) {
        cleanedPhone = cleanedPhone.replace(/^0/, '+33');
      } else if (!cleanedPhone.startsWith('+')) {
        cleanedPhone = '+' + cleanedPhone;
      }

      const orderData: Omit<Order, 'total_price'> = {
        client_name: formData.client_name.trim(),
        client_phone: cleanedPhone,
        client_email: formData.client_email?.trim() || undefined,
        items,
        pickup_or_delivery_date: pickupDate,
        payment_method: formData.payment_method,
        notes: formData.notes?.trim() || undefined,
      };

      // Debug: log les données envoyées
      console.log('Sending order data:', JSON.stringify(orderData, null, 2));
      console.log('Items:', items);

      const response = await createOrder(orderData);

      // Vérifier s'il y a une erreur PayPal mais que la commande a été créée
      if ((response as any).paypalError) {
        // La commande a été créée mais PayPal a échoué
        clearCart();
        showError(
          'Commande créée avec succès, mais le paiement PayPal n\'a pas pu être initialisé. ' +
          'Veuillez contacter le magasin pour finaliser le paiement. ' +
          'Vous pouvez aussi choisir le paiement en espèces lors de votre prochaine commande.'
        );
        onComplete();
        return;
      }

      if ((response as any).payment?.approvalUrl) {
        // Sauvegarder l'ID de commande pour la page de retour PayPal
        if ((response as any).order?.id) {
          localStorage.setItem('pending_paypal_order_id', String((response as any).order.id));
        }
        // Redirection PayPal
        window.location.href = (response as any).payment.approvalUrl;
      } else {
        // Commande CASH réussie
        clearCart();
        showSuccess('Commande passée avec succès !');
        onComplete();
      }
    } catch (err: any) {
      console.error('Order error:', err);

      let errorMessage = 'Erreur lors de la création de la commande.';

      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = validationErrors
          .map((error: any) => error.msg || error.message || 'Erreur de validation')
          .join(', ');
        errorMessage = `Erreurs de validation : ${errorMessages}`;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculer la date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];
  const minDate = today;

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

  return (
    <motion.div
      className={styles.orderOverlay}
      onClick={onClose}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
        <motion.div
          className={styles.orderModal}
          onClick={(e) => e.stopPropagation()}
          variants={modalVariants}
        >
          <div className={styles.orderHeader}>
            <h2>Finaliser votre commande</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.orderForm}>
            <div className={styles.orderSummary}>
              <h3>Récapitulatif</h3>
              {cart.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}€</span>
                </div>
              ))}
              <div className={styles.orderTotal}>
                <strong>Total: {formatPrice(getTotalPrice())}€</strong>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Informations de contact</h3>
              <div className={styles.formGroup}>
                <label htmlFor="client_name">Nom complet *</label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                  placeholder="Jean Dupont"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="client_phone">Téléphone *</label>
                <input
                  type="tel"
                  id="client_phone"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  required
                  placeholder="06 12 34 56 78 ou +33612345678"
                />
                <small className={styles.formHint}>
                  Format accepté : +33 6 12 34 56 78 ou 06 12 34 56 78
                </small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="client_email">Email</label>
                <input
                  type="email"
                  id="client_email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleChange}
                  placeholder="jean.dupont@example.com"
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Date de retrait</h3>
              <div className={styles.formGroup}>
                <label htmlFor="pickup_or_delivery_date">Date souhaitée *</label>
                <input
                  type="datetime-local"
                  id="pickup_or_delivery_date"
                  name="pickup_or_delivery_date"
                  value={formData.pickup_or_delivery_date}
                  onChange={handleChange}
                  min={minDate}
                  required
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Paiement</h3>
              <div className={styles.formGroup}>
                <label htmlFor="payment_method">Méthode de paiement *</label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  required
                >
                  <option value="CASH">Espèces</option>
                  <option value="PAYPAL">PayPal</option>
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label htmlFor="notes">Notes (optionnel)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Message sur le gâteau, instructions spéciales..."
                />
              </div>
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
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Envoi...' : 'Confirmer la commande'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
  );
}

