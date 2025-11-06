# Exemples de Requêtes API

Ce document contient des exemples de payloads pour les principales routes de l'API.

## 📦 Créer une Commande (CASH)

### Request

```bash
POST /orders
Content-Type: application/json
```

```json
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
        "taille": "6 parts",
        "deco": "standard"
      },
      "price": 4500
    }
  ],
  "pickup_or_delivery_date": "2025-12-24T10:00:00+01:00",
  "payment_method": "CASH",
  "notes": "Message sur le gâteau : Joyeux Noël"
}
```

### Response

```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "numero_commande": "PAT-20251104-0001",
    "total_price": 4500,
    "payment_method": "CASH",
    "payment_status": "PENDING",
    "status": "PENDING"
  },
  "payment": null
}
```

## 💳 Créer une Commande (PAYPAL)

### Request

```bash
POST /orders
Content-Type: application/json
```

```json
{
  "client_name": "Sami Dupont",
  "client_phone": "+33612345678",
  "client_email": "sami@example.com",
  "items": [
    {
      "product_id": "uuid-du-produit",
      "name": "Fraisier 6 parts",
      "qty": 2,
      "options": {
        "taille": "6 parts"
      },
      "price": 4500
    },
    {
      "product_id": "autre-uuid",
      "name": "Tarte aux pommes",
      "qty": 1,
      "options": {},
      "price": 2800
    }
  ],
  "pickup_or_delivery_date": "2025-12-24T10:00:00+01:00",
  "payment_method": "PAYPAL",
  "notes": "Livraison à l'adresse indiquée"
}
```

### Response

```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "numero_commande": "PAT-20251104-0002",
    "total_price": 11800,
    "payment_method": "PAYPAL",
    "payment_status": "PENDING",
    "status": "PENDING"
  },
  "payment": {
    "paymentId": "PAY-1234567890ABCDEF",
    "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=EC-XXXXX"
  }
}
```

## 🔐 Connexion Admin

### Request

```bash
POST /auth/login
Content-Type: application/json
```

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Response (sans 2FA)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-uuid",
    "username": "admin",
    "role": "SUPER_ADMIN",
    "twofa_enabled": false
  }
}
```

### Response (avec 2FA activé)

```json
{
  "success": true,
  "requires2FA": true,
  "userId": "admin-uuid"
}
```

Ensuite, utiliser `/auth/2fa/verify` :

```json
{
  "userId": "admin-uuid",
  "token": "123456"
}
```

## 📋 Lister les Commandes (Admin)

### Request

```bash
GET /admin/orders?status=PENDING&payment_status=PENDING
Authorization: Bearer <token>
```

### Response

```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "numero_commande": "PAT-20251104-0001",
      "client_name": "Sami Dupont",
      "client_phone": "+33612345678",
      "client_email": "sami@example.com",
      "items": [
        {
          "product_id": "uuid",
          "name": "Fraisier 6 parts",
          "qty": 1,
          "options": { "taille": "6 parts" },
          "price": 4500
        }
      ],
      "total_price": 4500,
      "payment_method": "CASH",
      "payment_status": "PENDING",
      "status": "PENDING",
      "pickup_or_delivery_date": "2025-12-24T10:00:00.000Z",
      "notes": "Message sur le gâteau : Joyeux Noël",
      "created_at": "2025-11-04T10:00:00.000Z",
      "updated_at": "2025-11-04T10:00:00.000Z"
    }
  ]
}
```

## 🔄 Modifier le Statut d'une Commande (Admin)

### Request

```bash
PATCH /admin/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "status": "CONFIRMED",
  "notes": "Commande confirmée, prête pour le 24/12"
}
```

### Response

```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CONFIRMED",
    "notes_admin": "Commande confirmée, prête pour le 24/12",
    ...
  }
}
```

## 💰 Modifier le Statut de Paiement (Admin)

### Request

```bash
PATCH /admin/orders/:id/payment
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "payment_status": "PAID",
  "paypal_payment_id": "PAY-123456789"
}
```

### Response

```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_status": "PAID",
    "paypal_payment_id": "PAY-123456789",
    ...
  }
}
```

## 📅 Obtenir le Planning (Admin)

### Request

```bash
GET /admin/calendar?date_from=2025-12-01&date_to=2025-12-31
Authorization: Bearer <token>
```

### Response

```json
{
  "calendar": {
    "2025-12-24": [
      {
        "id": "order-1",
        "numero_commande": "PAT-20251104-0001",
        "client_name": "Sami Dupont",
        "total_price": 4500,
        "status": "CONFIRMED",
        "pickup_or_delivery_date": "2025-12-24T10:00:00.000Z"
      },
      {
        "id": "order-2",
        "numero_commande": "PAT-20251104-0002",
        "client_name": "Marie Martin",
        "total_price": 3200,
        "status": "EN_PREPARATION",
        "pickup_or_delivery_date": "2025-12-24T14:00:00.000Z"
      }
    ],
    "2025-12-25": [...]
  }
}
```

## 📊 Obtenir les Statistiques (Admin)

### Request

```bash
GET /admin/stats
Authorization: Bearer <token>
```

### Response

```json
{
  "stats": {
    "totalOrders": 150,
    "todayOrders": 5,
    "totalRevenue": 450000,
    "todayRevenue": 15000,
    "ordersByStatus": {
      "PENDING": 10,
      "CONFIRMED": 25,
      "EN_PREPARATION": 15,
      "EN_CUISSON": 5,
      "PRETE": 8,
      "LIVREE": 85,
      "CANCELLED": 2
    }
  }
}
```

## 🍰 Créer un Produit (Admin)

### Request

```bash
POST /products/admin/products
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Fraisier 6 parts",
  "description": "Délicieux fraisier avec fraises fraîches",
  "price": 4500,
  "options": {
    "taille": "6 parts",
    "deco": "standard"
  },
  "image_url": "https://example.com/fraisier.jpg",
  "available": true
}
```

### Response

```json
{
  "success": true,
  "product": {
    "id": "product-uuid",
    "name": "Fraisier 6 parts",
    "description": "Délicieux fraisier avec fraises fraîches",
    "price": 4500,
    "options": {
      "taille": "6 parts",
      "deco": "standard"
    },
    "image_url": "https://example.com/fraisier.jpg",
    "available": true,
    "created_at": "2025-11-04T10:00:00.000Z",
    "updated_at": "2025-11-04T10:00:00.000Z"
  }
}
```

## 🔔 Webhook PayPal

### Request (PayPal → Backend)

```bash
POST /webhooks/paypal
Content-Type: application/json
```

```json
{
  "event_type": "PAYMENT.SALE.COMPLETED",
  "resource": {
    "parent_payment": "PAY-123456789",
    "id": "9VG12345ABCDEF",
    "state": "completed",
    "amount": {
      "total": "45.00",
      "currency": "EUR"
    }
  }
}
```

### Response

```json
{
  "success": true,
  "message": "Payment status updated"
}
```

## ❌ Exemples d'Erreurs

### Erreur de Validation

```json
{
  "errors": [
    {
      "msg": "Client name required",
      "param": "client_name",
      "location": "body"
    },
    {
      "msg": "Valid phone number required",
      "param": "client_phone",
      "location": "body"
    }
  ]
}
```

### Erreur d'Authentification

```json
{
  "error": "Access token required"
}
```

### Erreur de Produit Non Disponible

```json
{
  "error": "Product uuid-123 not found or not available"
}
```

### Rate Limit Exceeded

```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

