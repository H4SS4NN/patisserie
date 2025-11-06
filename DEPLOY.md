# Guide de Déploiement sur OVH

Ce guide vous explique comment déployer votre application sur un serveur OVH.

## 📋 Prérequis

- Serveur OVH avec accès SSH
- Node.js 20+ installé
- MySQL installé et configuré
- Nginx installé (pour le reverse proxy)
- PM2 installé (pour gérer les processus Node.js)
- Domaine configuré pointant vers votre serveur

## 🚀 Étapes de Déploiement

### 1. Préparation du Serveur

Connectez-vous à votre serveur OVH via SSH :

```bash
ssh root@votre-serveur-ovh.com
```

### 2. Installation des Dépendances Système

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installer MySQL
apt install -y mysql-server

# Installer Nginx
apt install -y nginx

# Installer PM2 globalement
npm install -g pm2

# Installer Git
apt install -y git
```

### 3. Configuration de la Base de Données MySQL

```bash
# Sécuriser MySQL
mysql_secure_installation

# Créer la base de données et l'utilisateur
mysql -u root -p << EOF
CREATE DATABASE patisserie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'patisserie_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON patisserie_db.* TO 'patisserie_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### 4. Cloner le Projet

```bash
# Créer le dossier de l'application
mkdir -p /var/www/patisserie
cd /var/www/patisserie

# Cloner votre repository (remplacez par votre URL Git)
git clone https://github.com/votre-username/votre-repo.git .

# OU transférer les fichiers via SCP depuis votre machine locale
# scp -r . root@votre-serveur:/var/www/patisserie/
```

### 5. Configuration du Backend

```bash
cd /var/www/patisserie

# Installer les dépendances
npm install

# Créer le fichier .env
cp env.example .env
nano .env
```

Configurez votre `.env` avec les valeurs de production :

```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=patisserie_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE
DB_DATABASE=patisserie_db

# JWT (Générez des secrets forts !)
JWT_SECRET=VOTRE_SECRET_JWT_TRES_SECURISE_256_BITS
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=VOTRE_REFRESH_SECRET_TRES_SECURISE
REFRESH_TOKEN_EXPIRES_IN=7d

# URLs de production
APP_URL=https://api.votre-domaine.com
FRONTEND_URL=https://votre-domaine.com

# Email (SMTP ou SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# PayPal (mode production)
PAYPAL_CLIENT_ID=votre-client-id-production
PAYPAL_SECRET=votre-secret-production
PAYPAL_MODE=live

# Admin par défaut (changez après le premier login !)
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=CHANGEZ_MOI_EN_PRODUCTION
```

### 6. Build et Migration du Backend

```bash
# Build du backend
npm run build

# Exécuter les migrations
npm run migrate

# Seed la base de données (optionnel)
npm run seed
```

### 7. Configuration PM2 pour le Backend

```bash
# Démarrer avec PM2
pm2 start dist/index.js --name patisserie-backend

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivez les instructions affichées
```

### 8. Configuration du Frontend

```bash
cd /var/www/patisserie/frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
nano .env.local
```

Contenu de `.env.local` :

```env
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

```bash
# Build du frontend
npm run build

# Démarrer avec PM2
pm2 start npm --name patisserie-frontend -- start

# Sauvegarder
pm2 save
```

### 9. Configuration Nginx

Créez le fichier de configuration Nginx :

```bash
nano /etc/nginx/sites-available/patisserie
```

Contenu :

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS pour le frontend
server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Configuration HTTPS pour l'API
server {
    listen 443 ssl http2;
    server_name api.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/api.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.votre-domaine.com/privkey.pem;

    # Backend API
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer la configuration :

```bash
# Créer le lien symbolique
ln -s /etc/nginx/sites-available/patisserie /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### 10. Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir les certificats SSL
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
certbot --nginx -d api.votre-domaine.com

# Renouvellement automatique (déjà configuré par défaut)
certbot renew --dry-run
```

### 11. Configuration du Firewall

```bash
# Autoriser les ports nécessaires
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### 12. Mise à Jour du Frontend pour la Production

Assurez-vous que `frontend/src/lib/api.ts` utilise la variable d'environnement :

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

## 🔄 Mises à Jour

Pour mettre à jour l'application :

```bash
cd /var/www/patisserie

# Backend
git pull
npm install
npm run build
pm2 restart patisserie-backend

# Frontend
cd frontend
git pull
npm install
npm run build
pm2 restart patisserie-frontend
```

## 📊 Monitoring

### Vérifier les logs

```bash
# Logs backend
pm2 logs patisserie-backend

# Logs frontend
pm2 logs patisserie-frontend

# Status PM2
pm2 status

# Monitoring en temps réel
pm2 monit
```

### Vérifier Nginx

```bash
# Logs Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Status Nginx
systemctl status nginx
```

## 🔒 Sécurité

### Checklist de Sécurité

- [ ] Changer tous les mots de passe par défaut
- [ ] Utiliser des secrets JWT forts (générez avec `openssl rand -base64 32`)
- [ ] Configurer le firewall (UFW)
- [ ] Activer SSL/HTTPS
- [ ] Configurer les backups automatiques MySQL
- [ ] Limiter les tentatives de connexion SSH
- [ ] Mettre à jour régulièrement le système

### Backups MySQL

Créez un script de backup automatique :

```bash
nano /usr/local/bin/backup-mysql.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u patisserie_user -p'VOTRE_MOT_DE_PASSE' patisserie_db > $BACKUP_DIR/backup_$DATE.sql
# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
chmod +x /usr/local/bin/backup-mysql.sh

# Ajouter au crontab (backup quotidien à 2h du matin)
crontab -e
# Ajouter : 0 2 * * * /usr/local/bin/backup-mysql.sh
```

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
pm2 logs patisserie-backend

# Vérifier la connexion à la base de données
npm run check-db

# Vérifier les variables d'environnement
pm2 env patisserie-backend
```

### Le frontend ne se charge pas

```bash
# Vérifier que le frontend tourne
pm2 status

# Vérifier les logs
pm2 logs patisserie-frontend

# Vérifier Nginx
nginx -t
systemctl status nginx
```

### Erreurs SSL

```bash
# Renouveler les certificats
certbot renew

# Vérifier les certificats
certbot certificates
```

## 📞 Support

En cas de problème, vérifiez :
1. Les logs PM2 : `pm2 logs`
2. Les logs Nginx : `/var/log/nginx/error.log`
3. Les logs MySQL : `/var/log/mysql/error.log`
4. Le statut des services : `systemctl status nginx mysql`

