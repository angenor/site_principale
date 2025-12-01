# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuxt 4 frontend for the **Plateforme de Suivi des Revenus Miniers** - a platform tracking mining revenues for territorial collectivities in Madagascar, built for **Transparency International - Initiative Madagascar (TI MG)**.

The backend is built with **FastAPI** (see `../backend_collectivites_territoriales/`).

## Essential Commands

```bash
pnpm install          # Install dependencies (MUST use pnpm, not npm/yarn)
pnpm dev              # Start dev server at http://localhost:3000
pnpm build            # Build for production
pnpm preview          # Preview production build locally
pnpm generate         # Generate static HTML (SSG)
```

**Firebase Deployment:**
```bash
pnpm firebase:deploy   # Generate static + deploy to Firebase Hosting
pnpm firebase:preview  # Deploy to preview channel
```

## Backend Integration

- Frontend: `http://localhost:3000`
- Backend (FastAPI): `http://localhost:8000` (configured via `NUXT_PUBLIC_API_BASE_URL`)
- API docs: http://localhost:8000/docs

Configure in `.env`:
```
NUXT_PUBLIC_API_BASE_URL="http://localhost:8000"
```

## Architecture

### Directory Structure
```
app/
├── pages/              # Auto-routed pages (index.vue, compte-administratif.vue)
├── components/         # Vue components (HeroSection, ThemeToggle)
├── composables/        # Shared logic (useDarkMode, useMockData)
├── layouts/            # Page layouts (default.vue, mylayout.vue)
├── middleware/         # Route guards (auth.ts, global-auth.global.ts)
├── plugins/            # Client plugins (amcharts.client.ts, fontawesome.ts, firebase.client.ts)
├── types/              # TypeScript interfaces (comptes-administratifs.ts, auth.ts, collectivites.ts)
└── assets/css/         # Tailwind CSS (main.css)
```

### Key Type Definitions

Located in `app/types/`:
- **comptes-administratifs.ts**: Budget line items (RubriqueBudgetaire, LigneBudgetaire, ColonneDynamique)
- **auth.ts**: User, Role, LoginCredentials, LoginResponse
- **collectivites.ts**: Geographic entities (Region, Commune, etc.)

### Plugins

- **amCharts 5** (`amcharts.client.ts`): Charts available via `$am5` injection (xy, percent, radar, map modules)
- **FontAwesome** (`fontawesome.ts`): Icons registered globally as `<font-awesome-icon>`
- **Firebase** (`firebase.client.ts`): Optional Firebase integration

## Tailwind CSS v4 (CRITICAL)

### Dark Mode Setup
Dark mode requires explicit configuration in `app/assets/css/main.css`:
```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

Without this `@variant`, `dark:` prefix classes won't work.

### Breaking Changes from v3

**Opacity syntax changed:**
```html
<!-- Old (broken) -->
<div class="bg-green-500 bg-opacity-50">

<!-- New (required) -->
<div class="bg-green-500/50">
```

**Cursor pointer not automatic:**
```html
<!-- Always add cursor-pointer to buttons -->
<button class="cursor-pointer">Click me</button>
```

## Authentication

Protected routes use the `auth.ts` middleware:
- Routes starting with `/admin` require authentication
- Authenticated users redirected away from `/auth/login` and `/auth/register`
- Uses `useAuth()` composable (expects `isAuthenticated` ref)

## Data Model

The administrative accounts (`Comptes Administratifs`) follow Madagascar's budget structure:
- **Sections**: fonctionnement, investissement, ordre, equilibre
- **Types**: recette (revenue), depense (expense), equilibre
- **Hierarchy**: Categories → Rubriques → Lignes budgetaires

Reference data model: `bank/modele_de_donnees/`

## Development Notes

- Auto-imports enabled for components, composables, and utilities
- DevTools enabled in dev mode
- Page transitions configured (`out-in` mode)
- No testing framework currently configured
- Compatibility date: 2025-07-15
