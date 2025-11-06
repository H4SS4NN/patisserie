# 🐳 Déploiement avec Docker Compose sur OVH

Guide simplifié pour déployer votre application avec Docker Compose.

## 📋 Prérequis

- Serveur OVH avec Ubuntu 25.04
- Accès SSH au serveur
- Domaine configuré (optionnel pour commencer)

## 🚀 Installation Rapide (5 minutes)

### Étape 1 : Installer Docker et Docker Compose

Connectez-vous à votre serveur et exécutez :

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker ubuntu

# Installer Docker Compose
sudo apt install -y docker-compose-plugin

# Vérifier l'installation
docker --version
docker compose version

# Redémarrer la session (déconnexion/reconnexion) pour que les changements de groupe prennent effet
```

### Étape 2 : Transférer vos fichiers

Depuis votre machine Windows, transférez les fichiers du projet :

**Option A : Avec Git (recommandé)**
```bash
# Sur le serveur
cd ~
git clone https://github.com/votre-username/votre-repo.git patisserie
cd patisserie
```

**Option B : Avec WinSCP ou FileZilla**
1. Téléchargez WinSCP : https://winscp.net/
2. Connectez-vous avec :
   - Host : `37.59.112.208`
   - Username : `ubuntu`
   - Password : votre mot de passe
3. Transférez tout le dossier `repas` vers `/home/ubuntu/patisserie`

**Option C : Avec SCP depuis PowerShell**
```powershell
# Depuis votre machine Windows (dans le dossier repas)
scp -r . ubuntu@37.59.112.208:~/patisserie
```

### Étape 3 : Configurer les variables d'environnement

```bash
cd ~/patisserie

# Créer le fichier .env
cp env.example .env
nano .env
```

Configurez votre `.env` avec ces valeurs importantes :

```env
# Production
NODE_ENV=production

# Base de données (Docker gère automatiquement)
DB_HOST=db
DB_PORT=3306
DB_USERNAME=patisserie_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE
DB_DATABASE=patisserie_db
DB_ROOT_PASSWORD=VOTRE_MOT_DE_PASSE_ROOT_SECURISE

# JWT (Générez des secrets forts !)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_EXPIRES_IN=7d

# URLs (remplacez par votre domaine)
APP_URL=https://api.votre-domaine.com
FRONTEND_URL=https://votre-domaine.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-domaine.com

# PayPal
PAYPAL_CLIENT_ID=votre-client-id
PAYPAL_SECRET=votre-secret
PAYPAL_MODE=live

# Admin
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=CHANGEZ_MOI_EN_PRODUCTION
```

**Pour générer des secrets JWT forts :**
```bash
openssl rand -base64 32
```

### Étape 4 : Lancer l'application avec Docker Compose

```bash
cd ~/patisserie

# Lancer tous les services
docker compose -f docker-compose.prod.yml up -d --build

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f

# Vérifier que tout fonctionne
docker compose -f docker-compose.prod.yml ps
```

### Étape 5 : Vérifier que tout fonctionne

```bash
# Vérifier les conteneurs
docker ps

# Vérifier les logs du backend
docker logs patisserie-backend

# Vérifier les logs du frontend
docker logs patisserie-frontend

# Tester l'API (depuis le serveur)
curl http://localhost:3000/api/products
```

## 🌐 Configuration Nginx (pour exposer sur Internet)

### Installer Nginx

```bash
sudo apt install -y nginx
```

### Créer la configuration

```bash
sudo nano /etc/nginx/sites-available/patisserie
```

Collez cette configuration (remplacez `votre-domaine.com` par votre domaine) :

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com api.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

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

# API Backend
server {
    listen 443 ssl http2;
    server_name api.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/api.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.votre-domaine.com/privkey.pem;

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

### Activer la configuration

```bash
sudo ln -s /etc/nginx/sites-available/patisserie /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Installer SSL avec Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
sudo certbot --nginx -d api.votre-domaine.com
```

## 🔄 Commandes Utiles

### Voir les logs
```bash
# Tous les services
docker compose -f docker-compose.prod.yml logs -f

# Un service spécifique
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Redémarrer les services
```bash
# Tout redémarrer
docker compose -f docker-compose.prod.yml restart

# Un service spécifique
docker compose -f docker-compose.prod.yml restart backend
```

### Arrêter/Démarrer
```bash
# Arrêter
docker compose -f docker-compose.prod.yml stop

# Démarrer
docker compose -f docker-compose.prod.yml start

# Arrêter et supprimer les conteneurs
docker compose -f docker-compose.prod.yml down

# Arrêter et supprimer tout (y compris les volumes - ATTENTION !)
docker compose -f docker-compose.prod.yml down -v
```

### Mettre à jour l'application
```bash
cd ~/patisserie

# Récupérer les dernières modifications
git pull  # ou transférer les nouveaux fichiers

# Rebuild et redémarrer
docker compose -f docker-compose.prod.yml up -d --build

# Exécuter les migrations si nécessaire
docker compose -f docker-compose.prod.yml exec backend npm run migrate
```

### Accéder à la base de données
```bash
# Se connecter à MySQL
docker compose -f docker-compose.prod.yml exec db mysql -u patisserie_user -p patisserie_db

# Backup de la base de données
docker compose -f docker-compose.prod.yml exec db mysqldump -u patisserie_user -p patisserie_db > backup.sql

# Restaurer un backup
docker compose -f docker-compose.prod.yml exec -T db mysql -u patisserie_user -p patisserie_db < backup.sql
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas
```bash
# Vérifier les logs
docker compose -f docker-compose.prod.yml logs

# Vérifier l'état
docker compose -f docker-compose.prod.yml ps

# Vérifier les erreurs de build
docker compose -f docker-compose.prod.yml build --no-cache
```

### Problème de permissions
```bash
# Vérifier que vous êtes dans le groupe docker
groups

# Si pas dans le groupe, déconnectez-vous et reconnectez-vous
exit
# Puis reconnectez-vous via SSH
```

### Réinitialiser tout
```bash
# ATTENTION : Cela supprime toutes les données !
docker compose -f docker-compose.prod.yml down -v
docker system prune -a
# Puis relancez depuis l'étape 4
```

## ✅ Checklist de Déploiement

- [ ] Docker et Docker Compose installés
- [ ] Fichiers transférés sur le serveur
- [ ] Fichier `.env` configuré avec les bonnes valeurs
- [ ] Services Docker démarrés (`docker compose ps`)
- [ ] Backend accessible sur `http://localhost:3000`
- [ ] Frontend accessible sur `http://localhost:3001`
- [ ] Nginx configuré et démarré
- [ ] SSL/HTTPS configuré avec Let's Encrypt
- [ ] Domaine pointant vers le serveur
- [ ] Application accessible depuis Internet

## 🎉 C'est prêt !

Votre application devrait maintenant être accessible sur `https://votre-domaine.com` !

