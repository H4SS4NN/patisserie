'use client';

import React from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import styles from './Footer.module.scss';

export default function Footer() {
  const {
    settings: { footerText, socialLinks },
  } = useSiteSettings();

  const socialLinkMap: Record<string, JSX.Element> = {
    facebook: <FaFacebook />,
    instagram: <FaInstagram />,
  };

  return (
    <footer className={styles.footer}>
      <p>{footerText}</p>
      <div className={styles.socialLinks}>
        {socialLinks.map((link) => {
          const icon = socialLinkMap[link.platform.toLowerCase()] ?? <FaFacebook />;
          return (
            <a
              key={link.id || link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.platform}
              className={styles.socialLink}
            >
              {icon}
            </a>
          );
        })}
      </div>
    </footer>
  );
}

