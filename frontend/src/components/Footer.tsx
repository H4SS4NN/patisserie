'use client';

import React from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© 2024 Assiqa. Tous droits réservés.</p>
      <div className={styles.socialLinks}>
        <a href="#" aria-label="Facebook" className={styles.socialLink}>
          <FaFacebook />
        </a>
        <a href="#" aria-label="Instagram" className={styles.socialLink}>
          <FaInstagram />
        </a>
      </div>
    </footer>
  );
}

