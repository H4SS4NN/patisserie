'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.scss';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const paymentId = searchParams.get('paymentId');
  const payerId = searchParams.get('PayerID');

  useEffect(() => {
    // Nettoyer le panier après un paiement réussi
    clearCart();

    // Si on a les paramètres PayPal, on peut exécuter le paiement
    if (paymentId && payerId) {
      executePayment();
    } else {
      setLoading(false);
    }
  }, [paymentId, payerId]);

  const executePayment = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Récupérer l'orderId depuis localStorage (sauvegardé lors de la création de commande)
      const savedOrderId = localStorage.getItem('pending_paypal_order_id');
      
      if (!savedOrderId) {
        console.warn('Order ID not found in localStorage');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/webhooks/paypal/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          payerId,
          orderId: savedOrderId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('pending_paypal_order_id');
        setLoading(false);
      } else {
        throw new Error('Payment execution failed');
      }
    } catch (error) {
      console.error('Payment execution error:', error);
      setLoading(false);
      // Même en cas d'erreur, on affiche la page de succès
      // Le webhook PayPal mettra à jour le statut
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Finalisation du paiement...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.successCard}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.iconContainer}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <FaCheckCircle className={styles.successIcon} />
        </motion.div>

        <h1>Paiement Réussi !</h1>
        <p className={styles.message}>
          Votre commande a été confirmée et votre paiement a été traité avec succès.
        </p>

        {paymentId && (
          <div className={styles.orderInfo}>
            <p>
              <strong>Paiement PayPal confirmé</strong>
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#6b5e5a' }}>
              ID de transaction : {paymentId.substring(0, 20)}...
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            <FaHome />
            Retour à l'accueil
          </Link>
        </div>

        <div className={styles.infoBox}>
          <p>
            <strong>Prochaines étapes :</strong>
          </p>
          <ul>
            <li>Vous recevrez un email de confirmation sous peu</li>
            <li>Votre commande sera préparée pour la date de retrait choisie</li>
            <li>Nous vous contacterons si nécessaire</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.loading}>Chargement...</div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

