#!/bin/bash
# ============================================
# Update Script - Observatoire des Mines de Madagascar
# Run this script to pull latest changes and rebuild
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/opt/mom"
cd $APP_DIR

echo -e "${GREEN}>>> Updating MOM Application...${NC}"

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes from GitHub...${NC}"
git pull origin main

# Rebuild and restart
echo -e "${YELLOW}Rebuilding containers...${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Show status
echo -e "${GREEN}>>> Update complete!${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
