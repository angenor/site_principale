#!/bin/bash
# ============================================
# Script d'initialisation SSL pour miningobs.mg
# ============================================

set -e

DOMAIN="miningobs.mg"
EMAIL="admin@miningobs.mg"  # Changer par votre email

echo "=== Initialisation SSL pour $DOMAIN ==="

# Verifier que le DNS pointe vers ce serveur
echo "1. Verification du DNS..."
RESOLVED_IP=$(dig +short $DOMAIN | head -1)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$RESOLVED_IP" != "$SERVER_IP" ]; then
    echo "ATTENTION: Le DNS de $DOMAIN pointe vers $RESOLVED_IP"
    echo "L'IP de ce serveur est $SERVER_IP"
    echo "Assurez-vous que le DNS est correctement configure."
    read -p "Continuer quand meme? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Arreter les services
echo "2. Arret des services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Utiliser la config temporaire pour HTTP
echo "3. Configuration Nginx temporaire (HTTP only)..."
cp docker/nginx/conf.d/app.conf docker/nginx/conf.d/app.conf.backup
cp docker/nginx/conf.d/app-init-ssl.conf docker/nginx/conf.d/app.conf

# Demarrer nginx et app uniquement
echo "4. Demarrage des services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx app db

# Attendre que nginx soit pret
echo "5. Attente du demarrage de Nginx..."
sleep 10

# Obtenir le certificat
echo "6. Obtention du certificat SSL..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Restaurer la config SSL complete
echo "7. Restauration de la config Nginx avec SSL..."
cp docker/nginx/conf.d/app.conf.backup docker/nginx/conf.d/app.conf
rm docker/nginx/conf.d/app.conf.backup

# Redemarrer avec SSL
echo "8. Redemarrage avec SSL..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo ""
echo "=== SSL Configure avec succes! ==="
echo "Site accessible sur: https://$DOMAIN"
echo ""
echo "Le renouvellement automatique est configure via certbot."
