#!/bin/bash
# ============================================
# Deployment Script - Observatoire des Mines de Madagascar
# Server: Contabo VPS (164.68.112.108)
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/mom"
DOMAIN="mom.transparency.mg"
EMAIL="admin@transparency.mg"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  MOM Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to print step
step() {
    echo -e "\n${YELLOW}>>> $1${NC}"
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root (sudo ./deploy.sh)"
fi

# Step 1: Update system
step "Updating system packages..."
apt update && apt upgrade -y
success "System updated"

# Step 2: Install dependencies
step "Installing required packages..."
apt install -y git curl
success "Dependencies installed"

# Step 3: Create application directory
step "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR
success "Directory created: $APP_DIR"

# Step 4: Clone or update repository
step "Setting up repository..."
if [ -d ".git" ]; then
    echo "Repository exists, pulling latest changes..."
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/angenor/site_principale.git .
fi
success "Repository ready"

# Step 5: Setup environment file
step "Setting up environment..."
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo -e "${YELLOW}! Please edit .env file with secure passwords${NC}"
        echo -e "${YELLOW}  Run: nano $APP_DIR/.env${NC}"
    else
        error ".env.production file not found"
    fi
else
    success "Environment file exists"
fi

# Step 6: Create Docker directories
step "Creating Docker directories..."
mkdir -p docker/certbot/www docker/certbot/conf docker/init-db
success "Docker directories created"

# Step 7: Initial deployment (without SSL)
step "Starting initial deployment without SSL..."

# Backup and use init config for first run
if [ -f "docker/nginx/conf.d/app.conf" ]; then
    cp docker/nginx/conf.d/app.conf docker/nginx/conf.d/app.conf.ssl
    cp docker/nginx/conf.d/app-init.conf.template docker/nginx/conf.d/app.conf
fi

# Start services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
success "Services started"

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Step 8: Obtain SSL certificates
step "Obtaining SSL certificates..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

success "SSL certificates obtained"

# Step 9: Restore SSL nginx config
step "Enabling SSL configuration..."
if [ -f "docker/nginx/conf.d/app.conf.ssl" ]; then
    cp docker/nginx/conf.d/app.conf.ssl docker/nginx/conf.d/app.conf
fi

# Restart nginx with SSL config
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
success "SSL enabled"

# Step 10: Verify deployment
step "Verifying deployment..."
sleep 10
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
    success "Site is accessible at https://$DOMAIN"
else
    echo -e "${YELLOW}! Site may need a moment to start. Check with: docker compose logs${NC}"
fi

# Print status
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:     docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo "  Restart:       docker compose -f docker-compose.yml -f docker-compose.prod.yml restart"
echo "  Stop:          docker compose -f docker-compose.yml -f docker-compose.prod.yml down"
echo "  Update:        git pull && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
echo ""
echo "Site URL: https://$DOMAIN"
