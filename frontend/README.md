# Frontend Next.js - Assiqa Pâtisserie

Frontend moderne et scalable construit avec Next.js 14, TypeScript et SCSS.

## 🚀 Technologies

- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **SCSS** pour les styles modulaires
- **Framer Motion** pour les animations
- **React Context API** pour la gestion d'état (panier)
- **Axios** pour les appels API

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── a-propos/           # Page À propos
│   │   ├── galerie/            # Page Galerie
│   │   ├── contact/            # Page Contact
│   │   └── admin/              # Pages admin
│   │       ├── layout.tsx      # Layout admin
│   │       ├── page.tsx        # Dashboard admin
│   │       └── login/          # Page de connexion admin
│   ├── components/             # Composants réutilisables
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Cart.tsx
│   │   ├── OrderForm.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── CartModalManager.tsx
│   ├── contexts/                # Contextes React
│   │   └── CartContext.tsx     # Contexte du panier
│   ├── lib/                     # Services et utilitaires
│   │   ├── api.ts              # API publique
│   │   └── adminApi.ts         # API admin
│   ├── types/                   # Types TypeScript
│   │   └── index.ts
│   └── styles/                  # Styles globaux
│       └── globals.scss
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Démarrer le serveur de production
npm start
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du dossier `frontend` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🎨 Styles

Les styles sont organisés en modules SCSS :
- Chaque composant a son propre fichier `.module.scss`
- Les styles globaux sont dans `src/styles/globals.scss`
- Utilisation de CSS Modules pour éviter les conflits de noms

## 📦 Fonctionnalités

### Frontend public
- ✅ Affichage des produits avec filtres par catégorie
- ✅ Panier d'achat avec gestion des quantités
- ✅ Formulaire de commande
- ✅ Pages : Accueil, À propos, Galerie, Contact
- ✅ Animations fluides avec Framer Motion

### Admin
- ✅ Authentification
- ✅ Dashboard avec liste des commandes
- ✅ Filtres par statut et paiement
- ✅ Détails des commandes (à implémenter)

## 🔧 Architecture

### Gestion d'état
- **CartContext** : Gestion du panier avec persistance localStorage
- Pas de Redux nécessaire pour cette application

### Routing
- Utilisation de l'App Router de Next.js
- Routes dynamiques supportées
- Protection des routes admin

### API
- Services séparés pour API publique et admin
- Gestion automatique des tokens JWT
- Intercepteurs pour la gestion des erreurs

## 🚀 Déploiement

### Vercel (recommandé)
```bash
npm install -g vercel
vercel
```

### Autres plateformes
Le projet peut être déployé sur n'importe quelle plateforme supportant Next.js :
- Netlify
- AWS Amplify
- Docker (voir Dockerfile)

## 📝 Notes

- Le panier est persisté dans le localStorage
- Les tokens admin sont stockés dans le localStorage
- Les styles SCSS sont compilés automatiquement par Next.js
- TypeScript est configuré en mode strict

## 🐛 Dépannage

### Erreurs de build
```bash
# Nettoyer le cache
rm -rf .next
npm run build
```

### Problèmes de styles
Vérifiez que `sass` est bien installé :
```bash
npm install sass
```
