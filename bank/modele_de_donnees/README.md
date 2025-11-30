# Modèle de Données - Observatoire des Mines de Madagascar (MOM)

Ce document décrit le schéma de données proposé pour la plateforme MOM.

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           GESTION UTILISATEURS                          │
│  ┌──────────┐                                                           │
│  │   User   │ ─── Administrateurs et Éditeurs du back-office           │
│  └──────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          CONTENU PRINCIPAL                              │
│  ┌─────────────┐     ┌──────────┐     ┌────────────┐                   │
│  │  CaseStudy  │────▶│ Category │     │   Region   │                   │
│  │ (Études de  │     │(Théma-   │     │(Régions de │                   │
│  │    cas)     │     │ tiques)  │     │Madagascar) │                   │
│  └─────────────┘     └──────────┘     └────────────┘                   │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────┐     ┌──────────┐                                       │
│  │    Media    │     │ Keywords │                                       │
│  │(Photos/Docs)│     │(Mots-clés│                                       │
│  └─────────────┘     └──────────┘                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         PAGE D'ACCUEIL                                  │
│  ┌───────────────┐   ┌──────────────┐   ┌──────────┐   ┌─────────┐     │
│  │ StrategicAxis │   │ GalleryImage │   │  Partner │   │  News   │     │
│  │(Axes straté-  │   │  (Slider)    │   │(Parte-   │   │(Actua-  │     │
│  │   giques)     │   │              │   │ naires)  │   │ lités)  │     │
│  └───────────────┘   └──────────────┘   └──────────┘   └─────────┘     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      INTERACTION & SUIVI                                │
│  ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌────────────┐          │
│  │ Contact  │   │ PageVisit │   │ Download │   │ SiteConfig │          │
│  │(Signale- │   │(Visites)  │   │(Téléchar-│   │(Config.    │          │
│  │  ments)  │   │           │   │ gements) │   │ globale)   │          │
│  └──────────┘   └───────────┘   └──────────┘   └────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Entités détaillées

### 1. Gestion des utilisateurs

#### User
Gestion des comptes pour le back-office sécurisé.

| Champ | Type | Description |
|-------|------|-------------|
| id | String | Identifiant unique (CUID) |
| email | String | Email unique pour connexion |
| passwordHash | String | Mot de passe hashé (bcrypt) |
| firstName | String | Prénom |
| lastName | String | Nom |
| role | Enum | ADMIN ou EDITOR |
| isActive | Boolean | Compte actif/désactivé |
| lastLoginAt | DateTime | Dernière connexion |

### 2. Études de cas (Contenu central)

#### CaseStudy
L'entité principale représentant chaque étude de cas.

| Champ | Type | Description |
|-------|------|-------------|
| id | String | Identifiant unique |
| slug | String | URL-friendly (ex: "cas-ambatovy-2024") |
| title | String | Nom du cas |
| subtitle | String | Sous-titre/contexte |
| summary | String | Résumé court (pour cartes) |
| content | Text | Description détaillée (HTML/Markdown) |
| coverImage | String | Image de couverture |
| eventDate | DateTime | Date de l'événement |
| location | String | Lieu précis |
| regionId | FK | Lien vers la région |
| isPublished | Boolean | État de publication |
| viewCount | Int | Compteur de vues |

**Relations:**
- `author` → User (qui a créé/modifié)
- `region` → Region
- `categories` → Category[] (plusieurs catégories)
- `media` → Media[] (photos, vidéos, documents)
- `keywords` → Keyword[] (mots-clés)

#### Category
Catégories thématiques représentées par des icônes.

| Champ | Type | Description |
|-------|------|-------------|
| name | String | Nom de la catégorie |
| slug | String | Identifiant URL |
| icon | String | Icône FontAwesome |
| color | String | Couleur hex (#RRGGBB) |

**Exemples de catégories:**
- Environnement (contamination eau, déforestation)
- Droits fonciers (expropriation, compensation)
- Santé publique
- Transparence financière
- Consultation communautaire

#### Region
Régions de Madagascar pour géolocalisation.

| Champ | Type | Description |
|-------|------|-------------|
| name | String | Nom de la région |
| code | String | Code officiel |

### 3. Contenu de la page d'accueil

#### StrategicAxis
Les 4 axes stratégiques et missions (cartes en grille).

| Champ | Type | Description |
|-------|------|-------------|
| title | String | Titre de l'axe |
| description | String | Texte explicatif court |
| backgroundImage | String | Image de fond |
| linkUrl | String | Lien vers "À propos" |
| sortOrder | Int | Ordre d'affichage |

#### GalleryImage
Images du slider de la page d'accueil.

| Champ | Type | Description |
|-------|------|-------------|
| title | String | Titre optionnel |
| imageUrl | String | URL de l'image |
| linkUrl | String | Lien au clic |
| sortOrder | Int | Ordre dans le slider |

#### Partner
Partenaires avec logos défilants.

| Champ | Type | Description |
|-------|------|-------------|
| name | String | Nom du partenaire |
| logo | String | URL du logo |
| websiteUrl | String | Lien vers leur site |

#### News
Actualités avec date, du plus récent au plus ancien.

| Champ | Type | Description |
|-------|------|-------------|
| title | String | Titre de l'actualité |
| summary | String | Description courte |
| content | Text | Contenu complet |
| coverImage | String | Image d'illustration |
| externalUrl | String | Lien externe (bouton "view") |
| publishedAt | DateTime | Date de publication |

### 4. Gestion des médias

#### Media
Stockage centralisé de tous les fichiers uploadés.

| Champ | Type | Description |
|-------|------|-------------|
| filename | String | Nom original |
| filepath | String | Chemin de stockage |
| url | String | URL publique |
| mimeType | String | Type MIME |
| mediaType | Enum | IMAGE, VIDEO, AUDIO, DOCUMENT |
| fileSize | Int | Taille en octets |
| downloadCount | Int | Compteur téléchargements |

### 5. Signalement de cas

#### Contact
Formulaire pour rapporter des cas (footer).

| Champ | Type | Description |
|-------|------|-------------|
| name | String | Nom (optionnel) |
| email | String | Email (optionnel) |
| subject | String | Sujet |
| message | Text | Message détaillé |
| status | Enum | NEW, IN_REVIEW, PROCESSED, ARCHIVED |
| isAnonymous | Boolean | Signalement anonyme |

### 6. Statistiques et suivi

#### PageVisit
Suivi des visites pour les statistiques du back-office.

| Champ | Type | Description |
|-------|------|-------------|
| path | String | URL visitée |
| referrer | String | Page de provenance |
| visitedAt | DateTime | Date/heure de visite |

#### Download
Suivi des téléchargements de documents.

| Champ | Type | Description |
|-------|------|-------------|
| mediaId | String | Fichier téléchargé |
| downloadedAt | DateTime | Date/heure |

### 7. Configuration

#### SiteConfig
Paramètres configurables du site.

| Clé | Description |
|-----|-------------|
| site_title | Titre du site |
| site_description | Description SEO |
| contact_email | Email de contact |
| contact_address | Adresse physique |
| contact_phone | Téléphone |

#### AboutContent
Sections de la page "À propos".

| Section | Description |
|---------|-------------|
| mission | Mission de l'Observatoire |
| vision | Vision |
| history | Historique |
| team | Équipe |

## Notes d'implémentation

### Sécurité
- Mots de passe hashés avec bcrypt (coût 12+)
- Sessions JWT avec refresh tokens
- Validation des uploads (types MIME, taille max)
- Protection CSRF pour les formulaires

### SEO
- Slugs uniques pour URLs propres
- Champs meta pour chaque contenu
- Sitemap automatique

### Performance
- Index sur les champs de recherche fréquents
- Pagination des listes
- Cache des requêtes fréquentes
- Images optimisées (compression, formats modernes)

### Évolutivité
- Structure flexible pour le contenu des études de cas
- Mots-clés dynamiques
- Catégories extensibles
- Configuration via SiteConfig
