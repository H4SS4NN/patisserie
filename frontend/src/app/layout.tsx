import type { Metadata } from 'next';
import { Epilogue, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartModalManager from '@/components/CartModalManager';
import ToasterWrapper from '@/components/ToasterWrapper';
import '@/styles/globals.scss';

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-epilogue',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Assia - Pâtisserie Artisanale',
  description: 'Découvrez nos gâteaux artisanaux faits à la main avec passion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${epilogue.variable} ${playfair.variable}`}>
      <body>
        <SiteSettingsProvider>
          <CartProvider>
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
            <CartModalManager />
            <ToasterWrapper />
          </CartProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}

