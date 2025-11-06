'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getOrders } from '@/lib/adminApi';
import { Order } from '@/types';
import { FaEye, FaFilter, FaSync } from 'react-icons/fa';
import styles from './page.module.scss';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
  });
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrders(filters);
      setOrders(data);
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
      console.error(err);
    } finally {
      setLoading(false);
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

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.dashboardHeader}>
        <h1>Gestion des Commandes</h1>
        <motion.button
          className={styles.refreshButton}
          onClick={loadOrders}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <FaSync />
          Actualiser
        </motion.button>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <label>Statut</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="EN_PREPARATION">En préparation</option>
            <option value="EN_CUISSON">En cuisson</option>
            <option value="PRETE">Prête</option>
            <option value="LIVREE">Livrée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Paiement</label>
          <select
            value={filters.payment_status}
            onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
          >
            <option value="">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="PAID">Payée</option>
            <option value="REFUNDED">Remboursée</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {loading ? (
        <div className={styles.loadingState}>Chargement des commandes...</div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aucune commande trouvée</p>
        </div>
      ) : (
        <div className={styles.ordersTableContainer}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Client</th>
                <th>Date</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={styles.orderRow}
                >
                  <td className={styles.orderNumber}>{order.numero_commande}</td>
                  <td>
                    <div className={styles.clientInfo}>
                      <strong>{order.client_name}</strong>
                      {order.client_email && (
                        <span className={styles.clientEmail}>{order.client_email}</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td className={styles.orderTotal}>{formatPrice(order.total_price)}€</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.paymentBadge} ${getPaymentBadgeClass(order.payment_status)}`}
                    >
                      {getPaymentLabel(order.payment_status)}
                    </span>
                  </td>
                  <td>
                    <motion.button
                      className={styles.viewButton}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Voir les détails"
                    >
                      <FaEye />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

