# Structure du Projet

Ce document décrit la structure complète du projet backend de gestion de commandes pâtisserie.

## 📁 Structure des Fichiers

```
repas/
├── src/
│   ├── config/
│   │   ├── database.ts          # Configuration TypeORM
│   │   └── redis.ts             # Configuration Redis
│   ├── controllers/
│   │   ├── auth.controller.ts   # Contrôleur authentification
│   │   ├── order.controller.ts  # Contrôleur commandes
│   │   ├── product.controller.ts # Contrôleur produits
│   │   └── webhook.controller.ts # Contrôleur webhooks PayPal
│   ├── entities/
│   │   ├── AdminUser.entity.ts  # Entité utilisateur admin
│   │   ├── AuditLog.entity.ts   # Entité logs d'audit
│   │   ├── Order.entity.ts      # Entité commande
│   │   └── Product.entity.ts    # Entité produit
│   ├── middlewares/
│   │   ├── auth.middleware.ts   # Middleware JWT
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   └── validation.middleware.ts # Validation des entrées
│   ├── migrations/
│   │   └── 1700000000000-InitialMigration.ts # Migration initiale
│   ├── routes/
│   │   ├── auth.routes.ts       # Routes authentification
│   │   ├── order.routes.ts       # Routes commandes
│   │   ├── product.routes.ts     # Routes produits
│   │   └── webhook.routes.ts     # Routes webhooks
│   ├── scripts/
│   │   └── seed.ts              # Script de seed (produits + admin)
│   ├── services/
│   │   ├── auth.service.ts      # Service authentification
│   │   ├── email.service.ts     # Service envoi emails
│   │   ├── order.service.ts     # Service commandes
│   │   └── payment.service.ts   # Service paiements PayPal
│   ├── utils/
│   │   ├── jwt.ts               # Utilitaires JWT
│   │   └── orderNumber.ts       # Génération numéro commande
│   ├── __tests__/
│   │   ├── integration/
│   │   │   ├── auth.integration.test.ts
│   │   │   ├── order.integration.test.ts
│   │   │   └── webhook.integration.test.ts
│   │   └── services/
│   │       ├── auth.service.test.ts
│   │       └── order.service.test.ts
│   └── index.ts                 # Point d'entrée de l'application
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD
├── docker-compose.yml           # Configuration Docker Compose
├── Dockerfile                   # Image Docker
├── env.example                  # Exemple de variables d'environnement
├── .eslintrc.json              # Configuration ESLint
├── .prettierrc                 # Configuration Prettier
├── .gitignore                  # Fichiers ignorés par Git
├── .dockerignore               # Fichiers ignorés par Docker
├── jest.config.js              # Configuration Jest
├── package.json                # Dépendances et scripts
├── postman_collection.json     # Collection Postman
├── tsconfig.json               # Configuration TypeScript
├── init.sql                    # Script d'initialisation MySQL
├── README.md                   # Documentation principale
├── QUICKSTART.md              # Guide de démarrage rapide
├── EXAMPLES.md                 # Exemples de requêtes API
├── SECURITY.md                 # Documentation sécurité
└── PROJECT_STRUCTURE.md        # Ce fichier
```

## 🔧 Technologies Utilisées

### Backend
- **Node.js 20+** : Runtime JavaScript
- **TypeScript** : Typage statique
- **Express** : Framework web
- **TypeORM** : ORM pour MySQL
- **MySQL 8.0** : Base de données relationnelle

### Sécurité
- **JWT** : Authentification token-based
- **bcrypt** : Hashage des mots de passe
- **speakeasy** : 2FA TOTP
- **express-validator** : Validation des entrées
- **helmet** : Headers de sécurité HTTP
- **express-rate-limit** : Rate limiting

### Services Externes
- **PayPal REST SDK** : Intégration paiements
- **Nodemailer** : Envoi emails SMTP
- **SendGrid** : Alternative email (optionnel)
- **Redis** : Cache et rate limiting (optionnel)

### Tests
- **Jest** : Framework de tests
- **supertest** : Tests d'intégration HTTP

### DevOps
- **Docker** : Containerisation
- **Docker Compose** : Orchestration
- **GitHub Actions** : CI/CD

## 📊 Base de Données

### Tables Principales

1. **products** : Catalogue des produits
2. **orders** : Commandes clients
3. **admin_users** : Utilisateurs administrateurs
4. **audit_logs** : Logs des actions admin

### Relations

- `orders.last_modified_by` → `admin_users.id`
- `audit_logs.order_id` → `orders.id`
- `audit_logs.admin_user_id` → `admin_users.id`

## 🔐 Routes API

### Public
- `POST /orders` - Créer une commande
- `GET /products` - Liste des produits
- `GET /products/:id` - Détails produit

### Admin (JWT requis)
- `POST /auth/login` - Connexion
- `GET /auth/profile` - Profil admin
- `GET /admin/orders` - Liste commandes
- `GET /admin/orders/:id` - Détails commande
- `PATCH /admin/orders/:id/status` - Modifier statut
- `PATCH /admin/orders/:id/payment` - Modifier paiement
- `GET /admin/calendar` - Planning
- `GET /admin/stats` - Statistiques
- `POST /products/admin/products` - Créer produit
- `PATCH /products/admin/products/:id` - Modifier produit
- `DELETE /products/admin/products/:id` - Supprimer produit

### Webhooks
- `POST /webhooks/paypal` - Webhook PayPal

## 🧪 Tests

### Tests Unitaires
- `src/services/__tests__/auth.service.test.ts`
- `src/services/__tests__/order.service.test.ts`
- `src/utils/__tests__/orderNumber.test.ts`

### Tests d'Intégration
- `src/__tests__/integration/auth.integration.test.ts`
- `src/__tests__/integration/order.integration.test.ts`
- `src/__tests__/integration/webhook.integration.test.ts`

## 📝 Scripts NPM

- `npm run build` - Compiler TypeScript
- `npm start` - Démarrer en production
- `npm run start:dev` - Démarrer en développement
- `npm run migrate` - Exécuter les migrations
- `npm run seed` - Charger les données de test
- `npm test` - Exécuter les tests
- `npm run lint` - Vérifier le code
- `npm run format` - Formater le code

## 🐳 Services Docker

1. **app** : Application Node.js (port 3000)
2. **db** : MySQL 8.0 (port 3306)
3. **redis** : Redis (port 6379)
4. **adminer** : Interface web MySQL (port 8080)

## 📚 Documentation

- **README.md** : Documentation complète
- **QUICKSTART.md** : Guide de démarrage rapide
- **EXAMPLES.md** : Exemples de requêtes API
- **SECURITY.md** : Bonnes pratiques sécurité
- **Swagger UI** : Documentation interactive (`/docs`)

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Secrets changés (JWT_SECRET, etc.)
- [ ] Base de données initialisée
- [ ] Migrations exécutées
- [ ] Tests passés
- [ ] HTTPS configuré
- [ ] Backups configurés
- [ ] Monitoring en place
- [ ] 2FA activé pour admins

## 🔄 Prochaines Améliorations

- [ ] Support de plusieurs langues
- [ ] Notifications push
- [ ] Dashboard admin avec graphiques
- [ ] Export PDF des commandes
- [ ] Gestion des stocks
- [ ] API de recherche avancée
- [ ] WebSocket pour notifications temps réel

