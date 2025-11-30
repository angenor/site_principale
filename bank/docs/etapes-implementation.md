# Plan d'implémentation - Observatoire des Mines de Madagascar (MOM)

**Projet**: Site web de l'Observatoire des Mines de Madagascar
**Client**: Transparency International - Initiative Madagascar (TIMG) / PCQVP Madagascar
**Référence**: TIMG_WEB-MOM
**Dernière mise à jour**: 30 novembre 2025

---

## Légende des statuts

| Statut | Description |
|--------|-------------|
| [x] | Terminé |
| [~] | En cours |
| [ ] | À faire |

---

## Phase 1 : Configuration et Infrastructure

### 1.1 Environnement de développement
- [x] Initialisation du projet Nuxt 4
- [x] Configuration Vue 3 + Composition API
- [x] Configuration Tailwind CSS v4
- [x] Configuration du dark mode
- [x] Installation des plugins (FontAwesome, AmCharts)
- [x] Configuration des layouts et transitions de page

### 1.2 Base de données
- [x] Choix de PostgreSQL comme SGBD
- [x] Installation et configuration de Prisma ORM (v6.19)
- [x] Création de la base de données `mom_db`
- [x] Conception du schéma de données (17 tables)
- [x] Génération du client Prisma (`app/generated/prisma/`)
- [x] Documentation du modèle de données (`bank/modele_de_donnees/`)

### 1.3 Structure du projet
- [x] Organisation des dossiers (`app/`, `server/`, `prisma/`, `public/`)
- [x] Configuration des variables d'environnement (`.env`)
- [x] Documentation technique (`CLAUDE.md`)

---

## Phase 2 : Design et Maquettes

### 2.1 Charte graphique
- [ ] Réception de la charte graphique de TIMG
- [ ] Définition de la palette de couleurs
- [ ] Choix des typographies
- [ ] Création des variables CSS personnalisées

### 2.2 Maquettes graphiques
- [ ] Maquette de la page d'accueil (desktop + mobile)
- [ ] Maquette de la page "Études de cas" (liste)
- [ ] Maquette de la page "Fiche de cas" (détail)
- [ ] Maquette de la page "À propos"
- [ ] Maquette du header et footer
- [ ] Validation des maquettes par TIMG

---

## Phase 3 : Développement Frontend

### 3.1 Composants communs
- [ ] Header (logo + navigation sticky)
- [ ] Footer (contact, adresse)
- [ ] Composant Card générique
- [ ] Composant Button
- [ ] Composant Modal
- [ ] Loader / Skeleton

### 3.2 Page d'accueil (`/`)
- [ ] Section Hero / Galerie d'images (slider)
- [ ] Section Axes stratégiques (4 cartes en grille)
- [ ] Section Actualités (cartes avec date, tri récent → ancien)
- [ ] Section Études de cas (aperçu, grille de cartes)
- [ ] Section Partenaires (logos défilants)

### 3.3 Page Études de cas (`/cas`)
- [ ] Liste des études de cas (grille)
- [ ] Filtres par catégorie/région
- [ ] Pagination ou infinite scroll
- [ ] Tri par date (récent → ancien)

### 3.4 Page Fiche de cas (`/cas/[slug]`)
- [ ] Image de couverture
- [ ] Titre et sous-titre
- [ ] Icônes des thématiques
- [ ] Région et date
- [ ] Contenu détaillé (texte, images, vidéos)
- [ ] Mots-clés
- [ ] Documents téléchargeables
- [ ] Navigation entre cas (précédent/suivant)

### 3.5 Page À propos (`/a-propos`)
- [ ] Section Mission
- [ ] Section Vision
- [ ] Section Contexte/Historique
- [ ] Présentation des organisations (TIMG, PCQVP)

### 3.6 Responsive Design
- [ ] Adaptation mobile (< 640px)
- [ ] Adaptation tablette (640px - 1024px)
- [ ] Tests sur différents appareils

---

## Phase 4 : Développement Backend (API)

### 4.1 Configuration serveur
- [ ] Structure des routes API (`server/api/`)
- [ ] Middleware d'authentification
- [ ] Gestion des erreurs centralisée
- [ ] Validation des données (Zod)

### 4.2 API Études de cas
- [ ] `GET /api/cases` - Liste des cas publiés
- [ ] `GET /api/cases/[slug]` - Détail d'un cas
- [ ] `GET /api/cases/featured` - Cas mis en avant
- [ ] `POST /api/cases` - Créer un cas (admin)
- [ ] `PUT /api/cases/[id]` - Modifier un cas (admin)
- [ ] `DELETE /api/cases/[id]` - Supprimer un cas (admin)

### 4.3 API Catégories et Régions
- [ ] `GET /api/categories` - Liste des catégories
- [ ] `GET /api/regions` - Liste des régions

### 4.4 API Actualités
- [ ] `GET /api/news` - Liste des actualités
- [ ] `GET /api/news/[slug]` - Détail d'une actualité
- [ ] CRUD pour administration

### 4.5 API Contenu statique
- [ ] `GET /api/strategic-axes` - Axes stratégiques
- [ ] `GET /api/partners` - Partenaires
- [ ] `GET /api/gallery` - Images du slider
- [ ] `GET /api/about` - Contenu page À propos
- [ ] `GET /api/config` - Configuration du site

### 4.6 API Contact / Signalement
- [ ] `POST /api/contact` - Soumettre un signalement
- [ ] `GET /api/contacts` - Liste des signalements (admin)
- [ ] `PUT /api/contacts/[id]` - Mettre à jour statut (admin)

### 4.7 API Médias
- [ ] `POST /api/upload` - Upload de fichiers
- [ ] `GET /api/media` - Liste des médias (admin)
- [ ] `DELETE /api/media/[id]` - Supprimer un média (admin)

---

## Phase 5 : Back-office (Administration)

### 5.1 Authentification
- [ ] Page de connexion (`/admin/login`)
- [ ] Système de sessions (JWT ou cookies)
- [ ] Gestion des rôles (ADMIN, EDITOR)
- [ ] Récupération de mot de passe

### 5.2 Dashboard (`/admin`)
- [ ] Vue d'ensemble (stats)
- [ ] Nombre de visites
- [ ] Nombre de téléchargements
- [ ] Signalements récents

### 5.3 Gestion des études de cas (`/admin/cases`)
- [ ] Liste avec recherche et filtres
- [ ] Formulaire de création/édition
- [ ] Éditeur de contenu riche (WYSIWYG ou Markdown)
- [ ] Upload d'images et documents
- [ ] Gestion des catégories et mots-clés
- [ ] Publication / Dépublication

### 5.4 Gestion des actualités (`/admin/news`)
- [ ] Liste des actualités
- [ ] Formulaire de création/édition
- [ ] Publication / Dépublication

### 5.5 Gestion du contenu (`/admin/content`)
- [ ] Édition des axes stratégiques
- [ ] Édition des partenaires
- [ ] Édition des images du slider
- [ ] Édition du contenu "À propos"
- [ ] Configuration générale du site

### 5.6 Gestion des signalements (`/admin/contacts`)
- [ ] Liste des signalements
- [ ] Filtres par statut (nouveau, en cours, traité)
- [ ] Détail et notes internes
- [ ] Archivage

### 5.7 Gestion des utilisateurs (`/admin/users`)
- [ ] Liste des utilisateurs
- [ ] Création/modification de comptes
- [ ] Activation/désactivation

---

## Phase 6 : Fonctionnalités avancées

### 6.1 Moteur de recherche
- [ ] Recherche globale (titre, contenu, mots-clés)
- [ ] Recherche dans les documents (PDF)
- [ ] Suggestions de recherche
- [ ] Page de résultats

### 6.2 Statistiques et analytics
- [ ] Tracking des visites (PageVisit)
- [ ] Tracking des téléchargements (Download)
- [ ] Graphiques dans le dashboard admin

### 6.3 Échange sécurisé d'informations
- [ ] Évaluation de GlobalLeaks ou solution similaire
- [ ] Intégration ou lien vers la solution choisie
- [ ] Formulaire de signalement anonyme

---

## Phase 7 : SEO et Performance

### 7.1 Optimisation SEO
- [ ] Balises meta (title, description) par page
- [ ] Balises Open Graph pour réseaux sociaux
- [ ] Sitemap XML automatique
- [ ] Robots.txt
- [ ] URLs propres (slugs)
- [ ] Données structurées (JSON-LD)

### 7.2 Performance
- [ ] Optimisation des images (formats modernes, lazy loading)
- [ ] Minification CSS/JS
- [ ] Cache des requêtes API
- [ ] Analyse avec Lighthouse
- [ ] Score cible : > 90 sur Lighthouse

---

## Phase 8 : Tests et Qualité

### 8.1 Tests fonctionnels
- [ ] Tests des formulaires
- [ ] Tests de navigation
- [ ] Tests responsive
- [ ] Tests cross-browser (Chrome, Firefox, Edge, Safari)

### 8.2 Tests de sécurité
- [ ] Validation des entrées utilisateur
- [ ] Protection CSRF
- [ ] Protection XSS
- [ ] Sécurisation des uploads
- [ ] Audit des dépendances

### 8.3 Accessibilité
- [ ] Navigation au clavier
- [ ] Lecteur d'écran
- [ ] Contrastes suffisants
- [ ] Textes alternatifs pour images

---

## Phase 9 : Intégration de contenu

### 9.1 Données initiales
- [ ] Insertion des 22 régions de Madagascar
- [ ] Insertion des catégories thématiques
- [ ] Insertion des axes stratégiques
- [ ] Insertion des partenaires (TIMG, PCQVP)
- [ ] Configuration initiale du site

### 9.2 Contenu fourni par TIMG
- [ ] Import des études de cas existantes
- [ ] Import des actualités
- [ ] Import des images et documents
- [ ] Rédaction des textes "À propos"

---

## Phase 10 : Déploiement

### 10.1 Préparation
- [ ] Configuration de l'hébergement production
- [ ] Configuration du nom de domaine
- [ ] Configuration SSL (HTTPS)
- [ ] Configuration de la base de données production

### 10.2 Mise en production
- [ ] Déploiement du code
- [ ] Migration de la base de données
- [ ] Upload des assets (images, documents)
- [ ] Configuration des variables d'environnement
- [ ] Tests post-déploiement

### 10.3 Monitoring
- [ ] Mise en place des logs
- [ ] Alertes en cas d'erreur
- [ ] Sauvegardes automatiques de la BDD

---

## Phase 11 : Formation et Documentation

### 11.1 Guide d'utilisation
- [ ] Rédaction du guide utilisateur (back-office)
- [ ] Captures d'écran annotées
- [ ] FAQ

### 11.2 Formation
- [ ] Session de formation pour les administrateurs
- [ ] Session de formation pour les éditeurs
- [ ] Support post-formation

### 11.3 Documentation technique
- [x] Documentation du modèle de données
- [ ] Documentation des API
- [ ] Guide de maintenance technique
- [ ] Procédure de mise à jour

---

## Phase 12 : Livraison et SAV

### 12.1 Livrables
- [ ] Code source commenté (repository Git)
- [ ] Accès au back-office
- [ ] Guide d'utilisation
- [ ] Documentation technique

### 12.2 Service après-vente (2 ans)
- [ ] Mise en place du support
- [ ] Procédure de signalement de bugs
- [ ] Planning des mises à jour
- [ ] Maintenance préventive

---

## Résumé de l'avancement

| Phase | Description | Avancement |
|-------|-------------|------------|
| 1 | Configuration et Infrastructure | 100% |
| 2 | Design et Maquettes | 0% |
| 3 | Développement Frontend | 0% |
| 4 | Développement Backend (API) | 0% |
| 5 | Back-office (Administration) | 0% |
| 6 | Fonctionnalités avancées | 0% |
| 7 | SEO et Performance | 0% |
| 8 | Tests et Qualité | 0% |
| 9 | Intégration de contenu | 0% |
| 10 | Déploiement | 0% |
| 11 | Formation et Documentation | 10% |
| 12 | Livraison et SAV | 0% |

**Avancement global estimé : ~10%**

---

## Prochaines actions prioritaires

1. **Réception de la charte graphique** de TIMG
2. **Insertion des données initiales** (régions, catégories, axes stratégiques)
3. **Création des maquettes** (Figma ou autre)
4. **Développement des composants UI** de base (Header, Footer, Cards)
5. **Implémentation de la page d'accueil**

---

## Notes techniques

### Technologies utilisées
- **Frontend**: Nuxt 4, Vue 3, Tailwind CSS v4
- **Backend**: Nitro (serveur Nuxt), Prisma ORM v6.19
- **Base de données**: PostgreSQL (mom_db)
- **Icônes**: FontAwesome
- **Graphiques**: AmCharts 5

### Tables de la base de données (17)
```
users, case_studies, case_study_categories, case_study_media,
case_study_keywords, categories, regions, news, strategic_axes,
partners, gallery_images, media, contacts, page_visits, downloads,
site_config, about_content
```

### Fichiers de référence
| Fichier | Description |
|---------|-------------|
| `bank/docs/cahier_des_charges/TIMG_MOM_TdR_Conception-Web.md` | Cahier des charges |
| `bank/modele_de_donnees/schema.prisma` | Schéma de données |
| `bank/modele_de_donnees/README.md` | Documentation modèle |
| `bank/modele_de_donnees/seed-data.sql` | Données initiales |
| `prisma/schema.prisma` | Schéma Prisma actif |
| `CLAUDE.md` | Configuration projet |
