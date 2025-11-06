'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminLogout } from '@/lib/adminApi';
import styles from './layout.module.scss';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (!token && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (token) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.adminLayout}>
      <nav className={styles.adminNav}>
        <div className={styles.navHeader}>
          <h2>Assiqa Admin</h2>
        </div>
        <div className={styles.navLinks}>
          <a
            href="/admin"
            className={pathname === '/admin' ? styles.active : ''}
          >
            Commandes
          </a>
          <a
            href="/admin/products"
            className={pathname === '/admin/products' ? styles.active : ''}
          >
            Gâteaux
          </a>
        </div>
        <div className={styles.navFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Déconnexion
          </button>
        </div>
      </nav>
      <main className={styles.adminContent}>{children}</main>
    </div>
  );
}

