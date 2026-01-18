installer amcharts5
https://freefrontend.com/css-border-animations/


# Installer via Homebrew
brew install cloudflared

# Puis lancer
cloudflared tunnel --url http://localhost:3000


connexion au serveur via ssh:


----deployement en production:
cd /opt/mom
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

