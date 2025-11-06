'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToasterWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#4e4441',
          border: '1px solid #fadadd',
          borderRadius: '0.5rem',
          fontFamily: 'var(--font-epilogue), sans-serif',
        },
        success: {
          iconTheme: {
            primary: '#00b894',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ee2b5b',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

