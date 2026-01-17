# Deploiement - Observatoire des Mines de Madagascar

## Serveur Contabo

| Caracteristique | Valeur |
|-----------------|--------|
| IP | `164.68.112.108` |
| OS | Ubuntu Linux |
| Plan | Cloud VPS 10 SSD |
| Stockage | 150 GB |
| RAM | 8 GB |
| Docker | Pre-installe |

---

## Fichiers de configuration

| Fichier | Description |
|---------|-------------|
| `docker-compose.yml` | Configuration Docker de base |
| `docker-compose.prod.yml` | Override production (Nginx + SSL) |
| `docker/nginx/nginx.conf` | Configuration principale Nginx |
| `docker/nginx/conf.d/app.conf` | Configuration du site avec SSL |
| `docker/nginx/conf.d/app-init.conf.template` | Config initiale (avant SSL) |
| `.env.production` | Template des variables d'environnement |
| `scripts/deploy.sh` | Script de deploiement initial |
| `scripts/update.sh` | Script de mise a jour |

---

## Procedure de Deploiement

### Etape 1: Connexion SSH au serveur

```bash
ssh root@164.68.112.108
```

### Etape 2: Cloner le projet

```bash
mkdir -p /opt/mom
cd /opt/mom
git clone https://github.com/angenor/site_principale.git .
```

### Etape 3: Configurer l'environnement

```bash
cp .env.production .env
nano .env
```

**Modifier les valeurs sensibles dans `.env`:**

```env
# Generer un mot de passe securise (32+ caracteres)
POSTGRES_PASSWORD=VotreMotDePasseSecurise123!

# Mettre a jour DATABASE_URL avec le meme mot de passe
DATABASE_URL="postgresql://mom_user:VotreMotDePasseSecurise123!@db:5432/mom_db"

# Email pour Let's Encrypt
EMAIL=admin@transparency.mg
```

### Etape 4: Configurer le DNS

Avant de continuer, assurez-vous que le domaine pointe vers le serveur.

Ajouter ces enregistrements DNS chez votre registrar:

| Type | Nom | Valeur |
|------|-----|--------|
| A | mom.transparency.mg | 164.68.112.108 |
| A | www.mom.transparency.mg | 164.68.112.108 |

Verifier la propagation DNS:
```bash
dig mom.transparency.mg +short
# Doit retourner: 164.68.112.108
```

### Etape 5: Deploiement initial (sans SSL)

```bash
# Sauvegarder la config SSL et utiliser la config temporaire
cp docker/nginx/conf.d/app.conf docker/nginx/conf.d/app.conf.ssl
cp docker/nginx/conf.d/app-init.conf.template docker/nginx/conf.d/app.conf

# Demarrer les services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Attendre que les services demarrent (~2-3 minutes):
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

### Etape 6: Obtenir les certificats SSL

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@transparency.mg \
    --agree-tos \
    --no-eff-email \
    -d mom.transparency.mg \
    -d www.mom.transparency.mg
```

### Etape 7: Activer SSL

```bash
# Restaurer la configuration SSL
cp docker/nginx/conf.d/app.conf.ssl docker/nginx/conf.d/app.conf

# Redemarrer Nginx
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

### Etape 8: Verifier le deploiement

```bash
# Verifier que tous les conteneurs sont running
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Tester l'acces HTTPS
curl -I https://mom.transparency.mg
```

Le site est maintenant accessible sur **https://mom.transparency.mg**

---

## Commandes utiles

### Gestion des conteneurs

```bash
# Voir l'etat des conteneurs
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Voir les logs (tous les services)
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Voir les logs d'un service specifique
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f db

# Redemarrer tous les services
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart

# Redemarrer un service specifique
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart app

# Arreter tous les services
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Arreter et supprimer les volumes (ATTENTION: perte de donnees)
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
```

### Base de donnees

```bash
# Executer les migrations Prisma
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app pnpm prisma migrate deploy

# Acceder a la base de donnees
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec db psql -U mom_user -d mom_db

# Backup de la base de donnees
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec db pg_dump -U mom_user mom_db > backup_$(date +%Y%m%d).sql

# Restaurer un backup
cat backup_YYYYMMDD.sql | docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T db psql -U mom_user -d mom_db
```

### Certificats SSL

```bash
# Verifier l'expiration des certificats
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot certificates

# Renouveler manuellement (normalement automatique)
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot renew
```

---

## Mise a jour de l'application

### Methode 1: Script automatise

```bash
cd /opt/mom
./scripts/update.sh
```

### Methode 2: Manuelle

```bash
cd /opt/mom

# Recuperer les dernieres modifications
git pull origin main

# Reconstruire et redemarrer
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## Depannage

### Le site ne repond pas

```bash
# Verifier l'etat des conteneurs
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Verifier les logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100

# Redemarrer les services
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

### Erreur de certificat SSL

```bash
# Verifier que le domaine pointe vers le serveur
dig mom.transparency.mg +short

# Verifier les certificats
ls -la docker/certbot/conf/live/

# Renouveler les certificats
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot renew --force-renewal
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

### Probleme de base de donnees

```bash
# Verifier les logs de la base de donnees
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs db

# Verifier la connexion
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec db pg_isready -U mom_user -d mom_db
```

### Manque d'espace disque

```bash
# Verifier l'espace disque
df -h

# Nettoyer les images Docker inutilisees
docker system prune -a

# Nettoyer les volumes non utilises
docker volume prune
```

---

## Architecture de production

```
Internet
    │
    ▼
┌─────────────────────────────────────────┐
│  Nginx (mom-nginx)                      │
│  - Port 80 → Redirect HTTPS             │
│  - Port 443 → SSL/TLS                   │
│  - Reverse proxy                        │
│  - Gzip compression                     │
│  - Security headers                     │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Nuxt App (mom-app)                     │
│  - Port 3000 (interne)                  │
│  - SSR Nuxt 4                           │
│  - API routes                           │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  PostgreSQL (mom-db)                    │
│  - Port 5432 (interne)                  │
│  - Volume persistant                    │
└─────────────────────────────────────────┘
```

---

## Securite

- **Firewall**: Configurer UFW pour n'autoriser que les ports 22, 80, 443
- **SSH**: Desactiver l'authentification par mot de passe, utiliser des cles SSH
- **Mots de passe**: Utiliser des mots de passe forts (32+ caracteres)
- **Mises a jour**: Maintenir le systeme et Docker a jour

```bash
# Configurer UFW
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```
