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



Email: admin@mom.mg
Mot de passe: Admin123!


rm -rf .nuxt .output node_modules/.cache
pnpm dev



Pour visualiser votre base de données PostgreSQL en ligne, voici plusieurs options :

1. Prisma Studio (Recommandé - déjà intégré)
L'équivalent de phpMyAdmin intégré à Prisma. En local :


pnpm prisma studio
Cela ouvre une interface web à http://localhost:5555 pour explorer vos données.

Pour la base en production, vous pouvez lancer Prisma Studio avec l'URL de production :


DATABASE_URL="votre_url_production" pnpm prisma studio
2. pgAdmin (Interface web complète)
L'équivalent direct de phpMyAdmin pour PostgreSQL. Sur votre VPS, vous pouvez l'ajouter via Docker :


# Dans docker-compose.prod.yml
pgadmin:
  image: dpage/pgadmin4
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@example.com
    PGADMIN_DEFAULT_PASSWORD: votre_mot_de_passe
  ports:
    - "5050:80"
  networks:
    - mom-network
Accessible ensuite sur http://164.68.112.108:5050

3. Connexion directe depuis votre Mac
Avec un client comme TablePlus (gratuit) ou DBeaver :

Créez un tunnel SSH vers le VPS
Connectez-vous à PostgreSQL via le tunnel

# Tunnel SSH
ssh -L 5432:localhost:5432 root@164.68.112.108
Puis connectez-vous avec votre client sur localhost:5432.



lsof -ti:3001,3002 | xargs kill -9
Explication :

lsof -ti:3001,3002 : liste les PIDs des processus utilisant les ports 3001 et 3002
xargs kill -9 : envoie le signal SIGKILL pour forcer l'arrêt de ces processus

rm -rf .nuxt .output node_modules/.cache


 ~/.agents/skills/agent-browser  │
│    symlink → Claude Code   