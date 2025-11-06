#!/bin/bash

# Script de déploiement pour OVH
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement de l'application..."

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json introuvable. Exécutez ce script depuis la racine du projet.${NC}"
    exit 1
fi

# Backend
echo -e "${YELLOW}📦 Build du backend...${NC}"
npm install
npm run build

# Migrations
echo -e "${YELLOW}🗄️  Exécution des migrations...${NC}"
npm run migrate || echo -e "${YELLOW}⚠️  Aucune nouvelle migration${NC}"

# Frontend
echo -e "${YELLOW}📦 Build du frontend...${NC}"
cd frontend
npm install
npm run build
cd ..

# Redémarrer avec PM2
echo -e "${YELLOW}🔄 Redémarrage des applications...${NC}"
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

# Afficher le statut
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo -e "${GREEN}📊 Statut des applications:${NC}"
pm2 status

echo -e "${GREEN}📝 Pour voir les logs: pm2 logs${NC}"

