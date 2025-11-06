'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from '@/lib/adminApi';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { FaArrowLeft, FaSave, FaCheckCircle } from 'react-icons/fa';
import { showSuccess, showError } from '@/lib/toast';
import styles from './page.module.scss';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '' as OrderStatus | '',
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    payment_status: '' as PaymentStatus | '',
    paypal_payment_id: '',
  });

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  useEffect(() => {
    if (order) {
      setStatusForm({
        status: (order.status as OrderStatus) || '',
        notes: (order as any).notes_admin || '',
      });
      setPaymentForm({
        payment_status: (order.payment_status as PaymentStatus) || '',
        paypal_payment_id: (order as any).paypal_payment_id || '',
      });
    }
  }, [order]);

  const loadOrder = async () => {
    setLoading(true);
    setError('');
    try {
      // L'ID peut être un UUID ou un nombre
      const orderId = isNaN(Number(id)) ? id : Number(id);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      setError('Erreur lors du chargement de la commande');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !statusForm.status) return;
    setSaving(true);
    try {
      const orderId = isNaN(Number(id)) ? id : Number(id);
      const updated = await updateOrderStatus(
        orderId,
        statusForm.status as OrderStatus,
        statusForm.notes || undefined
      );
      setOrder(updated);
      showSuccess('Statut mis à jour avec succès');
    } catch (err) {
      showError('Erreur lors de la mise à jour du statut');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !paymentForm.payment_status) return;
    setSaving(true);
    try {
      const orderId = isNaN(Number(id)) ? id : Number(id);
      const updated = await updatePaymentStatus(
        orderId,
        paymentForm.payment_status as PaymentStatus,
        paymentForm.paypal_payment_id || undefined
      );
      setOrder(updated);
      showSuccess('Paiement mis à jour avec succès');
    } catch (err) {
      showError('Erreur lors de la mise à jour du paiement');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (priceInCentimes: number) => {
    return (priceInCentimes / 100).toFixed(2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status?: string) => {
    const statusMap: Record<string, string> = {
      PENDING: styles.statusPending,
      CONFIRMED: styles.statusConfirmed,
      EN_PREPARATION: styles.statusPreparation,
      EN_CUISSON: styles.statusCuisson,
      PRETE: styles.statusPrete,
      LIVREE: styles.statusLivree,
      CANCELLED: styles.statusCancelled,
    };
    return statusMap[status || ''] || styles.statusPending;
  };

  const getPaymentBadgeClass = (status?: string) => {
    const statusMap: Record<string, string> = {
      PENDING: styles.paymentPending,
      PAID: styles.paymentPaid,
      REFUNDED: styles.paymentRefunded,
    };
    return statusMap[status || ''] || styles.paymentPending;
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      EN_PREPARATION: 'En préparation',
      EN_CUISSON: 'En cuisson',
      PRETE: 'Prête',
      LIVREE: 'Livrée',
      CANCELLED: 'Annulée',
    };
    return labels[status || ''] || status || '';
  };

  const getPaymentLabel = (status?: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PAID: 'Payée',
      REFUNDED: 'Remboursée',
    };
    return labels[status || ''] || status || '';
  };

  if (loading) {
    return <div className={styles.loadingState}>Chargement de la commande...</div>;
  }

  if (error || !order) {
    return (
      <div className={styles.errorState}>
        <p>{error || 'Commande non trouvée'}</p>
        <button onClick={() => router.push('/admin')}>Retour à la liste</button>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.orderDetail}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.detailHeader}>
        <motion.button
          className={styles.backButton}
          onClick={() => router.push('/admin')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft />
          Retour
        </motion.button>
        <h1>Commande {order.numero_commande}</h1>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailSection}>
          <h2>Informations client</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <strong>Nom:</strong> {order.client_name}
            </div>
            <div className={styles.infoItem}>
              <strong>Téléphone:</strong> {order.client_phone}
            </div>
            {order.client_email && (
              <div className={styles.infoItem}>
                <strong>Email:</strong> {order.client_email}
              </div>
            )}
          </div>
        </div>

        <div className={styles.detailSection}>
          <h2>Statut de la commande</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <strong>Statut:</strong>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <strong>Paiement:</strong>
              <span
                className={`${styles.paymentBadge} ${getPaymentBadgeClass(order.payment_status)}`}
              >
                {getPaymentLabel(order.payment_status)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <strong>Méthode:</strong> {order.payment_method}
            </div>
            <div className={styles.infoItem}>
              <strong>Date de création:</strong> {formatDate(order.created_at)}
            </div>
            <div className={styles.infoItem}>
              <strong>Date de retrait:</strong> {formatDate(order.pickup_or_delivery_date)}
            </div>
          </div>
        </div>

        <div className={`${styles.detailSection} ${styles.fullWidth}`}>
          <h2>Articles commandés</h2>
          <div className={styles.itemsCard}>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.options && Object.keys(item.options).length > 0 && (
                        <div className={styles.itemOptions}>
                          {Object.entries(item.options).map(([key, value]) => (
                            <span key={key} className={styles.optionTag}>
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{item.qty}</td>
                    <td>{formatPrice(item.price)}€</td>
                    <td>
                      <strong>{formatPrice(item.price * item.qty)}€</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong className={styles.totalPrice}>
                      {formatPrice(order.total_price)}€
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {order.notes && (
          <div className={styles.detailSection}>
            <h2>Notes client</h2>
            <div className={styles.infoCard}>
              <p>{order.notes}</p>
            </div>
          </div>
        )}

        <div className={styles.detailSection}>
          <h2>Modifier le statut</h2>
          <form className={styles.statusForm} onSubmit={handleStatusUpdate}>
            <div className={styles.formGroup}>
              <label>Nouveau statut</label>
              <select
                value={statusForm.status}
                onChange={(e) =>
                  setStatusForm({ ...statusForm, status: e.target.value as OrderStatus })
                }
                required
              >
                <option value="">Sélectionner...</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmée</option>
                <option value="EN_PREPARATION">En préparation</option>
                <option value="EN_CUISSON">En cuisson</option>
                <option value="PRETE">Prête</option>
                <option value="LIVREE">Livrée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Notes admin (optionnel)</label>
              <textarea
                value={statusForm.notes}
                onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                rows={3}
                placeholder="Notes internes..."
              />
            </div>
            <motion.button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSave />
              {saving ? 'Enregistrement...' : 'Enregistrer le statut'}
            </motion.button>
          </form>
        </div>

        <div className={styles.detailSection}>
          <h2>Modifier le paiement</h2>
          <form className={styles.paymentForm} onSubmit={handlePaymentUpdate}>
            <div className={styles.formGroup}>
              <label>Statut du paiement</label>
              <select
                value={paymentForm.payment_status}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_status: e.target.value as PaymentStatus,
                  })
                }
                required
              >
                <option value="">Sélectionner...</option>
                <option value="PENDING">En attente</option>
                <option value="PAID">Payée</option>
                <option value="REFUNDED">Remboursée</option>
              </select>
            </div>
            {order.payment_method === 'PAYPAL' && (
              <div className={styles.formGroup}>
                <label>ID Paiement PayPal (optionnel)</label>
                <input
                  type="text"
                  value={paymentForm.paypal_payment_id}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paypal_payment_id: e.target.value })
                  }
                  placeholder="PAY-..."
                />
              </div>
            )}
            <motion.button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaCheckCircle />
              {saving ? 'Enregistrement...' : 'Enregistrer le paiement'}
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

