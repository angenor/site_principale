# Deploiement - Observatoire des Mines de Madagascar

## Serveur Contabo

| Caracteristique | Valeur |
|-----------------|--------|
| IP | `164.68.112.108` |
| Domaine | `miningobs.mg` |
| OS | Ubuntu Linux |
| Plan | Cloud VPS 10 SSD |
| Stockage | 150 GB |
| RAM | 8 GB |
| Docker | Pre-installe |

**URL d'acces:** https://miningobs.mg

---

## Deploiement Initial (Nouveau serveur)

### 1. Connexion SSH

```bash
ssh root@164.68.112.108
```

### 2. Cloner le projet

```bash
mkdir -p /opt/mom
cd /opt/mom
git clone https://github.com/angenor/site_principale.git .
```

### 3. Configurer l'environnement

```bash
cp .env.production .env
nano .env
```

Modifier le mot de passe PostgreSQL:

```env
POSTGRES_PASSWORD=VotreMotDePasseSecurise123!
DATABASE_URL="postgresql://mom_user:VotreMotDePasseSecurise123!@db:5432/mom_db"
```

### 4. Initialiser SSL et demarrer

```bash
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh
```

Ou manuellement (etape par etape):

```bash
# Utiliser d'abord la config HTTP temporaire
cp docker/nginx/conf.d/app-init-ssl.conf docker/nginx/conf.d/app.conf

# Demarrer les services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Obtenir le certificat SSL
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@miningobs.mg \
    --agree-tos \
    --no-eff-email \
    -d miningobs.mg \
    -d www.miningobs.mg

# Restaurer la config SSL complete
git checkout docker/nginx/conf.d/app.conf

# Redemarrer avec SSL
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 5. Creer les tables de la base de donnees

```bash
source .env
docker run --rm --network mom_mom-network \
  -e DATABASE_URL="$DATABASE_URL" \
  -v $(pwd)/prisma:/app/prisma \
  -w /app \
  node:22-alpine sh -c "npm install prisma@6 @prisma/client@6 && npx prisma db push --schema=/app/prisma/schema.prisma"
```

### 6. Creer l'utilisateur admin

```bash
docker run --rm --network mom_mom-network \
  -e DATABASE_URL="$DATABASE_URL" \
  -v $(pwd)/prisma:/app/prisma \
  -v $(pwd)/scripts:/app/scripts \
  -w /app \
  node:22-alpine sh -c "npm install prisma@6 @prisma/client@6 bcryptjs tsx && npx prisma generate --schema=/app/prisma/schema.prisma && npx tsx scripts/create-admin.ts"
```

Identifiants par defaut:
- Email: `admin@mom.mg`
- Mot de passe: `Admin123!`

### 7. Verifier

```bash
docker ps
docker logs mom-app --tail 50
curl -I https://miningobs.mg
```

---

## Mise a jour du site

```bash
cd /opt/mom
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Commandes utiles

```bash
# Voir les logs en temps reel
docker logs mom-app -f

# Logs de tous les services
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Redemarrer un service
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart app

# Arreter tous les services
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Verifier l'etat des containers
docker ps

# Entrer dans le container app
docker exec -it mom-app sh

# Entrer dans la base de donnees
docker exec -it mom-db psql -U mom_user -d mom_db

# Renouveler manuellement le certificat SSL
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot renew
```

---

## Configuration des services

| Service | Container | Port interne | Port externe |
|---------|-----------|--------------|--------------|
| Nginx | mom-nginx | 80, 443 | 80, 443 |
| Nuxt App | mom-app | 3000 | - |
| PostgreSQL | mom-db | 5432 | - |
| Certbot | mom-certbot | - | - |

---

## Configuration effectuee

### Fichiers Docker

| Fichier | Description |
|---------|-------------|
| `Dockerfile` | Build multi-stage Node 22 Alpine |
| `docker-compose.yml` | Configuration de base des services |
| `docker-compose.prod.yml` | Override production (Nginx, SSL, Certbot) |
| `docker/nginx/nginx.conf` | Configuration principale Nginx |
| `docker/nginx/conf.d/app.conf` | Reverse proxy avec SSL |
| `docker/nginx/conf.d/app-init-ssl.conf` | Config temporaire pour init SSL |
| `.env.production` | Template des variables d'environnement |

### Prisma (prisma/schema.prisma)

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

- `binaryTargets`: Inclut le binaire pour Linux Alpine (Docker)
- Output par defaut (`node_modules/.prisma/client`) pour compatibilite ESM

### Nuxt (nuxt.config.ts)

```typescript
nitro: {
  compressPublicAssets: true,
  prerender: {
    crawlLinks: false,
    routes: []
  }
}
```

- Prerendering desactive car la DB n'est pas disponible pendant le build Docker

### Variables d'environnement (.env)

```env
# URLs publiques
NUXT_PUBLIC_API_BASE_URL="https://miningobs.mg/api"
NUXT_PUBLIC_SITE_URL="https://miningobs.mg"

# PostgreSQL
POSTGRES_USER=mom_user
POSTGRES_PASSWORD=<mot_de_passe_securise>
POSTGRES_DB=mom_db
DATABASE_URL="postgresql://mom_user:<mot_de_passe>@db:5432/mom_db"
```

---

## DNS Configuration

| Type | Nom | Valeur |
|------|-----|--------|
| A | miningobs.mg | 164.68.112.108 |
| A | www | 164.68.112.108 |

---

## Troubleshooting

### Erreur SSL "certificate not found"

Le certificat n'a pas encore ete genere. Utiliser la config HTTP temporaire puis generer le certificat:

```bash
cp docker/nginx/conf.d/app-init-ssl.conf docker/nginx/conf.d/app.conf
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
# ... generer le certificat ...
git checkout docker/nginx/conf.d/app.conf
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

### Erreur "tables do not exist"

Executer les migrations Prisma:

```bash
source .env
docker run --rm --network mom_mom-network \
  -e DATABASE_URL="$DATABASE_URL" \
  -v $(pwd)/prisma:/app/prisma \
  -w /app \
  node:22-alpine sh -c "npm install prisma@6 @prisma/client@6 && npx prisma db push --schema=/app/prisma/schema.prisma"
```

### Cookie secure flag error

Si l'authentification ne fonctionne pas, verifier que `NUXT_PUBLIC_SITE_URL` correspond au protocole utilise (http:// ou https://).
