# Guide de Déploiement Rapide

Ce guide est un résumé rapide pour déployer le site sur Firebase Hosting.
Pour plus de détails, consultez [DEPLOY.md](DEPLOY.md).

## Informations du Projet

- **Project ID** : `collectivites-b3299`
- **Console Firebase** : [https://console.firebase.google.com/project/collectivites-b3299](https://console.firebase.google.com/project/collectivites-b3299)
- **URL du site (après déploiement)** : [https://collectivites-b3299.web.app](https://collectivites-b3299.web.app)
- **URL alternative** : [https://collectivites-b3299.firebaseapp.com](https://collectivites-b3299.firebaseapp.com)

## Déploiement en 3 Étapes

### 1. Vérifier que Firebase CLI est installé

```bash
firebase --version
```

Si non installé :

```bash
npm install -g firebase-tools
firebase login
```

### 2. Se connecter (si pas déjà fait)

```bash
firebase login
```

### 3. Déployer

```bash
cd frontend_collectivites_territoriales
pnpm run firebase:deploy
```

Cette commande :
- ✅ Génère le site statique (`pnpm generate`)
- ✅ Déploie sur Firebase Hosting
- ✅ Affiche l'URL publique

## Pages de Démonstration

Après le déploiement, les pages suivantes seront accessibles :

1. **Page d'accueil** : [https://collectivites-b3299.web.app/](https://collectivites-b3299.web.app/)
2. **Compte administratif** : [https://collectivites-b3299.web.app/compte-administratif](https://collectivites-b3299.web.app/compte-administratif)

## Déploiement Preview (Test)

Pour tester avant de déployer en production :

```bash
pnpm run firebase:preview
```

## Mise à Jour du Contenu

1. Modifiez les fichiers dans `app/pages/`
2. Redéployez :

```bash
pnpm run firebase:deploy
```

## Configuration Firebase

Tous les fichiers de configuration sont déjà en place :

- ✅ `.firebaserc` - ID du projet Firebase
- ✅ `firebase.json` - Configuration du hosting
- ✅ `app/config/firebase.config.ts` - SDK Firebase (optionnel)

## Résolution Rapide des Problèmes

### Erreur : "Project not found"

Vérifiez que vous êtes connecté au bon compte :

```bash
firebase logout
firebase login
```

### Erreur de build

Réinstallez les dépendances :

```bash
pnpm install
pnpm generate
```

### Page 404

Le fichier `firebase.json` est déjà configuré avec les rewrites nécessaires.

## Support

Pour toute question :
- **Organisation** : Transparency International - Initiative Madagascar
- **Email** : vramaherison@transparency.mg
- **Documentation complète** : Voir [DEPLOY.md](DEPLOY.md)
