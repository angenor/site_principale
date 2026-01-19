# Configuration du Domaine miningobs.mg avec SSL

## Résumé

| Élément | Valeur |
|---------|--------|
| Domaine | miningobs.mg |
| IP Serveur | 164.68.112.108 |
| SSL | Let's Encrypt (gratuit) |
| Validité certificat | 90 jours (renouvellement auto) |

---

## Prérequis

1. **DNS configuré** : Les enregistrements A doivent pointer vers le serveur
   ```
   miningobs.mg     → 164.68.112.108
   www.miningobs.mg → 164.68.112.108
   ```

2. **Vérifier la propagation DNS** :
   ```bash
   dig +short miningobs.mg
   # Doit retourner: 164.68.112.108
   ```

---

## Procédure Complète (Testée et Fonctionnelle)

### Étape 1 : Mettre à jour le code

```bash
cd /opt/mom
git pull origin main
```

### Étape 2 : Configurer les variables d'environnement

```bash
nano .env
```

Modifier les URLs :
```env
NUXT_PUBLIC_SITE_URL="https://miningobs.mg"
NUXT_PUBLIC_API_BASE_URL="https://miningobs.mg/api"
```

### Étape 3 : Préparer Nginx (config HTTP temporaire)

**IMPORTANT** : Nginx ne peut pas démarrer avec la config SSL tant que les certificats n'existent pas.

```bash
# Utiliser la config HTTP temporaire
cp docker/nginx/conf.d/app-init-ssl.conf docker/nginx/conf.d/app.conf
```

### Étape 4 : Démarrer les services

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Vérifier que tout fonctionne :
```bash
docker ps
# Tous les containers doivent être "Up" et non "Restarting"
```

### Étape 5 : Obtenir le certificat SSL (Mode Standalone)

```bash
# Arrêter nginx pour libérer le port 80
docker compose -f docker-compose.yml -f docker-compose.prod.yml stop nginx

# Obtenir le certificat
docker run --rm -p 80:80 \
  -v mom_certbot-conf:/etc/letsencrypt \
  -v mom_certbot-www:/var/www/certbot \
  certbot/certbot certonly \
    --standalone \
    --email admin@miningobs.mg \
    --agree-tos \
    --no-eff-email \
    -d miningobs.mg \
    -d www.miningobs.mg

# Redémarrer nginx
docker compose -f docker-compose.yml -f docker-compose.prod.yml start nginx
```

Résultat attendu :
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/miningobs.mg/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/miningobs.mg/privkey.pem
```

### Étape 6 : Activer la config SSL

```bash
# Restaurer la config SSL depuis git
git checkout docker/nginx/conf.d/app.conf

# Supprimer le fichier temporaire pour éviter les conflits
rm -f docker/nginx/conf.d/app-init-ssl.conf

# Redémarrer nginx
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

### Étape 7 : Vérifier

```bash
# Vérifier que nginx tourne
docker ps | grep nginx
# Doit être "Up" et "healthy", PAS "Restarting"

# Tester HTTPS
curl -I https://miningobs.mg
# Doit retourner HTTP 200
```

---

## Dépannage

### Erreur "duplicate upstream nuxt_app"

Nginx charge tous les fichiers `*.conf` dans `conf.d/`. S'il y a plusieurs fichiers définissant `upstream nuxt_app`, il y aura un conflit.

**Solution** :
```bash
# Voir les fichiers présents
ls docker/nginx/conf.d/

# Ne garder que app.conf
rm -f docker/nginx/conf.d/app-init-ssl.conf
rm -f docker/nginx/conf.d/*.template
rm -f docker/nginx/conf.d/*.backup

# Redémarrer
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

### Nginx en "Restarting" en boucle

Généralement causé par :
1. Certificats SSL manquants (config SSL sans certificats)
2. Conflit de configuration (duplicate upstream)

**Diagnostic** :
```bash
docker logs mom-nginx --tail 30
```

**Solution si certificats manquants** :
```bash
cp docker/nginx/conf.d/app-init-ssl.conf docker/nginx/conf.d/app.conf
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

### Certbot "No renewals were attempted"

Le mode webroot ne fonctionne pas bien avec notre setup Docker.

**Solution** : Utiliser le mode standalone (voir Étape 5)

---

## Renouvellement du Certificat

Le certificat expire tous les 90 jours. Pour renouveler manuellement :

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml stop nginx

docker run --rm -p 80:80 \
  -v mom_certbot-conf:/etc/letsencrypt \
  certbot/certbot renew

docker compose -f docker-compose.yml -f docker-compose.prod.yml start nginx
```

---

## Points Clés à Retenir

1. **Un seul fichier .conf** : Ne garder que `app.conf` dans `conf.d/`
2. **Mode Standalone pour Certbot** : Plus fiable que webroot avec Docker
3. **Config HTTP d'abord** : Démarrer sans SSL, obtenir le certificat, puis activer SSL
4. **Vérifier les logs** : `docker logs mom-nginx --tail 30` en cas de problème
