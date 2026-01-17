#!/bin/bash
# ============================================
# Deployment Script - Observatoire des Mines de Madagascar
# Server: Contabo VPS (164.68.112.108)
# Version: Sans SSL (IP uniquement)
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="/opt/mom"

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}  MOM Deployment Script${NC}"
echo -e "${GREEN}=======================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Erreur: Executer en tant que root (sudo ./deploy.sh)${NC}"
    exit 1
fi

# Step 1: Create directory and clone
echo -e "\n${YELLOW}>>> Etape 1: Preparation du repertoire${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

if [ -d ".git" ]; then
    echo "Mise a jour du repository..."
    git pull origin main
else
    echo "Clonage du repository..."
    git clone https://github.com/angenor/site_principale.git .
fi
echo -e "${GREEN}OK${NC}"

# Step 2: Setup environment
echo -e "\n${YELLOW}>>> Etape 2: Configuration environnement${NC}"
if [ ! -f ".env" ]; then
    cp .env.production .env
    echo -e "${YELLOW}IMPORTANT: Modifier .env avec un mot de passe securise${NC}"
    echo -e "${YELLOW}Executer: nano $APP_DIR/.env${NC}"
    exit 0
fi
echo -e "${GREEN}OK${NC}"

# Step 3: Start services
echo -e "\n${YELLOW}>>> Etape 3: Demarrage des services${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
echo -e "${GREEN}OK${NC}"

# Step 4: Wait and verify
echo -e "\n${YELLOW}>>> Etape 4: Verification${NC}"
sleep 15
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

echo -e "\n${GREEN}=======================================${NC}"
echo -e "${GREEN}  Deploiement termine!${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo "Site accessible sur: http://164.68.112.108"
echo ""
echo "Commandes utiles:"
echo "  Logs:    docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo "  Restart: docker compose -f docker-compose.yml -f docker-compose.prod.yml restart"
