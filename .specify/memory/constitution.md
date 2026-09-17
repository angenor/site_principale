<!--
Sync Impact Report
- Version : (modèle) → 1.0.0
- Principes ajoutés : I à VI (première ratification)
- Sections ajoutées : Contraintes techniques, Workflow de développement, Gouvernance
- Modèles à vérifier : .specify/templates/plan-template.md (Constitution Check) ✅ compatible
- TODO : aucun
-->

# Observatoire des Mines de Madagascar (MOM) — Constitution

## Principes fondamentaux

### I. Transparence et exactitude des données (NON NÉGOCIABLE)
La plateforme est un outil de redevabilité publié par TI Madagascar et PCQVP Madagascar.
Toute donnée publiée (cas, revenus miniers, ressources, actualités) DOIT être traçable
à sa source et validée par un administrateur avant publication. Aucune donnée fictive ou
de démonstration ne DOIT atteindre la production. Les signalements citoyens (`/signaler`)
DOIVENT protéger l'anonymat du signalant et ne jamais exposer publiquement ses données personnelles.

### II. Français d'abord, accessibilité pour le public malgache
L'interface publique et l'administration sont en français (locale `fr_MG`), avec une
orthographe et des accents corrects. Les pages publiques DOIVENT rester utilisables sur
mobile et avec une connexion lente (images optimisées via `@nuxt/image`, chargement différé
des graphiques AmCharts côté client). Contrastes et navigation clavier conformes WCAG 2.1 AA.

### III. Stack unifiée Nuxt full-stack
Une seule application : Nuxt 4 / Vue 3 pour le front, Nitro (`server/api/`) pour l'API,
Prisma + PostgreSQL pour les données. Pas de nouveau service ni de nouveau framework sans
justification écrite dans le `plan.md` (section « Complexity Tracking »). Le gestionnaire de
paquets est exclusivement `pnpm`. Réutiliser les utilitaires existants (`server/utils/prisma.ts`,
`server/utils/auth.ts`, `server/utils/editorjs.ts`) plutôt que les dupliquer.

### IV. Sécurité et contrôle d'accès
Toute route `server/api/admin/**` DOIT vérifier l'authentification et le rôle côté serveur
(jamais uniquement via le middleware client `app/middleware/auth.ts`). Les entrées utilisateur
DOIVENT être validées côté serveur ; les contenus riches (Editor.js) DOIVENT être assainis avant
rendu. Aucun secret dans le dépôt : configuration via `.env` / `runtimeConfig`.

### V. Cohérence UI : Tailwind v4 et mode sombre
Tout nouveau composant utilise Tailwind CSS v4 (syntaxe d'opacité `bg-x/50`, `cursor-pointer`
explicite sur les éléments interactifs) et DOIT supporter le mode sombre via les classes `dark:`.
Les icônes passent par FontAwesome ; les composants Nuxt UI sont privilégiés avant d'en créer de nouveaux.

### VI. Simplicité et évolutions de schéma maîtrisées
Commencer simple (YAGNI). Toute modification de `prisma/schema.prisma` DOIT être décrite dans
le `data-model.md` de la feature, rester rétrocompatible avec les données en production, et
préciser la commande de migration à exécuter sur le VPS (voir `bank/GUIDE-MIGRATION.md`).

## Contraintes techniques

- **Runtime** : Node 22, Nuxt 4, Nitro, Prisma 6, PostgreSQL ; déploiement Docker Compose sur le VPS.
- **Contenu** : `@nuxt/content` pour le contenu éditorial statique, Prisma pour le contenu administrable.
- **Visualisation** : AmCharts 5 uniquement, en plugin client (`.client.ts`).
- **Performance** : pages publiques rendues côté serveur (SEO, sitemap), pagination obligatoire
  sur les listes d'API.
- **Opérations sensibles** : installation de paquets, migrations de base et déploiements sont
  proposés sous forme de commandes à l'utilisateur, jamais exécutés automatiquement par l'agent.

## Workflow de développement

1. `/speckit-specify` → `spec.md` (quoi et pourquoi, sans détail technique).
2. `/speckit-clarify` si des zones restent ambiguës.
3. `/speckit-plan` → `plan.md`, `data-model.md`, contrats d'API ; vérification de cette constitution.
4. `/speckit-tasks` → `tasks.md`, puis `/speckit-analyze` pour la cohérence.
5. `/speckit-implement`.
6. Avant fusion : `pnpm build` réussit, parcours principaux vérifiés en clair et en sombre,
   routes admin testées sans session (doivent renvoyer 401/403).

## Gouvernance

Cette constitution prévaut sur les autres pratiques du projet ; `CLAUDE.md` fournit les
consignes d'exécution au quotidien. Toute dérogation DOIT être justifiée dans le `plan.md`
de la feature concernée. Les amendements passent par `/speckit-constitution`, avec incrément
de version sémantique (MAJOR : suppression/redéfinition d'un principe ; MINOR : ajout ;
PATCH : clarification).

**Version**: 1.0.0 | **Ratified**: 2026-09-17 | **Last Amended**: 2026-09-17
