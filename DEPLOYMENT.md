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

## Procedure de Deploiement (sans domaine)

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

**Modifier le mot de passe PostgreSQL:**

```env
POSTGRES_PASSWORD=VotreMotDePasseSecurise123!
DATABASE_URL="postgresql://mom_user:VotreMotDePasseSecurise123!@db:5432/mom_db"
```

### Etape 4: Demarrer les services

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Etape 5: Verifier le deploiement

```bash
# Verifier les conteneurs
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Tester l'acces
curl -I http://164.68.112.108
```

Le site est accessible sur **http://164.68.112.108**

---

## Commandes utiles

```bash
# Voir les logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Redemarrer
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart

# Arreter
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Mise a jour
git pull && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## Plus tard: Ajouter le domaine et SSL

Quand le domaine `mom.transparency.mg` sera achete:

1. Configurer le DNS (A record vers 164.68.112.108)
2. Modifier `.env`:
   ```env
   NUXT_PUBLIC_API_BASE_URL="https://mom.transparency.mg/api"
   NUXT_PUBLIC_SITE_URL="https://mom.transparency.mg"
   ```
3. Remplacer `docker/nginx/conf.d/app.conf` par `app-ssl.conf.template`
4. Ajouter Certbot au docker-compose
5. Obtenir les certificats SSL

*(Documentation complete disponible dans `docker/nginx/conf.d/app-ssl.conf.template`)*
