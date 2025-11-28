# Guide de Déploiement sur Firebase Hosting

Ce guide explique comment déployer le site de démonstration des Collectivités Territoriales sur Firebase Hosting.

## Prérequis

- Compte Google/Gmail
- Node.js et pnpm installés
- Firebase CLI installé globalement

## Étape 1 : Installation de Firebase CLI

Si Firebase CLI n'est pas encore installé, exécutez :

```bash
npm install -g firebase-tools
```

Vérifiez l'installation :

```bash
firebase --version
```

## Étape 2 : Connexion à Firebase

Connectez-vous à votre compte Google :

```bash
firebase login
```

Cela ouvrira votre navigateur pour l'authentification.

## Étape 3 : Projet Firebase (Déjà Configuré ✅)

Le projet Firebase est déjà créé et configuré :

- **Project ID** : `collectivites-b3299`
- **Project Name** : Collectivites
- **Console** : [https://console.firebase.google.com/project/collectivites-b3299](https://console.firebase.google.com/project/collectivites-b3299)

Le fichier `.firebaserc` est déjà configuré avec l'ID du projet :

```json
{
  "projects": {
    "default": "collectivites-b3299"
  }
}
```

**Note** : Cette étape est déjà complétée. Vous pouvez passer directement à l'étape 4.

## Étape 4 : Initialisation Firebase (Optionnel)

Si vous voulez reconfigurer Firebase, exécutez :

```bash
firebase init hosting
```

- Sélectionnez "Use an existing project"
- Choisissez votre projet
- Public directory: `.output/public`
- Configure as single-page app: **Yes**
- Set up automatic builds with GitHub: **No** (pour l'instant)

**Note**: Les fichiers `firebase.json` et `.firebaserc` sont déjà configurés, cette étape est optionnelle.

## Étape 5 : Génération du Site Statique

Générez le site statique avec Nuxt :

```bash
cd frontend_collectivites_territoriales
pnpm generate
```

Cette commande crée le dossier `.output/public` avec tous les fichiers HTML, CSS, et JS optimisés.

## Étape 6 : Déploiement sur Firebase Hosting

### Déploiement Production

Pour déployer sur l'environnement de production :

```bash
pnpm run firebase:deploy
```

Ou manuellement :

```bash
firebase deploy --only hosting
```

### Déploiement Preview (Test)

Pour déployer sur un environnement de prévisualisation temporaire :

```bash
pnpm run firebase:preview
```

Ou manuellement :

```bash
firebase hosting:channel:deploy preview
```

## Étape 7 : Accès au Site

Après le déploiement, Firebase affichera l'URL de votre site :

```
Hosting URL: https://collectivites-b3299.web.app
```

ou

```
Hosting URL: https://collectivites-b3299.firebaseapp.com
```

Vous pouvez aussi accéder directement à votre projet via la [Console Firebase](https://console.firebase.google.com/project/collectivites-b3299/hosting).

## Configuration Avancée

### Domaine Personnalisé

Pour utiliser un domaine personnalisé (ex: `demo.transparency.mg`) :

1. Allez dans Firebase Console > Hosting
2. Cliquez sur "Ajouter un domaine personnalisé"
3. Suivez les instructions pour configurer les enregistrements DNS

### Déploiement Automatique avec GitHub

Pour activer le déploiement automatique à chaque push :

1. Connectez votre repository GitHub à Firebase
2. Configurez GitHub Actions avec le workflow Firebase
3. Chaque push sur `main` déclenchera un déploiement automatique

## Scripts Disponibles

Le projet inclut ces scripts npm dans [package.json](package.json:11-12) :

- `pnpm run firebase:deploy` - Génère et déploie sur production
- `pnpm run firebase:preview` - Génère et déploie sur environnement de test

## Structure des Fichiers Générés

Après `pnpm generate`, le dossier `.output/public` contient :

```
.output/public/
├── index.html                    # Page d'accueil (démonstration)
├── compte-administratif.html     # Page de compte administratif (démonstration)
├── _nuxt/                        # Assets JS/CSS optimisés
│   ├── *.js
│   └── *.css
├── images/                       # Images optimisées
└── ...
```

## Vérification du Déploiement

Pour vérifier que les pages de démonstration sont accessibles :

1. **Page d'accueil** : [https://collectivites-b3299.web.app/](https://collectivites-b3299.web.app/)
2. **Compte administratif** : [https://collectivites-b3299.web.app/compte-administratif](https://collectivites-b3299.web.app/compte-administratif)

Ces URLs seront actives après votre premier déploiement avec `pnpm run firebase:deploy`.

## Résolution des Problèmes

### Erreur : "firebase: command not found"

```bash
npm install -g firebase-tools
```

### Erreur : "Permission denied"

Sur macOS/Linux, utilisez `sudo` :

```bash
sudo npm install -g firebase-tools
```

### Erreur : "Project not found"

Vérifiez que l'ID du projet dans `.firebaserc` correspond à votre projet Firebase.

### Page 404 sur les routes

Assurez-vous que `firebase.json` contient la configuration de réécriture pour le SPA :

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Erreur de build

Vérifiez que toutes les dépendances sont installées :

```bash
pnpm install
```

## Maintenance

### Mise à jour du contenu

Pour mettre à jour le contenu du site :

1. Modifiez les fichiers dans `app/pages/`
2. Régénérez le site : `pnpm generate`
3. Redéployez : `pnpm run firebase:deploy`

### Rollback vers une version précédente

Firebase conserve l'historique des déploiements :

```bash
firebase hosting:rollback
```

Ou via la console Firebase : Hosting > Release History > Rollback

## Ressources

- [Documentation Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Documentation Nuxt Static Site Generation](https://nuxt.com/docs/getting-started/deployment#static-hosting)
- [Console Firebase](https://console.firebase.google.com/)

## Support

Pour toute question, contactez :
- **Organisation** : Transparency International - Initiative Madagascar (TI MG)
- **Email** : vramaherison@transparency.mg
