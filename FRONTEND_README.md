# Frontend - Plateforme de Suivi des Revenus Miniers

## Page d'Accueil Implémentée

La page d'accueil de la plateforme est maintenant complète avec **des données mock** pour les tests.

## Structure Créée

### 📁 Composables (app/composables/)

#### useMockData.ts
Composable contenant toutes les données mock pour les tests :
- **5 régions** : Analamanga, Vakinankaratra, Atsinanana, Itasy, Boeny
- **6 districts** : Ankazobe, Anjozorobe, Antananarivo, Antsirabe I, Betafo, Toamasina I
- **5 communes** : Ankazobe, Ambatomanga, Miantso, Betafo, Mandrosohasina
- **Comptes administratifs 2024** avec données financières complètes :
  - Recettes fiscales et non fiscales
  - Dépenses de fonctionnement
  - Calculs automatiques (taux d'exécution, reste à recouvrer)

### 📁 Composants (app/components/)

#### 1. PlatformHeader.vue
En-tête de la plateforme avec :
- Titre et logo de l'organisation
- Description de la mission
- Bande informative

#### 2. SelectionCollectivite.vue
Formulaire de sélection en cascade :
- Menu déroulant Région
- Menu déroulant District (filtré par région)
- Menu déroulant Commune (filtré par district)
- Sélecteur d'année (2020-2024)
- Boutons "Réinitialiser" et "Afficher le Compte"
- Affichage du chemin sélectionné

#### 3. TableauFinancier.vue
Tableau financier dynamique avec :
- Onglets Recettes / Dépenses
- Tableau hiérarchique avec 3 niveaux d'indentation
- Colonnes : Budget primitif, Budget additionnel, Modifications, Prévisions définitives, OR admis, Recouvrement, Reste à recouvrer, Taux d'exécution
- Code couleur pour les taux d'exécution :
  - 🟢 Vert : ≥ 100%
  - 🟠 Orange : 80-99%
  - 🔴 Rouge : < 80%
- Boutons d'action : Imprimer, Télécharger Excel, Télécharger Word
- Ligne de totaux
- Support de l'impression

### 📄 Page (app/pages/)

#### index.vue
Page d'accueil complète avec :
- En-tête de plateforme
- Formulaire de sélection
- Message d'accueil avec informations
- Indicateur de chargement
- Message d'erreur
- Tableau financier
- 3 cards informatives (Transparence, Redevabilité, Accessibilité)
- Footer avec liens
- Bouton "Retour en haut"
- Transitions fluides
- Support de l'impression

## Démarrer l'Application

```bash
# Installer les dépendances (si pas déjà fait)
pnpm install

# Lancer le serveur de développement
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Comment Tester

### Étape 1 : Sélectionner une collectivité

1. Choisir une **région** (ex: Analamanga)
2. Choisir un **district** (ex: Ankazobe)
3. Choisir une **commune** (ex: Ankazobe)
4. Choisir une **année** (2024 par défaut)
5. Cliquer sur **"Afficher le Compte"**

### Étape 2 : Explorer le tableau

- **Onglet Recettes** : Voir toutes les recettes fiscales et non fiscales
- **Onglet Dépenses** : Voir toutes les dépenses de fonctionnement
- Observer les **couleurs** sur les taux d'exécution
- Vérifier les **totaux** en bas du tableau

### Étape 3 : Tester les fonctionnalités

- **Imprimer** : Cliquer sur "Imprimer" (Ctrl+P)
- **Télécharger** : Cliquer sur "Excel" ou "Word" (message d'alerte pour l'instant)
- **Scroll** : Descendre en bas → bouton "Retour en haut" apparaît
- **Réinitialiser** : Cliquer sur "Réinitialiser" pour effacer les sélections

## Données Mock Disponibles

### Communes avec données complètes

| Région | District | Commune | Année | Statut |
|--------|----------|---------|-------|--------|
| Analamanga | Ankazobe | Ankazobe | 2024 | ✅ Publié |
| Analamanga | Ankazobe | Ambatomanga | 2024 | ✅ Publié |
| Analamanga | Ankazobe | Miantso | 2024 | ✅ Publié |
| Vakinankaratra | Betafo | Betafo | 2024 | ✅ Publié |
| Vakinankaratra | Betafo | Mandrosohasina | 2024 | ✅ Publié |

### Structure des Données Financières

#### Recettes (~286M Ar)
- Recettes fiscales (28M Ar)
  - Impôts sur les revenus (5M Ar)
  - Impôts sur le patrimoine (20M Ar)
  - Impôts sur biens et services (3M Ar)
- Recettes non fiscales (258M Ar)
  - Dotations globales (43M Ar)
  - **Produits des ristournes minières (200M Ar)** ⭐
  - Redevances (15M Ar)

#### Dépenses (~94.5M Ar)
- Charges de personnel (51.5M Ar)
- Achats de biens (20M Ar)
- Achats de services (23M Ar)

## Fonctionnalités Implémentées

✅ Sélection en cascade (Région → District → Commune)
✅ Chargement simulé avec spinner
✅ Affichage du tableau hiérarchique
✅ Onglets Recettes/Dépenses
✅ Calcul automatique des totaux
✅ Code couleur pour les taux d'exécution
✅ Formatage des montants (séparateurs de milliers)
✅ Bouton d'impression
✅ Boutons de téléchargement (Excel/Word) - préparés
✅ Responsive design (mobile/tablet/desktop)
✅ Transitions fluides
✅ Scroll to top
✅ Message d'accueil
✅ Gestion des erreurs
✅ Support de l'impression (print CSS)

## Fonctionnalités À Implémenter (avec Supabase)

⏳ Génération réelle de fichiers Excel (avec SheetJS)
⏳ Génération réelle de fichiers Word (avec docx.js)
⏳ Connexion à l'API Supabase
⏳ Authentification utilisateurs
⏳ Newsletter
⏳ Analytics des visites
⏳ Tracking des téléchargements
⏳ Back-office d'administration
⏳ Gestion des utilisateurs (admin, éditeur, lecteur)

## Styles et Design

### Couleurs Principales
- **Bleu principal** : #1d4ed8 (blue-700)
- **Bleu dégradé** : from-blue-800 to-blue-600
- **Vert (succès)** : #059669 (green-700)
- **Orange (warning)** : #d97706 (orange-700)
- **Rouge (danger)** : #dc2626 (red-700)

### Typographie
- Police système (sans-serif)
- Titres : font-bold
- Tableaux : font-mono pour les chiffres

### Responsive
- Mobile first
- Breakpoints :
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

## Structure du Projet

```
app/
├── components/
│   ├── PlatformHeader.vue        # En-tête de la plateforme
│   ├── SelectionCollectivite.vue # Formulaire de sélection
│   ├── TableauFinancier.vue      # Tableau financier
│   └── Nav.vue                   # Navigation (existant)
├── composables/
│   └── useMockData.ts            # Données mock
├── pages/
│   └── index.vue                 # Page d'accueil
├── layouts/
│   └── default.vue               # Layout par défaut
└── assets/
    └── css/
        └── main.css              # Styles globaux (Tailwind)
```

## Points Techniques

### Auto-imports
Tous les composants et composables sont **auto-importés** par Nuxt. Pas besoin d'importer manuellement.

### TypeScript
Le code utilise TypeScript avec des interfaces typées :
- `Region`
- `District`
- `Commune`
- `LigneBudgetaire`
- `CompteAdministratif`

### Réactivité Vue 3
- `ref()` pour les valeurs primitives
- `computed()` pour les valeurs calculées
- `watch()` pour les watchers
- Composition API

### Tailwind CSS
Utilise Tailwind CSS pour tous les styles avec des classes utilitaires.

## Prochaines Étapes

1. **Tester la page localement** : `pnpm dev`
2. **Vérifier le responsive** : DevTools → mode mobile
3. **Tester l'impression** : Ctrl+P
4. **Vérifier les transitions** : Sélectionner différentes communes
5. **Préparer l'intégration Supabase** : Voir `/bank/modele_de_donnees/IMPLEMENTATION.md`

## Notes Importantes

- Les données sont **entièrement mock** pour l'instant
- Les téléchargements Excel/Word affichent une alerte (TODO)
- Le système est prêt pour l'intégration Supabase
- Toutes les fonctionnalités de base sont opérationnelles

---

**Développé pour** : PCQVP Madagascar / TI Madagascar
**Date** : Novembre 2024
**Version** : 1.0.0 (Mock Data)
