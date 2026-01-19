# Configuration VPS Contabo pour miningobs.mg

## Informations de base

| Élément | Valeur |
|---------|--------|
| Domaine | miningobs.mg |
| IP VPS Contabo | 164.68.112.108 |

---

## 1. Configuration du serveur web (Nginx/Apache)

### Option A : Nginx (recommandé pour Docker)

Créer le fichier `/etc/nginx/sites-available/miningobs.mg` :
```nginx
server {
    listen 80;
    server_name miningobs.mg www.miningobs.mg;

    location / {
        proxy_pass http://localhost:PORT_DE_VOTRE_CONTAINER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer le site :
```bash
sudo ln -s /etc/nginx/sites-available/miningobs.mg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B : Traefik (si vous utilisez Docker Compose)

Ajouter les labels dans votre `docker-compose.yml` :
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.miningobs.rule=Host(`miningobs.mg`) || Host(`www.miningobs.mg`)"
  - "traefik.http.routers.miningobs.entrypoints=websecure"
  - "traefik.http.routers.miningobs.tls.certresolver=letsencrypt"
```

---

## 2. Configuration SSL/HTTPS avec Let's Encrypt

### Installation de Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Génération du certificat SSL
```bash
sudo certbot --nginx -d miningobs.mg -d www.miningobs.mg
```

### Renouvellement automatique (vérifier)
```bash
sudo certbot renew --dry-run
```

---

## 3. Configuration du Firewall (UFW)
```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier le statut
sudo ufw status
```

---

## 4. Configuration Docker

### Vérifier que votre container écoute correctement
```bash
# Lister les containers
docker ps

# Vérifier les ports exposés
docker port NOM_DU_CONTAINER
```

### Exemple de docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    image: votre-image
    container_name: miningobs-app
    ports:
      - "3000:3000"  # Adapter selon votre application
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DOMAIN=miningobs.mg
```

---

## 5. Configuration DNS locale (optionnel)

Ajouter dans `/etc/hosts` sur le VPS :
```
127.0.0.1 miningobs.mg
127.0.0.1 www.miningobs.mg
```

---

## 6. Vérifications post-configuration

### Tester la résolution DNS
```bash
# Depuis le VPS
dig miningobs.mg
nslookup miningobs.mg

# Vérifier que l'IP pointe vers votre VPS
dig +short miningobs.mg
# Doit retourner : 164.68.112.108
```

### Tester l'accès HTTP
```bash
curl -I http://miningobs.mg
curl -I https://miningobs.mg
```

### Vérifier les logs
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs Docker
docker logs -f NOM_DU_CONTAINER
```

---

## 7. Enregistrements DNS actuels (DirectAdmin)

| Type | Nom | TTL | Valeur | Statut |
|------|-----|-----|--------|--------|
| A | miningobs.mg | 3600 | 164.68.112.108 | ✅ Modifié |
| A | www | 3600 | 164.68.112.108 | ✅ Modifié |
| A | ftp | 3600 | 5.101.142.84 | ⚠️ Ancienne IP |
| A | mail | 3600 | 5.101.142.84 | ⚠️ Ancienne IP |
| A | pop | 3600 | 5.101.142.84 | ⚠️ Ancienne IP |
| A | smtp | 3600 | 5.101.142.84 | ⚠️ Ancienne IP |
| NS | miningobs.mg | - | ns1.da.dnshostnetwork.com | ✅ OK |
| NS | miningobs.mg | - | ns2.da.dnshostnetwork.com | ✅ OK |
| MX | miningobs.mg | 3600 | 10 mail.miningobs.mg | ⚠️ Pointe vers ancienne IP |
| T