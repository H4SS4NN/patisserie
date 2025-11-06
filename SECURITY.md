# Sécurité

Ce document décrit les mesures de sécurité implémentées dans le backend de gestion de commandes pâtisserie.

## 🔐 Authentification et Autorisation

### JWT (JSON Web Tokens)
- Tokens avec expiration courte (1h par défaut)
- Secret stocké dans les variables d'environnement
- Validation stricte des tokens sur toutes les routes admin

### Mots de passe
- Hashage avec bcrypt (salt rounds: 12)
- Minimum 6 caractères requis
- Validation côté serveur

### 2FA (Two-Factor Authentication)
- Implémentation TOTP optionnelle avec speakeasy
- QR code généré pour l'activation
- Validation avec fenêtre de tolérance de 2 périodes

## 🛡️ Protection des Données

### Validation des Entrées
- **express-validator** : Validation stricte de tous les inputs
- Sanitization automatique des données
- Rejet des requêtes malformées

### Injection SQL
- **TypeORM** : Protection contre les injections SQL via paramètres préparés
- Pas de requêtes SQL brutes avec concaténation de strings

### XSS (Cross-Site Scripting)
- Échappement automatique des données dans les templates
- Headers de sécurité HTTP via Helmet

## 🚦 Rate Limiting

### Protection contre les attaques
- **Auth routes** : 5 tentatives par 15 minutes
- **Order creation** : 10 commandes par minute
- Implémentation avec Redis (fallback en mémoire si Redis indisponible)

### IP-based limiting
- Limitation basée sur l'adresse IP
- Headers de réponse avec limites restantes

## 🌐 CORS et Headers de Sécurité

### CORS
- Configuration stricte avec origine autorisée
- Pas de credentials automatiques sur les requêtes cross-origin

### Helmet
- Headers de sécurité HTTP automatiques
- Protection contre les attaques courantes (XSS, clickjacking, etc.)

## 📝 Logs et Audit

### Logs d'audit
- Toutes les modifications de commandes sont tracées
- Historique des changements de statut et paiement
- Association avec l'admin qui a effectué l'action

### Logs applicatifs
- Logs d'erreur pour le débogage
- Pas de logs de mots de passe ou tokens sensibles

## 💳 Paiements

### PayPal
- Validation côté serveur de tous les paiements
- Webhooks sécurisés pour confirmer les paiements
- Stockage sécurisé des IDs de paiement

### CASH
- Statut de paiement modifiable uniquement par admin authentifié
- Traçabilité des changements

## 🔒 Variables d'Environnement

### Secrets
- Tous les secrets stockés dans `.env` (jamais commités)
- `.env.example` fourni sans valeurs sensibles
- Recommandation : utiliser un gestionnaire de secrets en production (AWS Secrets Manager, HashiCorp Vault, etc.)

### Production
- **NE JAMAIS** utiliser les valeurs par défaut en production
- Changer `JWT_SECRET` et tous les autres secrets
- Utiliser HTTPS (terminaison SSL/TLS via reverse proxy)

## 🚨 Bonnes Pratiques

### Développement
1. Ne jamais commit de secrets dans le code
2. Utiliser `.gitignore` pour exclure `.env`
3. Valider toutes les entrées utilisateur
4. Tester les cas limites et erreurs

### Production
1. **HTTPS obligatoire** : Toutes les communications doivent être chiffrées
2. **Backups réguliers** : Sauvegarder la base de données quotidiennement
3. **Monitoring** : Surveiller les logs et mettre en place des alertes
4. **Mises à jour** : Maintenir les dépendances à jour
5. **2FA activé** : Recommandé pour tous les comptes admin

## ⚠️ Vulnérabilités Connues

### Limitations actuelles
- Pas de protection CSRF pour les endpoints admin (à ajouter si nécessaire)
- Rate limiting basique (peut être amélioré avec des règles plus fines)
- Pas de rotation automatique des secrets JWT

### Améliorations Futures
- Implémenter CSRF tokens
- Ajouter un système de blacklist pour les tokens révoqués
- Mettre en place un système de rotation des secrets
- Ajouter des logs de sécurité plus détaillés

## 📞 Signalement de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité, veuillez :
1. Ne pas ouvrir d'issue publique
2. Contacter directement l'équipe de développement
3. Fournir autant de détails que possible
4. Attendre une confirmation avant de divulguer publiquement

## 🔄 Mises à jour de Sécurité

- Surveiller les dépendances avec `npm audit`
- Mettre à jour régulièrement les packages
- Suivre les CVE (Common Vulnerabilities and Exposures)

## 📚 Références

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

