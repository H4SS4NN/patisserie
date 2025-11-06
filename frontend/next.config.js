/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Nécessaire pour Docker
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  // Optimisation CSS désactivée pour le build Docker
  // experimental: {
  //   optimizeCss: true,
  // },
  // Ignorer les avertissements de preload CSS (non critiques)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Désactiver ESLint pendant le build pour la production
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver la vérification TypeScript pendant le build (pour production)
  typescript: {
    ignoreBuildErrors: true, // Ignorer les erreurs TypeScript pour le build de production
  },
}

module.exports = nextConfig

