# Configuration Supabase

Ce guide décrit comment configurer Supabase pour ce projet Nuxt 4.

## Prérequis

- Compte Supabase (gratuit) : [https://supabase.com](https://supabase.com)
- Node.js et pnpm installés

## Installation

Les dépendances Supabase sont déjà installées dans le projet :
- `@supabase/supabase-js` : Client JavaScript pour Supabase
- `@nuxtjs/supabase` : Module Nuxt pour l'intégration Supabase

## Configuration étape par étape

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - **Name** : Nom de votre projet (ex: "Collectivites Territoriales")
   - **Database Password** : Choisissez un mot de passe fort (gardez-le en sécurité!)
   - **Region** : Choisissez la région la plus proche (ex: Europe (Paris) pour la France)
4. Cliquez sur "Create new project"
5. Attendez quelques minutes que le projet soit créé

### 2. Récupérer les clés API

1. Dans le dashboard Supabase, allez dans **Project Settings** → **API**
2. Notez ces deux valeurs :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** : `eyJhbGc...` (clé publique, longue chaîne)

### 3. Configurer les variables d'environnement

1. Ouvrez le fichier `.env` à la racine du projet
2. Remplacez les valeurs placeholder par vos vraies clés :

```bash
# Supabase Configuration
SUPABASE_URL="https://votre-project-id.supabase.co"
SUPABASE_KEY="votre-anon-public-key"
```

3. **Important** : Ne commitez JAMAIS le fichier `.env` dans Git (déjà dans `.gitignore`)

### 4. Redémarrer le serveur

```bash
# Arrêtez le serveur actuel (Ctrl+C)
# Puis redémarrez :
pnpm dev
```

## Vérification de l'installation

### Page de test

Une page de test a été créée pour vérifier la connexion Supabase :

1. Démarrez le serveur : `pnpm dev`
2. Ouvrez votre navigateur : [http://localhost:3000/test-supabase](http://localhost:3000/test-supabase)
3. Vérifiez que :
   - La configuration est détectée (URL et clé)
   - Le client Supabase est initialisé
   - Le bouton "Tester la connexion" fonctionne

Si tout est vert ✅, votre configuration est correcte !

## Utilisation dans le code

### Composables auto-importés

Le module `@nuxtjs/supabase` fournit des composables auto-importés :

```vue
<script setup>
// Accéder au client Supabase
const supabase = useSupabaseClient()

// Récupérer l'utilisateur connecté
const user = useSupabaseUser()

// Exemple : Récupérer des données
const { data, error } = await supabase
  .from('collectivites')
  .select('*')
</script>
```

### Exemples d'utilisation

#### Lecture de données

```typescript
const { data, error } = await supabase
  .from('votre_table')
  .select('*')
  .limit(10)
```

#### Insertion de données

```typescript
const { data, error } = await supabase
  .from('votre_table')
  .insert([
    { nom: 'Paris', type: 'Commune' }
  ])
```

#### Mise à jour

```typescript
const { data, error } = await supabase
  .from('votre_table')
  .update({ nom: 'Nouveau nom' })
  .eq('id', 123)
```

#### Suppression

```typescript
const { data, error } = await supabase
  .from('votre_table')
  .delete()
  .eq('id', 123)
```

## Création de tables

### Option 1 : Interface graphique (recommandé pour débuter)

1. Dans le dashboard Supabase, allez dans **Table Editor**
2. Cliquez sur "New table"
3. Définissez les colonnes
4. Activez Row Level Security (RLS) si nécessaire

### Option 2 : SQL Editor

1. Dans le dashboard, allez dans **SQL Editor**
2. Écrivez votre SQL :

```sql
-- Exemple : Table des collectivités territoriales
CREATE TABLE collectivites (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,
  code_insee TEXT UNIQUE,
  population INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer Row Level Security
ALTER TABLE collectivites ENABLE ROW LEVEL SECURITY;

-- Créer une policy pour la lecture publique
CREATE POLICY "Lecture publique" ON collectivites
  FOR SELECT
  USING (true);
```

## Sécurité : Row Level Security (RLS)

Par défaut, activez RLS sur toutes vos tables pour sécuriser l'accès :

```sql
-- Activer RLS
ALTER TABLE nom_table ENABLE ROW LEVEL SECURITY;

-- Policy pour lecture publique
CREATE POLICY "Lecture publique" ON nom_table
  FOR SELECT
  USING (true);

-- Policy pour insertion (utilisateurs authentifiés uniquement)
CREATE POLICY "Insertion authentifiée" ON nom_table
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

## Authentification (optionnel)

Le module Supabase inclut l'authentification. Pour l'activer :

```vue
<script setup>
const supabase = useSupabaseClient()

// Connexion par email
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Déconnexion
await supabase.auth.signOut()

// Récupérer l'utilisateur actuel
const user = useSupabaseUser()
</script>
```

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation @nuxtjs/supabase](https://supabase.nuxtjs.org/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Dashboard Supabase](https://supabase.com/dashboard)

## Dépannage

### Erreur "Invalid API key"
- Vérifiez que vous avez copié la bonne clé (anon public, pas service_role)
- Vérifiez qu'il n'y a pas d'espaces avant/après la clé dans .env

### Erreur "Project URL is required"
- Vérifiez que SUPABASE_URL est bien défini dans .env
- Redémarrez le serveur après modification de .env

### Erreur de connexion
- Vérifiez votre connexion Internet
- Vérifiez que le projet Supabase est bien actif dans le dashboard

### Les données ne s'affichent pas
- Vérifiez les policies RLS de votre table
- Utilisez la console du navigateur pour voir les erreurs détaillées
