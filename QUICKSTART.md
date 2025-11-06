# Guide de Démarrage Rapide

Ce guide vous permet de démarrer le backend en quelques minutes.

## 🚀 Démarrage avec Docker (Recommandé)

### 1. Préparer l'environnement

```bash
# Copier le fichier d'environnement
cp env.example .env

# Modifier .env avec vos configurations (optionnel pour le développement)
```

### 2. Lancer les services

```bash
docker-compose up --build
```

Cette commande va :
- ✅ Construire l'image Docker de l'application
- ✅ Démarrer MySQL, Redis, et Adminer
- ✅ Démarrer l'application Node.js

### 3. Initialiser la base de données

Dans un nouveau terminal :

```bash
# Exécuter les migrations
docker-compose exec app npm run migrate

# Charger les données de test (produits + admin)
docker-compose exec app npm run seed
```

### 4. Accéder à l'application

- **API** : http://localhost:3000
- **Swagger Docs** : http://localhost:3000/docs
- **Adminer (DB)** : http://localhost:8080
  - Server: `db`
  - Username: `root`
  - Password: `rootpassword`
  - Database: `patisserie_db`

### 5. Tester l'API

**Connexion admin par défaut :**
- Username: `admin`
- Password: `admin123`

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Le token JWT sera dans la réponse
```

## 📝 Démarrage sans Docker

### Prérequis

- Node.js 20+
- MySQL 8.0+
- Redis (optionnel)

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer .env
cp env.example .env
# Modifier les variables selon votre configuration

# 3. Initialiser la base de données
npm run migrate
npm run seed

# 4. Démarrer l'application
npm run start:dev
```

## 🧪 Tests

```bash
# Tous les tests
npm test

# Tests avec couverture
npm test -- --coverage

# Tests en mode watch
npm run test:watch
```

## 📚 Documentation API

Une fois l'application démarrée :

1. **Swagger UI** : http://localhost:3000/docs
2. **OpenAPI JSON** : http://localhost:3000/docs.json
3. **Collection Postman** : Importez `postman_collection.json`

## 🔍 Vérification

### Health Check

```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T10:00:00.000Z"
}
```

### Liste des produits

```bash
curl http://localhost:3000/products
```

### Créer une commande

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test User",
    "client_phone": "+33612345678",
    "client_email": "test@example.com",
    "items": [
      {
        "product_id": "uuid-du-produit",
        "name": "Fraisier 6 parts",
        "qty": 1,
        "price": 4500
      }
    ],
    "pickup_or_delivery_date": "2025-12-24T10:00:00+01:00",
    "payment_method": "CASH"
  }'
```

## 🐛 Problèmes Courants

### Erreur de connexion MySQL

- Vérifiez que MySQL est démarré
- Vérifiez les credentials dans `.env`
- Avec Docker : `docker-compose ps` pour voir les services

### Port déjà utilisé

Modifiez le port dans `.env` :
```
PORT=3001
```

### Redis non disponible

Redis est optionnel. Le rate limiting utilisera un fallback en mémoire si Redis n'est pas disponible.

## 📖 Prochaines Étapes

1. ✅ Lire le [README.md](README.md) pour plus de détails
2. ✅ Consulter [EXAMPLES.md](EXAMPLES.md) pour les exemples d'API
3. ✅ Lire [SECURITY.md](SECURITY.md) pour les bonnes pratiques de sécurité
4. ✅ Configurer les emails (SMTP ou SendGrid)
5. ✅ Configurer PayPal (sandbox ou production)

## 🔐 Changements Requis pour la Production

⚠️ **IMPORTANT** : Avant de déployer en production :

1. ✅ Changer `JWT_SECRET` (générer une clé sécurisée)
2. ✅ Changer les mots de passe par défaut
3. ✅ Configurer HTTPS (reverse proxy)
4. ✅ Activer 2FA pour tous les admins
5. ✅ Configurer les backups de la base de données
6. ✅ Mettre en place un monitoring

Bon développement ! 🎂

