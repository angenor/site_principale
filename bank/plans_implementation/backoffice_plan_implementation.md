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
- [x] `composables/useAuth.ts` :
  - [x] État réactif : `user`, `isAuthenticated`, `isLoading`, `error`
  - [x] `login(email, password)` - Connexion via API
  - [x] `logout()` - Déconnexion et nettoyage
  - [x] `refreshAccessToken()` - Rafraîchissement automatique du token
  - [ ] `register(data)` - Inscription (admin seulement) - *via page admin*
  - [x] `changePassword(oldPassword, newPassword)` - Changement mot de passe
  - [x] `requestPasswordReset(email)` - Demande de réinitialisation
  - [x] `confirmPasswordReset(token, newPassword)` - Confirmation réinitialisation
  - [x] Persistance du token dans localStorage
  - [x] `authFetch()` - Requêtes authentifiées avec refresh automatique
  - [x] `getAuthHeaders()` - Headers Authorization pour requêtes API

### 2.2 Pages d'authentification
- [x] `pages/auth/login.vue` :
  - [x] Formulaire email/mot de passe avec design TI Madagascar
  - [x] Validation côté client (native)
  - [x] Gestion des erreurs (identifiants incorrects, compte désactivé)
  - [x] Lien "Mot de passe oublié"
  - [x] Redirection vers `/admin` après connexion
  - [x] Toggle affichage mot de passe
  - [x] Panneau branding avec logo TI
- [x] `pages/auth/forgot-password.vue` :
  - [x] Formulaire email
  - [x] Confirmation d'envoi avec message de succès
  - [x] Option de renvoi d'email
- [x] `pages/auth/reset-password.vue` :
  - [x] Formulaire nouveau mot de passe avec confirmation
  - [x] Indicateur de force du mot de passe
  - [x] Validation du token dans l'URL
  - [x] Redirection vers login après succès
  - [x] Gestion du token invalide/expiré

### 2.3 Gestion des sessions
- [x] Refresh token automatique sur erreur 401
- [x] Déconnexion automatique si token invalide
- [ ] Affichage des sessions actives (optionnel)

### 2.4 Middleware
- [x] `middleware/auth.ts` amélioré :
  - [x] Protection des routes `/admin/*`
  - [x] Redirection vers login avec URL de retour
  - [x] Redirection des utilisateurs connectés vers admin

---

## Phase 3 : Layout et Navigation Admin

### 3.1 Layout admin
- [x] `layouts/admin.vue` :
  - [x] Sidebar responsive (collapsible sur mobile)
  - [x] Header avec :
    - [x] Logo TI Madagascar
    - [x] Bouton toggle sidebar
    - [x] Toggle dark/light mode
    - [x] Menu utilisateur (profil, déconnexion)
  - [x] Breadcrumb dynamique
  - [x] Zone de contenu principal avec transitions
  - [x] Persistance de l'état collapsed dans localStorage

### 3.2 Navigation sidebar
- [x] Structure de menu complète :
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
- [x] Indicateurs visuels pour la page active
- [x] Submenus avec animation d'ouverture/fermeture
- [x] Auto-ouverture des parents actifs
- [ ] Badges pour notifications (ex: abonnés newsletter en attente)
- [ ] Permissions : masquer les items selon le rôle utilisateur

### 3.3 Composants de base admin
- [x] `components/admin/Sidebar.vue` - Navigation complète avec submenus
- [x] `components/admin/Header.vue` - Recherche, notifications, toggle theme
- [x] `components/admin/Breadcrumb.vue` - Navigation dynamique
- [x] `components/admin/UserMenu.vue` - Dropdown avec profil et déconnexion

### 3.4 Dashboard (placeholder)
- [x] `pages/admin/index.vue` - Page d'accueil avec KPIs et actions rapides

---

## Phase 4 : Composants Réutilisables

### 4.1 Composants de formulaire
- [x] `components/ui/FormField.vue` - Wrapper générique avec label, erreur, hint
- [x] `components/ui/FormInput.vue` - Input avec label, erreur, icône, password toggle
- [x] `components/ui/FormSelect.vue` - Select avec options normalisées
- [x] `components/ui/FormTextarea.vue` - Textarea avec compteur
- [x] `components/ui/FormCheckbox.vue` - Checkbox avec support array
- [x] `components/ui/FormRadio.vue` - Radio button
- [x] `components/ui/FormSwitch.vue` - Toggle switch
- [ ] `components/ui/FormDatePicker.vue` - Sélecteur de date
- [ ] `components/ui/FormFilePicker.vue` - Upload de fichier
- [ ] `components/ui/FormMoneyInput.vue` - Input monétaire (Ariary)

### 4.2 Composants de données
- [x] `components/ui/DataTable.vue` :
  - [x] Colonnes configurables (label, key, sortable, width, format)
  - [x] Tri par colonne (asc/desc)
  - [x] Pagination (page, limit, total)
  - [x] Recherche globale
  - [x] Actions par ligne via slots
  - [x] Sélection multiple (checkbox)
  - [x] États : chargement, vide, erreur
  - [ ] Filtres par colonne
  - [ ] Export sélection
- [ ] `components/ui/DataCard.vue` - Carte statistique avec icône
- [ ] `components/ui/DataList.vue` - Liste avec actions
- [ ] `components/ui/StatCard.vue` - Carte KPI avec évolution

### 4.3 Composants de feedback
- [x] `components/ui/Modal.vue` - Modal configurable (5 tailles, focus trap, keyboard)
- [ ] `components/ui/ConfirmDialog.vue` - Dialogue de confirmation (utilise Modal)
- [x] `components/ui/Toast.vue` - Notification toast individuelle
- [x] `components/ui/ToastContainer.vue` - Conteneur de toasts avec positions
- [x] `components/ui/Alert.vue` - Alertes inline (4 types, dismissible)
- [x] `components/ui/LoadingSpinner.vue` - Indicateur de chargement (5 tailles)
- [x] `components/ui/Skeleton.vue` - Placeholder de chargement
- [x] `components/ui/EmptyState.vue` - État vide avec action
- [x] `components/ui/ErrorState.vue` - État d'erreur avec retry

### 4.4 Composants de navigation
- [x] `components/ui/Tabs.vue` - Onglets (3 variantes: underline, pills, boxed)
- [x] `components/ui/TabPanel.vue` - Panel de contenu pour Tabs
- [ ] `components/ui/Dropdown.vue` - Menu déroulant
- [ ] `components/ui/Pagination.vue` - Pagination standalone
- [x] `components/ui/Badge.vue` - Badge avec variantes (7 couleurs, outline, dot)
- [x] `components/ui/Button.vue` - Bouton générique (7 variantes, 5 tailles, loading)

### 4.5 Système de notifications (composable)
- [x] `composables/useToast.ts` :
  - [x] `success(message, options)`
  - [x] `error(message, options)`
  - [x] `warning(message, options)`
  - [x] `info(message, options)`
  - [x] Auto-dismiss configurable
  - [x] Actions (label + onClick)
  - [x] Position configurable (6 positions)
  - [x] Max toasts limite

---

## Phase 5 : Service API

### 5.1 Configuration HTTP
- [x] `services/api.ts` :
  - [x] Instance fetch configurée avec `useApi()` composable
  - [x] Base URL depuis `runtimeConfig.public.apiBaseUrl`
  - [x] Intercepteur pour token Authorization via `getAuthHeaders()`
  - [x] Intercepteur pour refresh token sur 401
  - [x] Gestion globale des erreurs (`ApiError`, `handleApiError`)
  - [x] Typage des réponses (`PaginatedResponse<T>`, `PaginationParams`)
  - [x] Méthodes HTTP simplifiées (get, post, put, patch, delete)
  - [x] Upload de fichiers et téléchargement de blobs

### 5.2 Services par domaine
- [x] `services/geo.service.ts` - Régions, Districts, Communes (CRUD complet)
- [x] `services/comptes-administratifs.service.ts` - Comptes, Lignes, Rubriques, Catégories, Colonnes
- [x] `services/projets.service.ts` - Sociétés, Projets miniers, Revenus miniers
- [x] `services/documents.service.ts` - Documents, Upload, Téléchargement
- [x] `services/utilisateurs.service.ts` - Utilisateurs, Sessions, Rôles, Profil
- [x] `services/newsletter.service.ts` - Abonnés, Stats, Import/Export
- [x] `services/statistiques.service.ts` - Dashboard, Visites, Audit, Activité
- [x] `services/cms.service.ts` - Pages, Sections (10 types), Types de sections
- [x] `services/import.service.ts` - Import Excel/CSV, Templates, Historique
- [x] `services/export.service.ts` - Export multi-format, Rapports Word/PDF
- [x] `services/index.ts` - Barrel export pour tous les services

### 5.3 Composables de données
- [x] `composables/usePagination.ts` - Gestion pagination avec sync URL
- [x] `composables/useFilters.ts` - Gestion filtres avec debounce et sync URL
- [x] `composables/useAsyncState.ts` - État asynchrone avec loading/error/retry
- [x] `useAsyncList` - Liste paginée avec filtres intégrés

---

## Phase 6 : Dashboard Admin

### 6.1 Page dashboard
- [x] `pages/admin/index.vue` :
  - [x] Cartes KPI principales :
    - [x] Nombre de communes avec données
    - [x] Total recettes (exercice en cours)
    - [x] Total dépenses (exercice en cours)
    - [x] Nombre de projets miniers actifs
  - [x] Graphique évolution revenus (12 derniers mois)
  - [ ] Graphique répartition par région
  - [x] Liste des dernières activités
  - [ ] Statistiques de visite (7 derniers jours)
  - [ ] Alertes/notifications importantes

### 6.2 Widgets dashboard
- [x] `components/ui/StatCard.vue` - Carte KPI générique avec trend, progress
- [x] `components/admin/dashboard/KpiCards.vue` - Grille des 4 KPIs principaux
- [x] `components/admin/dashboard/RevenueChart.vue` - Graphique amCharts 5
- [ ] `components/admin/dashboard/RegionMap.vue` - *optionnel*
- [x] `components/admin/dashboard/RecentActivity.vue` - Feed d'activité
- [x] `components/admin/dashboard/QuickActions.vue` - Actions rapides
- [ ] `components/admin/dashboard/VisitStats.vue` - *optionnel*
- [ ] `components/admin/dashboard/PendingTasks.vue` - *optionnel*

### 6.3 Types et intégration
- [x] `types/index.ts` - Types globaux (DashboardStats, ActivityLog, etc.)
- [x] Intégration avec `useStatistiquesService` pour données réelles
- [x] Données de fallback en cas d'erreur API

---

## Phase 7 : Gestion des Données Financières

### 7.1 Comptes administratifs
- [x] `pages/admin/comptes-administratifs/index.vue` :
  - [x] Liste paginée avec filtres (région, exercice, statut)
  - [x] Actions : voir, éditer, publier, archiver, supprimer
  - [x] Indicateurs : statut publication, taux de complétion
  - [x] Modal création/édition de compte
- [x] `pages/admin/comptes-administratifs/[id].vue` :
  - [x] Détail avec onglets (Recettes, Dépenses, Équilibre, Historique)
  - [x] Édition inline des montants via LignesTable
  - [x] Cartes résumé (totaux, solde)
  - [x] Boutons d'action (valider, publier, exporter)
- [x] `components/admin/comptes/LignesTable.vue` :
  - [x] Tableau hiérarchique des lignes budgétaires
  - [x] Édition inline des valeurs
  - [x] Calcul des totaux

### 7.2 Recettes
- [x] `pages/admin/recettes/index.vue` :
  - [x] Tableau filtrable par région/exercice/section
  - [x] Cartes résumé (prévision, réalisation, taux)
  - [x] Lien vers compte administratif
- [ ] `pages/admin/recettes/[id].vue` - *optionnel, édition via compte*

### 7.3 Dépenses
- [x] `pages/admin/depenses/index.vue` :
  - [x] Tableau filtrable par région/exercice/section
  - [x] Cartes résumé (crédits, mandatements, taux)
  - [x] Lien vers compte administratif
- [ ] `pages/admin/depenses/[id].vue` - *optionnel, édition via compte*

### 7.4 Exercices
- [ ] `pages/admin/exercices/index.vue` - *à implémenter*
- [ ] `pages/admin/exercices/[id].vue` - *à implémenter*

### 7.5 Import de données
- [x] `pages/admin/import/index.vue` :
  - [x] Zone de drop pour fichier Excel/CSV
  - [x] Configuration (type, année, commune)
  - [x] Prévisualisation des données
  - [x] Téléchargement modèles Excel
  - [x] Historique des imports récents
  - [x] Modal résultat d'import

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
| 2 | Authentification | 95% |
| 3 | Layout et Navigation Admin | 90% |
| 4 | Composants Réutilisables | 75% |
| 5 | Service API | 100% |
| 6 | Dashboard Admin | 80% |
| 7 | Gestion des Données Financières | 85% |
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

**Avancement global estimé : 35%**

---

## Prochaines actions prioritaires

1. ~~**Phase 1** - Définir la charte graphique (couleurs, typographies, tokens CSS)~~ ✅ 80%
2. ~~**Phase 2** - Implémenter `useAuth.ts` et les pages de login~~ ✅ 95%
3. ~~**Phase 3** - Créer le layout admin avec sidebar~~ ✅ 90%
4. ~~**Phase 4** - Développer les composants UI de base (DataTable, Modal, Toast)~~ ✅ 75%
5. ~~**Phase 5** - Configurer les services API avec typage~~ ✅ 100%
6. ~~**Phase 6** - Créer le dashboard admin complet~~ ✅ 80%
7. ~~**Phase 7** - Implémenter la gestion des données financières~~ ✅ 85%
8. **Phase 8** - Implémenter la gestion de la géographie
9. **Phase 9** - Implémenter la gestion des projets miniers

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
