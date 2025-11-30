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

## Phase 2 : Charte graphique
- [x] Réception de la charte graphique de TIMG (`bank/docs/charte_graphique/`)
- [x] Définition de la palette de couleurs (Bleu TI #3695d8, couleurs secondaires)
- [x] Choix des typographies (Barlow Condensed, Inter)
- [x] Création des variables CSS personnalisées (`app/assets/css/main.css`)

### Résumé de la charte graphique

**Couleurs primaires :**
- Bleu TI : `#3695d8` (PANTONE 2381 C)
- Noir TI : `#000000`
- Blanc TI : `#ffffff`

**Couleurs secondaires :**
- Jaune : `#ffed00`
- Vert lime : `#c4d600`
- Orange : `#ffb81c`
- Rose : `#e31c79`
- Rouge-orange : `#ee3124`
- Rouge : `#e31837`

**Typographies :**
- Titres : Barlow Condensed (équivalent Folio BdCn BT)
- Corps : Inter (équivalent Geomanist)

**Logos disponibles :**
- `public/images/logos/logo_fond_bleu_texte_blanc.jpeg`
- `public/images/logos/logo_fond_noire_texte_blanc.jpeg`
- `public/images/logos/logo_fond_noire_texte_bleu.jpeg`

---

## Phase 3 : Développement Frontend

### 3.1 Composants communs
- [x] Header (logo + navigation sticky) → `AppHeader.vue`
- [x] Footer (contact, adresse) → `AppFooter.vue`
- [x] Composant Card générique → `AppCard.vue`
- [ ] Composant Button
- [ ] Composant Modal
- [ ] Loader / Skeleton

### 3.2 Page d'accueil (`/`)
- [x] Section Hero / Galerie d'images (slider) → `HeroSection.vue`
- [x] Section Axes stratégiques (4 cartes en grille) → `StrategicAxesSection.vue`
- [x] Section Actualités (cartes avec date, tri récent → ancien) → `NewsSection.vue`
- [x] Section Études de cas (aperçu, grille de cartes) → `CaseStudiesSection.vue`
- [x] Section Partenaires (logos défilants) → `PartnersSection.vue`

### 3.3 Page Études de cas (`/cas`) → `pages/cas/index.vue`
- [x] Liste des études de cas (grille)
- [x] Filtres par catégorie/région
- [ ] Pagination ou infinite scroll
- [x] Tri par date (récent → ancien)

### 3.4 Page Fiche de cas (`/cas/[slug]`) → `pages/cas/[slug].vue`
- [x] Image de couverture
- [x] Titre et sous-titre
- [x] Icônes des thématiques
- [x] Région et date
- [x] Contenu détaillé (texte, images, vidéos)
- [x] Mots-clés
- [x] Documents téléchargeables
- [x] Navigation entre cas (précédent/suivant)
- [x] Partage social (Twitter, Facebook, LinkedIn)
- [x] Cas connexes

### 3.5 Page À propos (`/a-propos`) → `pages/a-propos.vue`
- [x] Section Mission
- [x] Section Vision
- [x] Section Contexte/Historique
- [x] Présentation des organisations (TIMG, PCQVP)
- [x] Timeline historique
- [x] Section Contact

### 3.6 Responsive Design
- [x] Adaptation mobile (< 640px) - intégrée dans tous les composants
- [x] Adaptation tablette (640px - 1024px) - intégrée dans tous les composants
- [x] Tests sur différents appareils

---

## Phase 4 : Développement Backend (API)

### 4.1 Configuration serveur
- [x] Structure des routes API (`server/api/`)
- [x] Utilitaire Prisma singleton (`server/utils/prisma.ts`)
- [ ] Middleware d'authentification
- [ ] Gestion des erreurs centralisée
- [ ] Validation des données (Zod)

### 4.2 API Études de cas
- [x] `GET /api/cases` - Liste des cas publiés (avec filtres, pagination)
- [x] `GET /api/cases/[slug]` - Détail d'un cas
- [x] `GET /api/cases/featured` - Cas mis en avant
- [ ] `POST /api/cases` - Créer un cas (admin)
- [ ] `PUT /api/cases/[id]` - Modifier un cas (admin)
- [ ] `DELETE /api/cases/[id]` - Supprimer un cas (admin)

### 4.3 API Catégories et Régions
- [x] `GET /api/categories` - Liste des catégories
- [x] `GET /api/regions` - Liste des régions

### 4.4 API Actualités
- [x] `GET /api/news` - Liste des actualités
- [x] `GET /api/news/[slug]` - Détail d'une actualité
- [ ] CRUD pour administration

### 4.5 API Contenu statique
- [x] `GET /api/strategic-axes` - Axes stratégiques
- [x] `GET /api/partners` - Partenaires
- [x] `GET /api/gallery` - Images du slider
- [x] `GET /api/sliders` - Slides du hero (galerie homepage)
- [x] `GET /api/about` - Contenu page À propos
- [x] `GET /api/config` - Configuration du site

### 4.6 API Contact / Signalement
- [x] `POST /api/contact` - Soumettre un signalement
- [ ] `GET /api/contacts` - Liste des signalements (admin)
- [ ] `PUT /api/contacts/[id]` - Mettre à jour statut (admin)

### 4.7 API Médias
- [ ] `POST /api/upload` - Upload de fichiers
- [ ] `GET /api/media` - Liste des médias (admin)
- [ ] `DELETE /api/media/[id]` - Supprimer un média (admin)

### 4.8 Page Signalement (Frontend)
- [x] Page `/signaler` avec formulaire complet
- [x] Option signalement anonyme
- [x] Validation des champs
- [x] Confirmation d'envoi

---

## Phase 5 : Back-office (Administration)

### 5.1 Authentification
- [x] Page de connexion (`/admin/login`)
- [x] Système de sessions (JWT + cookies)
- [x] Gestion des rôles (ADMIN, EDITOR)
- [ ] Récupération de mot de passe

### 5.2 Dashboard (`/admin`)
- [x] Vue d'ensemble (stats)
- [x] Nombre de visites
- [~] Nombre de téléchargements
- [x] Signalements récents

### 5.3 Gestion des études de cas (`/admin/cases`)
- [x] Liste avec recherche et filtres
- [x] Formulaire de création/édition
- [x] Éditeur de contenu (HTML)
- [ ] Upload d'images et documents
- [x] Gestion des catégories et mots-clés
- [x] Publication / Dépublication

### 5.4 Gestion des actualités (`/admin/news`)
- [x] Liste des actualités
- [x] Formulaire de création/édition
- [x] Publication / Dépublication

### 5.5 Gestion du contenu (`/admin/content`)
- [x] Édition des axes stratégiques
- [x] Édition des partenaires
- [x] Édition des images du slider
- [ ] Édition du contenu "À propos"
- [ ] Configuration générale du site

### 5.6 Gestion des signalements (`/admin/contacts`)
- [x] Liste des signalements
- [x] Filtres par statut (nouveau, en cours, traité)
- [x] Détail et notes internes
- [x] Archivage

### 5.7 Gestion des utilisateurs (`/admin/users`)
- [x] Liste des utilisateurs
- [x] Création/modification de comptes
- [x] Activation/désactivation

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
| 2 | Charte graphique | 100% |
| 3 | Développement Frontend | 95% |
| 4 | Développement Backend (API) | 75% |
| 5 | Back-office (Administration) | 90% |
| 6 | Fonctionnalités avancées | 0% |
| 7 | SEO et Performance | 0% |
| 8 | Tests et Qualité | 0% |
| 9 | Intégration de contenu | 0% |
| 10 | Déploiement | 0% |
| 11 | Formation et Documentation | 10% |
| 12 | Livraison et SAV | 0% |

**Avancement global estimé : ~55%**

---

## Prochaines actions prioritaires

1. ~~**Insertion des données initiales** (régions, catégories, axes stratégiques)~~ ✓
2. ~~**Développement des composants UI** de base (Header, Footer, Cards)~~ ✓
3. ~~**Implémentation de la page d'accueil**~~ ✓
4. ~~**Page des études de cas** (`/cas` et `/cas/[slug]`)~~ ✓
5. ~~**Page À propos** (`/a-propos`)~~ ✓
6. ~~**Création des API endpoints** de base (Phase 4)~~ ✓
7. ~~**Page de signalement** (`/signaler`)~~ ✓
8. ~~**Connecter le frontend aux API** (remplacer les données mockées)~~ ✓
9. ~~**Phase 5 : Back-office** (authentification, dashboard admin)~~ Terminé (~90%)
   - [x] Page de connexion admin
   - [x] Système JWT + cookies
   - [x] Layout admin avec sidebar
   - [x] Dashboard avec stats
   - [x] Liste des études de cas avec filtres
   - [x] Formulaire de création/édition des cas
   - [x] Gestion des actualités (liste + formulaire)
   - [x] Gestion des signalements (liste + détail + notes)
   - [x] Gestion du contenu statique (axes, partenaires, slider)
   - [x] Gestion des utilisateurs (admin uniquement)
   - [ ] Édition contenu "À propos"
   - [ ] Configuration générale du site
10. **Phase 6 : Fonctionnalités avancées** (recherche, analytics)
11. **Phase 7 : SEO et Performance**

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
| `bank/docs/charte_graphique/Charte-graphique-TI-MG-version-7102020.pdf` | Charte graphique TIMG |
| `bank/modele_de_donnees/schema.prisma` | Schéma de données |
| `bank/modele_de_donnees/README.md` | Documentation modèle |
| `bank/modele_de_donnees/seed-data.sql` | Données initiales |
| `prisma/schema.prisma` | Schéma Prisma actif |
| `app/assets/css/main.css` | Variables CSS de la charte graphique |
| `CLAUDE.md` | Configuration projet |
