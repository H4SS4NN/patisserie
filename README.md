# Backend Pâtisserie - Gestion de Commandes

Backend complet et production-ready pour la gestion de commandes d'une pâtisserie artisanale. Développé avec Node.js, TypeScript, Express, TypeORM et MySQL.

## 🚀 Fonctionnalités

- ✅ Gestion des commandes clients (sans création de compte)
- ✅ Authentification admin avec JWT + 2FA optionnel (TOTP)
- ✅ Gestion des produits (CRUD)
- ✅ Paiements CASH et PayPal
- ✅ Envoi d'emails automatiques (SMTP/SendGrid)
- ✅ Rate limiting avec Redis
- ✅ Logs d'audit des actions admin
- ✅ API REST documentée (Swagger/OpenAPI)
- ✅ Tests unitaires et d'intégration
- ✅ Docker & Docker Compose

## 📋 Prérequis

- Node.js 20+
- Docker & Docker Compose (recommandé)
- MySQL 8.0+ (si installation manuelle)
- Redis (optionnel, pour rate limiting)

## 🛠️ Installation

### Option 1 : Docker Compose (Recommandé)

1. Clonez le repository :
```bash
git clone <repository-url>
cd repas
```

2. Créez un fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

3. Modifiez les variables d'environnement dans `.env` selon vos besoins.

4. Lancez les services avec Docker Compose :
```bash
docker-compose up --build
```

5. Exécutez les migrations et le seed :
```bash
docker-compose exec app npm run migrate
docker-compose exec app npm run seed
```

L'application sera accessible sur `http://localhost:3000`.

### Option 2 : Installation Manuelle

1. Installez les dépendances :
```bash
npm install
```

2. Configurez la base de données MySQL et créez un fichier `.env`.

3. Initialisez la base de données :
```bash
npm run migrate
npm run seed
```

4. Démarrez l'application :
```bash
npm run start:dev
```

## 📝 Variables d'Environnement

Voir `.env.example` pour la liste complète. Variables importantes :

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` : Configuration MySQL
- `JWT_SECRET` : Secret pour la génération des tokens JWT
- `SMTP_*` ou `SENDGRID_API_KEY` : Configuration email
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE` : Configuration PayPal
- `REDIS_HOST`, `REDIS_PORT` : Configuration Redis (optionnel)

## 🧪 Tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Avec couverture
npm test -- --coverage
```

## 📚 API Documentation

Une fois l'application démarrée, la documentation Swagger est disponible sur :
- **Swagger UI** : `http://localhost:3000/docs`
- **OpenAPI JSON** : `http://localhost:3000/docs.json`

### Collection Postman

Importez le fichier `postman_collection.json` dans Postman pour tester toutes les routes.

## 🔐 Endpoints Principaux

### Public

- `POST /orders` - Créer une commande
- `GET /products` - Lister les produits disponibles
- `GET /products/:id` - Détails d'un produit

### Admin (authentification requise)

- `POST /auth/login` - Connexion admin
- `GET /admin/orders` - Liste des commandes (avec filtres)
- `GET /admin/orders/:id` - Détails d'une commande
- `PATCH /admin/orders/:id/status` - Modifier le statut d'une commande
- `PATCH /admin/orders/:id/payment` - Modifier le statut de paiement
- `GET /admin/calendar` - Planning des commandes
- `GET /admin/stats` - Statistiques
- `POST /products/admin/products` - Créer un produit
- `PATCH /products/admin/products/:id` - Modifier un produit
- `DELETE /products/admin/products/:id` - Supprimer un produit

### Webhooks

- `POST /webhooks/paypal` - Webhook PayPal pour les paiements

## 📦 Exemple de Requête

### Créer une commande (CASH)

```bash
POST /orders
Content-Type: application/json

{
  "client_name": "Sami Dupont",
  "client_phone": "+33612345678",
  "client_email": "sami@example.com",
  "items": [
    {
      "product_id": "uuid-du-produit",
      "name": "Fraisier 6 parts",
      "qty": 1,
      "options": {
        "taille": "6 parts"
      },
      "price": 4500
    }
  ],
  "pickup_or_delivery_date": "2025-12-24T10:00:00+01:00",
  "payment_method": "CASH",
  "notes": "Message sur le gâteau : Joyeux Noël"
}
```

### Réponse

```json
{
  "success": true,
  "order": {
    "id": "uuid-de-la-commande",
    "numero_commande": "PAT-20251104-0001",
    "total_price": 4500,
    "payment_method": "CASH",
    "payment_status": "PENDING",
    "status": "PENDING"
  },
  "payment": null
}
```

### Créer une commande (PAYPAL)

Même payload mais avec `"payment_method": "PAYPAL"`. La réponse inclura :

```json
{
  "success": true,
  "order": { ... },
  "payment": {
    "paymentId": "PAY-123456789",
    "approvalUrl": "https://www.paypal.com/checkoutnow?token=..."
  }
}
```

## 🔒 Sécurité

### Mesures Implémentées

1. **Authentification JWT** : Tokens avec expiration courte (1h)
2. **Hashing des mots de passe** : bcrypt avec salt 12
3. **2FA TOTP** : Optionnel pour les admins (speakeasy)
4. **Rate Limiting** : Protection contre les attaques par force brute
5. **Validation des entrées** : express-validator pour toutes les données
6. **CORS** : Configuration stricte
7. **Helmet** : Headers de sécurité HTTP
8. **Logs d'audit** : Traçabilité des actions admin

### Recommandations Production

- ✅ Utiliser HTTPS (configurer via reverse proxy nginx/traefik)
- ✅ Changer tous les secrets par défaut
- ✅ Activer 2FA pour tous les admins
- ✅ Configurer des backups automatiques de la base de données
- ✅ Monitorer les logs et mettre en place des alertes
- ✅ Utiliser des variables d'environnement sécurisées (Secrets Manager)

## 🐳 Docker

### Services

- **app** : Application Node.js (port 3000)
- **db** : MySQL 8.0 (port 3306)
- **redis** : Redis pour rate limiting (port 6379)
- **adminer** : Interface web pour MySQL (port 8080)

### Commandes Utiles

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Arrêter les services
docker-compose down

# Réinitialiser la base de données
docker-compose down -v
docker-compose up -d
```

## 📊 Structure du Projet

```
├── src/
│   ├── config/          # Configuration (DB, Redis)
│   ├── controllers/     # Contrôleurs REST
│   ├── entities/        # Entités TypeORM
│   ├── middlewares/     # Middlewares (auth, validation, rate limit)
│   ├── migrations/      # Migrations TypeORM
│   ├── routes/          # Définition des routes
│   ├── scripts/         # Scripts utilitaires (seed)
│   ├── services/        # Services métier
│   ├── utils/           # Utilitaires
│   └── __tests__/       # Tests
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## 🚢 Déploiement

### GitHub Actions

Un workflow GitHub Actions est configuré pour :
- Exécuter les tests
- Linter le code
- Builder l'image Docker

### Déploiement Production

1. Configurez les variables d'environnement sur votre serveur
2. Build l'image Docker : `docker build -t patisserie-backend .`
3. Déployez avec docker-compose ou Kubernetes
4. Configurez un reverse proxy (nginx) pour HTTPS
5. Configurez les backups automatiques

## 📧 Configuration Email

### SMTP (Gmail exemple)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### SendGrid (Alternative)

```env
USE_SENDGRID=true
SENDGRID_API_KEY=your-api-key
```

## 💳 Configuration PayPal

1. Créez une application sur [PayPal Developer](https://developer.paypal.com)
2. Récupérez le Client ID et Secret
3. Configurez dans `.env` :
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_SECRET`
   - `PAYPAL_MODE=sandbox` (ou `live` en production)

## 🐛 Dépannage

### Erreur de connexion à la base de données

Vérifiez que MySQL est démarré et que les credentials dans `.env` sont corrects.

### Erreur Redis

Redis est optionnel. Si non disponible, le rate limiting utilise un fallback en mémoire.

### Erreur d'envoi d'email

Vérifiez la configuration SMTP ou SendGrid. Les erreurs d'email n'interrompent pas l'application.

## 📄 Licence

MIT

## 👥 Support

Pour toute question ou problème, ouvrez une issue sur le repository.

