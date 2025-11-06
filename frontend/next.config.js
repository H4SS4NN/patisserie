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
  // Optimiser le chargement des CSS
  experimental: {
    optimizeCss: true,
  },
  // Ignorer les avertissements de preload CSS (non critiques)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Désactiver ESLint pendant le build pour la production
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver la vérification TypeScript pendant le build (optionnel)
  typescript: {
    ignoreBuildErrors: false, // Garder la vérification TypeScript
  },
}

module.exports = nextConfig

