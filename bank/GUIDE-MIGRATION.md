# Guide de Migration et Deploiement

## Environnements

| Environnement | URL | Base de donnees |
|---------------|-----|-----------------|
| Local | http://localhost:3000 | localhost:5432 |
| Production | https://miningobs.mg | Docker mom-db |

---

## Developpement Local

### Demarrer l'environnement

```bash
# 1. Lancer la DB
docker compose up -d db

# 2. Verifier le .env
cat .env
# Doit contenir DATABASE_URL avec localhost:5432

# 3. Lancer le serveur de dev
pnpm dev
```

### Creer un admin local

```bash
pnpm tsx scripts/create-admin.ts
```

---

## Deploiement sur le VPS

### Cas 1 : Modifications Front-end uniquement

Changements CSS, composants Vue, pages, layouts, etc.

**Local :**
```bash
git add .
git commit -m "Description des changements"
git push origin main
```

**Sur le VPS :**
```bash
ssh root@164.68.112.108
cd /opt/mom
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

### Cas 2 : Modifications de la Base de Donnees

Changements dans `prisma/schema.prisma` (ajout/modification de tables, champs, relations).

**Local :**
```bash
# 1. Modifier prisma/schema.prisma

# 2. Appliquer les changements localement
pnpm prisma db push

# 3. Tester que tout fonctionne
pnpm dev

# 4. Commit et push
git add .
git commit -m "DB: description des changements"
git push origin main
```

**Sur le VPS :**
```bash
ssh root@164.68.112.108
cd /opt/mom
git pull origin main

# Rebuild et redemarrer l'app
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Appliquer les changements de schema a la DB de production
source .env
docker run --rm --network mom_mom-network \
  -e DATABASE_URL="$DATABASE_URL" \
  -v $(pwd)/prisma:/app/prisma \
  -w /app \
  node:22-alpine sh -c "npm install prisma@6 @prisma/client@6 && npx prisma db push --schema=/app/prisma/schema.prisma"
```

---

## Resume des Commandes

| Action | Commande VPS |
|--------|--------------|
| Pull les changements | `git pull origin main` |
| Rebuild l'app | `docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache` |
| Redemarrer | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |
| Migrer la DB | `docker run --rm --network mom_mom-network -e DATABASE_URL="$DATABASE_URL" -v $(pwd)/prisma:/app/prisma -w /app node:22-alpine sh -c "npm install prisma@6 @prisma/client@6 && npx prisma db push --schema=/app/prisma/schema.prisma"` |
| Voir les logs | `docker logs mom-app -f` |
| Arreter tout | `docker compose -f docker-compose.yml -f docker-compose.prod.yml down` |

---

## Notes Importantes

1. **Toujours tester en local** avant de deployer en production
2. **`prisma db push`** est non-destructif par defaut - Prisma demande confirmation si des donnees risquent d'etre perdues
3. **Sauvegarder la DB** avant les migrations majeures :
   ```bash
   docker exec mom-db pg_dump -U mom_user mom_db > backup_$(date +%Y%m%d).sql
   ```
4. **Ne jamais modifier** directement la DB de production sans passer par Prisma
