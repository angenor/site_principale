# Plan d'implémentation - Frontend Back-Office (Nuxt 4)

**Projet**: Plateforme de Suivi des Revenus Miniers des Collectivités Territoriales
**Client**: Transparency International - Initiative Madagascar (TI MG) / PCQVP Madagascar
**Référence**: PCQVP_Plateforme
**Dernière mise à jour**: 02 décembre 2025

---

## Légende des statuts

| Statut | Description |
|--------|-------------|
| [x] | Terminé |
| [~] | En cours |
| [ ] | À faire |

---

## État actuel du Frontend

### Infrastructure existante
- [x] Nuxt 4.1.3 configuré (TypeScript, Tailwind CSS v4)
- [x] Composables : `useMockData.ts`, `useDarkMode.ts`
- [x] Types TypeScript complets (5 fichiers, 61+ interfaces)
- [x] Plugins : FontAwesome (40+ icônes), amCharts 5
- [x] Middleware `auth.ts` pour protection des routes `/admin`
- [x] Pages publiques : accueil, compte-administratif

### Composants manquants référencés
- [ ] `FinancialChart` - Composant graphique interactif
- [ ] `TableauFinancier` - Tableau de données financières

---

## Phase 1 : Charte Graphique et Design System

### 1.1 Charte graphique TI Madagascar
- [x] Récupération de la charte graphique officielle de TI MG
- [x] Définition de la palette de couleurs :
  - [x] Couleur primaire : Bleu TI `#3695d8` (PANTONE 2381 C)
  - [x] Couleurs secondaires (jaune, vert, orange, rose, rouge)
  - [x] Couleurs neutres (gris, noir, blanc)
  - [x] Couleurs sémantiques (success, error, warning, info)
- [x] Couleurs dark mode (variantes sombres de chaque couleur)

### 1.2 Typographies
- [x] Choix des polices :
  - [x] Titres : Barlow Condensed (équivalent Folio BdCn BT)
  - [x] Corps de texte : Inter (équivalent Geomanist)
  - [x] Monospace pour les données financières : JetBrains Mono
- [x] Import des polices Google Fonts dans `nuxt.config.ts`
- [x] Définition des tailles et graisses (h1-h6, body, caption, etc.)

### 1.3 Variables CSS et Tailwind
- [x] Configuration `app/assets/css/main.css` :
  - [x] Variables CSS personnalisées (`--color-primary`, `--color-secondary`, etc.)
  - [x] Variables pour le mode sombre
  - [x] Variables pour les espacements et rayons de bordure
- [ ] Extension de la configuration Tailwind (si nécessaire) :
  - [ ] Couleurs personnalisées
  - [ ] Breakpoints additionnels
  - [ ] Animations personnalisées

### 1.4 Logos et assets graphiques
- [x] Organisation des logos dans `public/images/logos/` :
  - [x] Logo TI Madagascar (fond bleu, texte blanc) : `logo_fond_bleu_texte_blanc.jpeg`
  - [x] Logo TI Madagascar (fond noir, texte blanc) : `logo_fond_noire_texte_blanc.jpeg`
  - [x] Logo TI Madagascar (fond noir, texte bleu) : `logo_fond_noire_texte_bleu.jpeg`
  - [ ] Logo PCQVP Madagascar
  - [ ] Favicon et icônes PWA (16x16, 32x32, 180x180, 192x192, 512x512)
- [ ] Images de fond et illustrations :
  - [ ] Images pour la page de login
  - [ ] Icônes personnalisées (si nécessaire)
  - [ ] Illustrations pour les états vides

### 1.5 Design tokens et composants de base
- [x] Définition des tokens de design :
  - [x] Espacements : `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
  - [x] Rayons de bordure : `none`, `sm`, `md`, `lg`, `full`
  - [x] Ombres : `sm`, `md`, `lg`, `xl`
  - [x] Durées d'animation : `fast`, `normal`, `slow`
- [ ] Styles de base :
  - [ ] Boutons (primary, secondary, outline, ghost, danger)
  - [ ] Inputs (default, error, disabled)
  - [ ] Cartes (elevated, bordered, flat)
  - [ ] Badges et tags

### Résumé de la charte graphique

**Couleurs primaires :**
- Bleu TI : `#3695d8` (PANTONE 2381 C)
- Noir TI : `#000000`
- Blanc TI : `#ffffff`

**Couleurs secondaires (PANTONE):**
- Jaune : `#fce300` (PANTONE 102 C)
- Vert lime : `#c4d600` (PANTONE 389 C)
- Orange : `#f9a11b` (PANTONE 1235 C)
- Rose : `#e0457b` (PANTONE 214 C)
- Rouge-orange : `#ee3831` (PANTONE 1788 C)
- Rouge : `#e4002b` (PANTONE 192 C)

**Couleurs sémantiques :**
- Success : `#10b981` (emerald-500)
- Error : `#ef4444` (red-500)
- Warning : `#f59e0b` (amber-500)
- Info : `#3b82f6` (blue-500)

**Typographies :**
- Titres : Barlow Condensed (400, 500, 600, 700, 800) - uppercase, letter-spacing 0.02em
- Corps : Inter (300, 400, 500, 600, 700)
- Données : JetBrains Mono (400, 500, 600)

**Fichiers configurés :**
- `nuxt.config.ts` : Google Fonts (preconnect + stylesheet)
- `app/assets/css/main.css` : Design tokens complet (420+ lignes)

---

## Phase 2 : Authentification

### 2.1 Composable d'authentification
- [ ] `composables/useAuth.ts` :
  - [ ] État réactif : `user`, `isAuthenticated`, `isLoading`, `error`
  - [ ] `login(email, password)` - Connexion via API
  - [ ] `logout()` - Déconnexion et nettoyage
  - [ ] `refreshToken()` - Rafraîchissement automatique du token
  - [ ] `register(data)` - Inscription (admin seulement)
  - [ ] `updatePassword(oldPassword, newPassword)` - Changement mot de passe
  - [ ] `resetPassword(email)` - Demande de réinitialisation
  - [ ] Persistance du token dans localStorage/cookie
  - [ ] Intercepteur axios/fetch pour injection du token Bearer

### 2.2 Pages d'authentification
- [ ] `pages/auth/login.vue` :
  - [ ] Formulaire email/mot de passe
  - [ ] Validation côté client (Vee-Validate ou native)
  - [ ] Gestion des erreurs (identifiants incorrects, compte désactivé)
  - [ ] Lien "Mot de passe oublié"
  - [ ] Redirection vers `/admin` après connexion
- [ ] `pages/auth/forgot-password.vue` :
  - [ ] Formulaire email
  - [ ] Confirmation d'envoi
- [ ] `pages/auth/reset-password.vue` :
  - [ ] Formulaire nouveau mot de passe
  - [ ] Validation du token dans l'URL
  - [ ] Redirection vers login après succès

### 2.3 Gestion des sessions
- [ ] Refresh token automatique avant expiration
- [ ] Déconnexion automatique si token invalide
- [ ] Affichage des sessions actives (optionnel)

---

## Phase 3 : Layout et Navigation Admin

### 3.1 Layout admin
- [ ] `layouts/admin.vue` :
  - [ ] Sidebar responsive (collapsible sur mobile)
  - [ ] Header avec :
    - [ ] Logo TI Madagascar
    - [ ] Bouton toggle sidebar
    - [ ] Toggle dark/light mode
    - [ ] Menu utilisateur (profil, déconnexion)
  - [ ] Breadcrumb dynamique
  - [ ] Zone de contenu principal avec transitions

### 3.2 Navigation sidebar
- [ ] Structure de menu :
  ```
  Dashboard
  ├── Données Financières
  │   ├── Comptes Administratifs
  │   ├── Recettes
  │   └── Dépenses
  ├── Géographie
  │   ├── Provinces
  │   ├── Régions
  │   └── Communes
  ├── Projets Miniers
  │   ├── Sociétés
  │   ├── Projets
  │   └── Revenus Miniers
  ├── Contenu (CMS)
  │   ├── Pages
  │   └── Sections
  ├── Documents
  ├── Utilisateurs
  ├── Newsletter
  ├── Statistiques
  │   ├── Tableau de bord
  │   ├── Visites
  │   └── Journal d'audit
  └── Paramètres
  ```
- [ ] Indicateurs visuels pour la page active
- [ ] Badges pour notifications (ex: abonnés newsletter en attente)
- [ ] Permissions : masquer les items selon le rôle utilisateur

### 3.3 Composants de base admin
- [ ] `components/admin/Sidebar.vue`
- [ ] `components/admin/Header.vue`
- [ ] `components/admin/Breadcrumb.vue`
- [ ] `components/admin/UserMenu.vue`

---

## Phase 4 : Composants Réutilisables

### 4.1 Composants de formulaire
- [ ] `components/ui/FormInput.vue` - Input avec label, erreur, icône
- [ ] `components/ui/FormSelect.vue` - Select avec recherche
- [ ] `components/ui/FormTextarea.vue` - Textarea avec compteur
- [ ] `components/ui/FormCheckbox.vue` - Checkbox/toggle
- [ ] `components/ui/FormRadio.vue` - Radio group
- [ ] `components/ui/FormDatePicker.vue` - Sélecteur de date
- [ ] `components/ui/FormFilePicker.vue` - Upload de fichier
- [ ] `components/ui/FormMoneyInput.vue` - Input monétaire (Ariary)

### 4.2 Composants de données
- [ ] `components/ui/DataTable.vue` :
  - [ ] Colonnes configurables (label, key, sortable, width)
  - [ ] Tri par colonne (asc/desc)
  - [ ] Pagination (page, limit, total)
  - [ ] Recherche globale
  - [ ] Filtres par colonne
  - [ ] Actions par ligne (voir, éditer, supprimer)
  - [ ] Sélection multiple (checkbox)
  - [ ] Export sélection
  - [ ] États : chargement, vide, erreur
- [ ] `components/ui/DataCard.vue` - Carte statistique avec icône
- [ ] `components/ui/DataList.vue` - Liste avec actions
- [ ] `components/ui/StatCard.vue` - Carte KPI avec évolution

### 4.3 Composants de feedback
- [ ] `components/ui/Modal.vue` - Modal configurable (taille, actions)
- [ ] `components/ui/ConfirmDialog.vue` - Dialogue de confirmation
- [ ] `components/ui/Toast.vue` - Notifications toast
- [ ] `components/ui/Alert.vue` - Alertes inline (success, error, warning, info)
- [ ] `components/ui/LoadingSpinner.vue` - Indicateur de chargement
- [ ] `components/ui/Skeleton.vue` - Placeholder de chargement
- [ ] `components/ui/EmptyState.vue` - État vide avec action
- [ ] `components/ui/ErrorState.vue` - État d'erreur avec retry

### 4.4 Composants de navigation
- [ ] `components/ui/Tabs.vue` - Onglets
- [ ] `components/ui/Dropdown.vue` - Menu déroulant
- [ ] `components/ui/Pagination.vue` - Pagination standalone
- [ ] `components/ui/Badge.vue` - Badge avec variantes

### 4.5 Système de notifications (composable)
- [ ] `composables/useToast.ts` :
  - [ ] `success(message, options)`
  - [ ] `error(message, options)`
  - [ ] `warning(message, options)`
  - [ ] `info(message, options)`
  - [ ] Auto-dismiss configurable
  - [ ] Actions (undo, retry)

---

## Phase 5 : Service API

### 5.1 Configuration HTTP
- [ ] `services/api.ts` :
  - [ ] Instance fetch/axios configurée
  - [ ] Base URL depuis `runtimeConfig.public.apiBaseUrl`
  - [ ] Intercepteur pour token Authorization
  - [ ] Intercepteur pour refresh token sur 401
  - [ ] Gestion globale des erreurs
  - [ ] Typage des réponses

### 5.2 Services par domaine
- [ ] `services/auth.service.ts` - Authentification
- [ ] `services/geo.service.ts` - Géographie (provinces, régions, communes)
- [ ] `services/exercices.service.ts` - Exercices fiscaux
- [ ] `services/tableaux.service.ts` - Tableaux de données financières
- [ ] `services/recettes.service.ts` - Données recettes
- [ ] `services/depenses.service.ts` - Données dépenses
- [ ] `services/projets.service.ts` - Projets et sociétés minières
- [ ] `services/revenus.service.ts` - Revenus miniers
- [ ] `services/documents.service.ts` - Documents
- [ ] `services/cms.service.ts` - Pages et sections CMS
- [ ] `services/utilisateurs.service.ts` - Gestion utilisateurs
- [ ] `services/newsletter.service.ts` - Abonnés newsletter
- [ ] `services/statistiques.service.ts` - Statistiques et audit
- [ ] `services/export.service.ts` - Export Excel/Word
- [ ] `services/import.service.ts` - Import de données
- [ ] `services/upload.service.ts` - Upload de fichiers

### 5.3 Composables de données
- [ ] `composables/useApi.ts` - Wrapper générique avec loading/error
- [ ] `composables/usePagination.ts` - Gestion pagination
- [ ] `composables/useFilters.ts` - Gestion filtres URL

---

## Phase 6 : Dashboard Admin

### 6.1 Page dashboard
- [ ] `pages/admin/index.vue` :
  - [ ] Cartes KPI principales :
    - [ ] Nombre de communes avec données
    - [ ] Total recettes (exercice en cours)
    - [ ] Total dépenses (exercice en cours)
    - [ ] Nombre de projets miniers actifs
  - [ ] Graphique évolution revenus (12 derniers mois)
  - [ ] Graphique répartition par région
  - [ ] Liste des dernières activités
  - [ ] Statistiques de visite (7 derniers jours)
  - [ ] Alertes/notifications importantes

### 6.2 Widgets dashboard
- [ ] `components/admin/dashboard/KpiCards.vue`
- [ ] `components/admin/dashboard/RevenueChart.vue`
- [ ] `components/admin/dashboard/RegionMap.vue`
- [ ] `components/admin/dashboard/RecentActivity.vue`
- [ ] `components/admin/dashboard/VisitStats.vue`
- [ ] `components/admin/dashboard/PendingTasks.vue`

---

## Phase 7 : Gestion des Données Financières

### 7.1 Comptes administratifs
- [ ] `pages/admin/comptes-administratifs/index.vue` :
  - [ ] Liste paginée avec filtres (commune, exercice, statut)
  - [ ] Actions : voir, éditer, publier, archiver
  - [ ] Indicateurs : statut publication, taux de complétion
- [ ] `pages/admin/comptes-administratifs/[id].vue` :
  - [ ] Détail avec onglets (Recettes, Dépenses, Équilibre, CMS)
  - [ ] Édition inline des montants
  - [ ] Historique des modifications
  - [ ] Boutons d'action (valider, publier, exporter)

### 7.2 Recettes
- [ ] `pages/admin/recettes/index.vue` :
  - [ ] Tableau filtrable par commune/exercice/compte
  - [ ] Import en lot
  - [ ] Export sélection
- [ ] `pages/admin/recettes/[id].vue` :
  - [ ] Formulaire d'édition
  - [ ] Validation des montants
  - [ ] Historique

### 7.3 Dépenses
- [ ] `pages/admin/depenses/index.vue` :
  - [ ] Même structure que recettes
- [ ] `pages/admin/depenses/[id].vue` :
  - [ ] Formulaire d'édition

### 7.4 Exercices
- [ ] `pages/admin/exercices/index.vue` :
  - [ ] Liste des exercices fiscaux
  - [ ] Actions : créer, clôturer, rouvrir
- [ ] `pages/admin/exercices/[id].vue` :
  - [ ] Détail avec statistiques de saisie
  - [ ] Communes sans données
  - [ ] Progression globale

### 7.5 Import de données
- [ ] `pages/admin/import/index.vue` :
  - [ ] Zone de drop pour fichier Excel
  - [ ] Sélection commune/exercice
  - [ ] Prévisualisation des données
  - [ ] Validation avant import
  - [ ] Rapport d'import (succès, erreurs, warnings)
- [ ] `components/admin/import/ExcelDropzone.vue`
- [ ] `components/admin/import/ImportPreview.vue`
- [ ] `components/admin/import/ImportReport.vue`

---

## Phase 8 : Gestion de la Géographie

### 8.1 Provinces
- [ ] `pages/admin/geo/provinces/index.vue` :
  - [ ] Liste des 6 provinces
  - [ ] Compteurs par province (régions, communes)
- [ ] `pages/admin/geo/provinces/[id].vue` :
  - [ ] Détail avec liste des régions
  - [ ] Statistiques agrégées

### 8.2 Régions
- [ ] `pages/admin/geo/regions/index.vue` :
  - [ ] Liste des 22 régions
  - [ ] Filtre par province
  - [ ] Compteurs (communes, population)
- [ ] `pages/admin/geo/regions/[id].vue` :
  - [ ] Détail avec liste des communes
  - [ ] Statistiques financières agrégées

### 8.3 Communes
- [ ] `pages/admin/geo/communes/index.vue` :
  - [ ] Liste paginée avec recherche
  - [ ] Filtres : province, région, type (urbaine/rurale)
  - [ ] Actions : voir, éditer, créer
- [ ] `pages/admin/geo/communes/[id].vue` :
  - [ ] Formulaire d'édition (nom, type, code, population, maire)
  - [ ] Lien vers comptes administratifs
  - [ ] Lien vers projets miniers associés
- [ ] `pages/admin/geo/communes/create.vue` :
  - [ ] Formulaire de création

---

## Phase 9 : Gestion des Projets Miniers

### 9.1 Sociétés minières
- [ ] `pages/admin/projets/societes/index.vue` :
  - [ ] Liste avec recherche
  - [ ] Nombre de projets par société
- [ ] `pages/admin/projets/societes/[id].vue` :
  - [ ] Détail avec projets associés
  - [ ] Édition des informations (nom, contact, site web)
- [ ] `pages/admin/projets/societes/create.vue` :
  - [ ] Formulaire de création

### 9.2 Projets miniers
- [ ] `pages/admin/projets/index.vue` :
  - [ ] Liste avec filtres (société, statut, type minerai)
  - [ ] Carte des localisations (optionnel)
- [ ] `pages/admin/projets/[id].vue` :
  - [ ] Formulaire : nom, code, type minerai, société, statut, coordonnées GPS
  - [ ] Association aux communes (relation N-N)
  - [ ] Liste des revenus générés
- [ ] `pages/admin/projets/create.vue` :
  - [ ] Formulaire de création

### 9.3 Revenus miniers
- [ ] `pages/admin/revenus/index.vue` :
  - [ ] Liste avec filtres (commune, projet, type, année)
  - [ ] Import en lot
- [ ] `pages/admin/revenus/[id].vue` :
  - [ ] Formulaire d'édition (projet, commune, type, montant, année)
- [ ] `pages/admin/revenus/create.vue` :
  - [ ] Formulaire de création

---

## Phase 10 : Gestion du CMS

### 10.1 Pages compte administratif
- [ ] `pages/admin/cms/pages/index.vue` :
  - [ ] Liste des pages (brouillon, publiée, archivée)
  - [ ] Filtres : commune, exercice, statut
  - [ ] Actions : créer, éditer, publier, archiver
- [ ] `pages/admin/cms/pages/[id].vue` :
  - [ ] En-tête : titre, description, statut
  - [ ] Liste des sections ordonnables (drag & drop)
  - [ ] Prévisualisation
- [ ] `pages/admin/cms/pages/create.vue` :
  - [ ] Formulaire : commune, exercice, titre, description

### 10.2 Sections CMS
- [ ] `pages/admin/cms/sections/[id].vue` :
  - [ ] Formulaire selon le type de section
  - [ ] Types supportés :
    - [ ] `editorjs` - Éditeur de texte riche
    - [ ] `bloc_image_gauche` / `bloc_image_droite` - Image + texte
    - [ ] `carte_fond_image` - Carte avec fond
    - [ ] `grille_cartes` - Grille de cartes informatives
    - [ ] `galerie_photos` - Galerie d'images
    - [ ] `liens_utiles` - Liste de liens
    - [ ] `note_informative` - Note
    - [ ] `tableau_financier` - Tableau intégré
    - [ ] `graphiques_analytiques` - Graphiques

### 10.3 Composants CMS
- [ ] `components/admin/cms/SectionList.vue` - Liste drag & drop
- [ ] `components/admin/cms/SectionEditor.vue` - Éditeur selon type
- [ ] `components/admin/cms/EditorJSBlock.vue` - Éditeur texte riche
- [ ] `components/admin/cms/ImageTextBlock.vue` - Bloc image/texte
- [ ] `components/admin/cms/GalleryEditor.vue` - Gestion galerie photos
- [ ] `components/admin/cms/CardsGridEditor.vue` - Gestion grille cartes
- [ ] `components/admin/cms/LinksEditor.vue` - Gestion liens utiles

### 10.4 Intégration Editor.js
- [ ] Installation de `@editorjs/editorjs` et plugins
- [ ] Configuration des outils (header, list, image, quote, table)
- [ ] Composable `useEditorJS.ts`

---

## Phase 11 : Gestion des Documents

### 11.1 Liste et CRUD documents
- [ ] `pages/admin/documents/index.vue` :
  - [ ] Liste avec filtres (type, commune, public/privé)
  - [ ] Prévisualisation miniature
  - [ ] Actions : télécharger, éditer, supprimer
- [ ] `pages/admin/documents/[id].vue` :
  - [ ] Métadonnées : titre, description, type, commune
  - [ ] Visibilité (public/privé)
  - [ ] Téléchargement
- [ ] `pages/admin/documents/upload.vue` :
  - [ ] Zone de drop multi-fichiers
  - [ ] Métadonnées par fichier
  - [ ] Barre de progression

### 11.2 Composants upload
- [ ] `components/admin/upload/FileDropzone.vue`
- [ ] `components/admin/upload/FilePreview.vue`
- [ ] `components/admin/upload/UploadProgress.vue`

---

## Phase 12 : Gestion des Utilisateurs

### 12.1 Liste et CRUD utilisateurs
- [ ] `pages/admin/utilisateurs/index.vue` :
  - [ ] Liste avec filtres (rôle, actif, commune)
  - [ ] Recherche par nom/email
  - [ ] Actions : voir, éditer, activer/désactiver, supprimer
- [ ] `pages/admin/utilisateurs/[id].vue` :
  - [ ] Informations : nom, email, rôle, commune associée
  - [ ] Historique de connexion
  - [ ] Sessions actives
  - [ ] Bouton réinitialiser mot de passe
- [ ] `pages/admin/utilisateurs/create.vue` :
  - [ ] Formulaire de création

### 12.2 Profil utilisateur connecté
- [ ] `pages/admin/profil/index.vue` :
  - [ ] Informations personnelles
  - [ ] Changement de mot de passe
  - [ ] Préférences (thème, langue)
  - [ ] Sessions actives avec déconnexion

---

## Phase 13 : Gestion Newsletter

### 13.1 Abonnés
- [ ] `pages/admin/newsletter/index.vue` :
  - [ ] Liste des abonnés avec statut (actif, inactif)
  - [ ] Filtres : statut, date inscription
  - [ ] Recherche par email
  - [ ] Actions : activer, désactiver, supprimer
  - [ ] Export CSV/Excel
- [ ] `pages/admin/newsletter/[id].vue` :
  - [ ] Détail abonné
  - [ ] Historique des actions

### 13.2 Statistiques newsletter
- [ ] Carte : nombre total d'abonnés
- [ ] Graphique : évolution des inscriptions
- [ ] Taux de désinscription

---

## Phase 14 : Statistiques et Audit

### 14.1 Tableau de bord statistiques
- [ ] `pages/admin/statistiques/index.vue` :
  - [ ] KPIs globaux
  - [ ] Graphiques interactifs
  - [ ] Filtres temporels (7j, 30j, 90j, année)

### 14.2 Statistiques de visite
- [ ] `pages/admin/statistiques/visites.vue` :
  - [ ] Pages les plus visitées
  - [ ] Évolution par jour/semaine/mois
  - [ ] Source du trafic (si trackée)
  - [ ] Téléchargements de documents

### 14.3 Journal d'audit
- [ ] `pages/admin/statistiques/audit.vue` :
  - [ ] Liste des actions (création, modification, suppression)
  - [ ] Filtres : table, utilisateur, action, date
  - [ ] Détail du changement (avant/après)
  - [ ] Export

---

## Phase 15 : Paramètres

### 15.1 Paramètres généraux
- [ ] `pages/admin/parametres/index.vue` :
  - [ ] Configuration de l'exercice en cours
  - [ ] Paramètres de validation (seuils d'alerte)
  - [ ] Configuration export (logos, en-têtes)

### 15.2 Plan comptable
- [ ] `pages/admin/parametres/plan-comptable.vue` :
  - [ ] Vue arborescente du plan comptable
  - [ ] Recherche par code/libellé
  - [ ] Édition des libellés (admin seulement)

---

## Phase 16 : Exports et Téléchargements

### 16.1 Génération côté client
- [ ] `composables/useExport.ts` :
  - [ ] `exportToExcel(data, filename)` - Export xlsx
  - [ ] `exportToCsv(data, filename)` - Export CSV
  - [ ] `exportToPdf(element, filename)` - Export PDF (html2pdf)
  - [ ] `printElement(element)` - Impression

### 16.2 Téléchargement depuis API
- [ ] Gestion des blobs pour fichiers volumineux
- [ ] Indicateur de progression
- [ ] Gestion des erreurs

---

## Phase 17 : Tests

### 17.1 Configuration
- [ ] Configuration Vitest
- [ ] Configuration Vue Test Utils
- [ ] Mocks des services API

### 17.2 Tests unitaires
- [ ] Tests des composables
- [ ] Tests des services
- [ ] Tests des utilitaires

### 17.3 Tests de composants
- [ ] Tests des composants UI
- [ ] Tests des formulaires
- [ ] Tests des tableaux de données

### 17.4 Tests E2E
- [ ] Configuration Playwright/Cypress
- [ ] Scénario : login → navigation → CRUD
- [ ] Scénario : import de données

---

## Phase 18 : Optimisation et Performance

### 18.1 Lazy loading
- [ ] Lazy import des pages admin
- [ ] Lazy import des composants lourds (graphiques, éditeurs)
- [ ] Code splitting par route

### 18.2 Cache et état
- [ ] Cache des données référentielles (géographie, plan comptable)
- [ ] Invalidation intelligente du cache
- [ ] Optimistic updates pour UX fluide

### 18.3 Accessibilité
- [ ] Navigation au clavier complète
- [ ] Attributs ARIA
- [ ] Contrastes suffisants (WCAG AA)
- [ ] Messages d'erreur accessibles

---

## Phase 19 : Déploiement

### 19.1 Build et génération
- [ ] Configuration build production
- [ ] Variables d'environnement production
- [ ] Optimisation des assets

### 19.2 Firebase Hosting
- [ ] Configuration firebase.json pour SPA
- [ ] Règles de redirection
- [ ] Headers de cache

### 19.3 Tests post-déploiement
- [ ] Vérification des routes
- [ ] Test d'authentification
- [ ] Performance Lighthouse

---

## Résumé de l'avancement

| Phase | Description | Avancement |
|-------|-------------|------------|
| 1 | Charte Graphique et Design System | 80% |
| 2 | Authentification | 0% |
| 3 | Layout et Navigation Admin | 0% |
| 4 | Composants Réutilisables | 0% |
| 5 | Service API | 0% |
| 6 | Dashboard Admin | 0% |
| 7 | Gestion des Données Financières | 0% |
| 8 | Gestion de la Géographie | 0% |
| 9 | Gestion des Projets Miniers | 0% |
| 10 | Gestion du CMS | 0% |
| 11 | Gestion des Documents | 0% |
| 12 | Gestion des Utilisateurs | 0% |
| 13 | Gestion Newsletter | 0% |
| 14 | Statistiques et Audit | 0% |
| 15 | Paramètres | 0% |
| 16 | Exports et Téléchargements | 0% |
| 17 | Tests | 0% |
| 18 | Optimisation et Performance | 0% |
| 19 | Déploiement | 0% |

**Avancement global estimé : 5%**

---

## Prochaines actions prioritaires

1. **Phase 1** - Définir la charte graphique (couleurs, typographies, tokens CSS)
2. **Phase 2** - Implémenter `useAuth.ts` et les pages de login
3. **Phase 3** - Créer le layout admin avec sidebar
4. **Phase 4** - Développer les composants UI de base (DataTable, Modal, Toast)
5. **Phase 5** - Configurer les services API avec typage
6. **Phase 6** - Créer le dashboard admin

---

## Notes techniques

### Stack technologique
- **Framework**: Nuxt 4.1.3 (Vue 3)
- **Langage**: TypeScript 5.9+
- **Styling**: Tailwind CSS v4
- **Icônes**: FontAwesome 6 (40+ icônes déjà configurées)
- **Graphiques**: amCharts 5
- **HTTP**: $fetch natif Nuxt ou Axios
- **Validation**: Vee-Validate ou validation native
- **Éditeur**: Editor.js

### Spécificités Tailwind CSS v4
- Dark mode : `@variant dark (&:where(.dark, .dark *))`
- Opacité : `bg-color/50` et non `bg-opacity-50`
- Cursor : ajouter `cursor-pointer` explicitement sur les boutons

### Correspondance avec l'API Backend

| Frontend | Endpoint Backend |
|----------|------------------|
| Login | `POST /api/v1/auth/login/json` |
| Refresh token | `POST /api/v1/auth/refresh` |
| Utilisateurs | `/api/v1/admin/utilisateurs` |
| Recettes | `/api/v1/admin/donnees/recettes` |
| Dépenses | `/api/v1/admin/donnees/depenses` |
| Exercices | `/api/v1/admin/exercices` |
| Pages CMS | `/api/v1/admin/cms/pages` |
| Sections CMS | `/api/v1/admin/cms/sections` |
| Documents | `/api/v1/admin/upload/documents` |
| Newsletter | `/api/v1/admin/newsletter` |
| Statistiques | `/api/v1/admin/statistiques` |
| Import Excel | `POST /api/v1/admin/import/excel` |
| Export | `/api/v1/export/excel`, `/api/v1/export/word` |

### Structure de fichiers cible

```
app/
├── pages/
│   ├── admin/
│   │   ├── index.vue                    # Dashboard
│   │   ├── comptes-administratifs/
│   │   ├── recettes/
│   │   ├── depenses/
│   │   ├── exercices/
│   │   ├── import/
│   │   ├── geo/
│   │   │   ├── provinces/
│   │   │   ├── regions/
│   │   │   └── communes/
│   │   ├── projets/
│   │   │   ├── societes/
│   │   │   └── revenus/
│   │   ├── cms/
│   │   │   ├── pages/
│   │   │   └── sections/
│   │   ├── documents/
│   │   ├── utilisateurs/
│   │   ├── newsletter/
│   │   ├── statistiques/
│   │   ├── parametres/
│   │   └── profil/
│   └── auth/
│       ├── login.vue
│       ├── forgot-password.vue
│       └── reset-password.vue
├── layouts/
│   └── admin.vue
├── components/
│   ├── admin/
│   │   ├── Sidebar.vue
│   │   ├── Header.vue
│   │   ├── Breadcrumb.vue
│   │   ├── UserMenu.vue
│   │   ├── dashboard/
│   │   ├── cms/
│   │   ├── import/
│   │   └── upload/
│   └── ui/
│       ├── DataTable.vue
│       ├── Modal.vue
│       ├── FormInput.vue
│       └── ...
├── composables/
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useToast.ts
│   ├── usePagination.ts
│   └── useExport.ts
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── geo.service.ts
│   └── ...
└── types/
    └── (déjà complets)
```

### Rôles utilisateurs

| Rôle | Droits |
|------|--------|
| `admin` | Accès complet, gestion utilisateurs |
| `editeur` | Saisie et modification des données |
| `lecteur` | Consultation uniquement |
| `commune` | Accès limité à sa commune |

---

## Références

| Document | Emplacement |
|----------|-------------|
| Plan backend | `documentations/plan_implementation/backend_plan_implementation.md` |
| Schéma BDD | `backend_collectivites_territoriales/bank/scripts/schema.sql` |
| Types frontend | `frontend_collectivites_territoriales/app/types/` |
| Mock data | `frontend_collectivites_territoriales/app/composables/useMockData.ts` |
| Template Excel | `backend_collectivites_territoriales/bank/exemples/` |
| Cahier des charges | `backend_collectivites_territoriales/bank/cahier_des_charges/` |
