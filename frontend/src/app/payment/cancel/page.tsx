'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimesCircle, FaShoppingCart, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.scss';

export default function PaymentCancelPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Nettoyer l'orderId en attente si l'utilisateur annule
    localStorage.removeItem('pending_paypal_order_id');
  }, []);
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.cancelCard}
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
          <FaTimesCircle className={styles.cancelIcon} />
        </motion.div>

        <h1>Paiement Annulé</h1>
        <p className={styles.message}>
          Votre paiement PayPal a été annulé. Aucun montant n'a été débité.
        </p>

        <div className={styles.infoBox}>
          <p>
            <strong>Que souhaitez-vous faire ?</strong>
          </p>
          <ul>
            <li>Vous pouvez réessayer le paiement</li>
            <li>Choisir un autre mode de paiement (espèces)</li>
            <li>Modifier votre commande</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            <FaHome />
            Retour à l'accueil
          </Link>
          <Link href="/" className={styles.cartButton}>
            <FaShoppingCart />
            Voir mon panier
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

