# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Platform for the Mining Observatory of Madagascar (Observatoire des Mines de Madagascar - MOM), developed by Transparency International Madagascar and PCQVP Madagascar. The platform monitors governance, transparency, and sustainability in mining resource management, providing visibility into community impacts and mining revenue utilization.

Built with Nuxt 4, Vue 3, Tailwind CSS v4, with backend powered by Nitro, Prisma ORM, and PostgreSQL.

## Essential Commands

**Development:**
```bash
pnpm install          # Install dependencies (MUST use pnpm, not npm)
pnpm dev              # Start dev server at http://localhost:3000
```

**Production:**
```bash
pnpm build            # Build for production (outputs to .output/)
pnpm preview          # Preview production build locally
pnpm generate         # Generate static HTML (SSG)
```

**Firebase Deployment:**
```bash
pnpm firebase:deploy  # Build and deploy to Firebase Hosting
pnpm firebase:preview # Build and deploy to Firebase preview channel
```

## Critical Setup Requirements

1. **Package Manager**: MUST use `pnpm`. The project uses pnpm lockfile v9.0.

2. **Environment Variables**: Create `.env` file based on `.env.example`:
   - `NUXT_PUBLIC_API_BASE_URL`: Backend API URL (defaults to http://localhost:8000)
   - `DATABASE_URL`: PostgreSQL connection string for Prisma

3. **Database Setup** (when Prisma models are defined):
   ```bash
   pnpm prisma generate  # Generate Prisma client
   pnpm prisma db push   # Push schema to database
   pnpm prisma migrate dev # Run migrations
   ```

## Architecture Overview

### Project Structure

```
app/
├── assets/css/          # Global styles (main.css with Tailwind v4)
├── components/          # Vue components (auto-imported)
│   ├── ThemeToggle.vue  # Dark/light mode toggle
│   └── HeroSection.vue  # Landing page hero
├── composables/         # Vue composables (auto-imported)
│   └── useDarkMode.ts   # Dark mode state management
├── layouts/             # Page layouts
│   └── default.vue      # Default layout with page transitions
├── pages/               # File-based routing
│   └── index.vue        # Home page
└── plugins/             # Nuxt plugins
    ├── amcharts.client.ts    # AmCharts 5 (data visualization)
    ├── fontawesome.ts        # FontAwesome icons
    └── firebase.client.ts    # Firebase client (legacy, may be removed)

prisma/
└── schema.prisma        # Prisma schema (PostgreSQL)

server/                  # Nitro server routes (to be created)
└── api/                 # API endpoints

bank/                    # Project documentation and data
├── docs/                # Requirements and specifications
└── mode_de_donnees/     # Data models and migrations

public/                  # Static assets
├── images/              # Images and media
└── data/                # Static data files
```

### Routing System

Nuxt auto-routing from `app/pages/`:
- `pages/index.vue` → `/`
- Additional pages will be auto-routed based on file structure

Pages can specify layouts via `definePageMeta({ layout: 'layoutname' })`.

### Backend Architecture (Nitro + Prisma)

**Server Routes**: API endpoints will be created in `server/api/` directory
- Files in `server/api/` automatically become API routes
- Example: `server/api/collectivites.get.ts` → `/api/collectivites`

**Database**:
- ORM: Prisma (configured for PostgreSQL)
- Client output: `app/generated/prisma/`
- Schema location: `prisma/schema.prisma`

**Important**: Server routes run in Nitro engine, not in browser. Use Prisma client for database access.

### Styling System

**Tailwind CSS v4**: Primary framework (configured via Vite plugin in nuxt.config.ts)

**Dark Mode Implementation**:
- Composable: `app/composables/useDarkMode.ts` (theme state, persistence, system detection)
- Component: `ThemeToggle.vue` (toggle button with sun/moon icons)
- Persistence: localStorage with key `theme`
- Auto-detection: Detects system preference on first visit
- All components support dark mode with `dark:` prefix classes

**CRITICAL - Tailwind v4 Dark Mode Configuration**:

Tailwind CSS v4 requires explicit dark mode configuration in CSS file:

```css
@import "tailwindcss";

/* Enable class-based dark mode in Tailwind v4 */
@variant dark (&:where(.dark, .dark *));
```

This `@variant` declaration in `app/assets/css/main.css` is **mandatory**. Without it, dark mode classes (e.g., `dark:bg-gray-900`) will NOT work, even if the `.dark` class is present on the HTML element.

**Tailwind v4 Breaking Changes**:

1. **Opacity Syntax** - Old utilities no longer supported:
   - ❌ Old (v3): `bg-green-500 bg-opacity-50`, `text-blue-600 text-opacity-75`
   - ✅ New (v4): `bg-green-500/50`, `text-blue-600/75`
   - Use `/opacity` directly after color utility

2. **Cursor Pointer** - No longer default on buttons:
   - Must explicitly add `cursor-pointer` class to all interactive elements

**Other Styling**:
- **Animate.css**: Available globally for animations
- **FontAwesome**: Comprehensive icon library configured in `plugins/fontawesome.ts`
- **Component Styles**: Supports `<style lang="scss" scoped>`

### Page Transitions

Configured in `nuxt.config.ts`:
- Name: `page`
- Mode: `out-in`
- Animation: Slide from right (defined in layouts/default.vue)

### Plugins

**AmCharts 5** (`plugins/amcharts.client.ts`):
- Data visualization library
- Client-side only (`.client.ts`)
- For charts and graphs

**FontAwesome** (`plugins/fontawesome.ts`):
- Comprehensive icon library
- Solid, regular, and brand icon sets
- Use via `<font-awesome-icon>` component

**Firebase** (`plugins/firebase.client.ts`):
- Legacy from previous project
- May be removed if not needed for current project

## Module Configuration

Key Nuxt modules in `nuxt.config.ts`:
- `@nuxt/image`: Image optimization
- `@nuxt/content`: Markdown/MDC content management
- `@nuxt/ui`: UI component library
- `@nuxt/test-utils`: Testing utilities (installed but not configured)
- `@tailwindcss/vite`: Tailwind CSS v4 via Vite

## Runtime Configuration

Environment variables accessible via `runtimeConfig`:
```typescript
runtimeConfig: {
  public: {
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  }
}
```

Access in components:
```typescript
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl
```

## Important Development Notes

- **Auto-imports**: Components, composables, and utilities are auto-imported by Nuxt
- **DevTools**: Enabled in dev mode for debugging
- **TypeScript**: Configuration references Nuxt-generated configs in `.nuxt/`
- **Compatibility Date**: Set to 2025-07-15
- **Dark Mode**: Fully implemented - always use `dark:` prefix when adding new components
- **Legacy Files**: Project was recycled from previous project - some unused files may exist

## Database & Prisma Workflow

When working with database models:

1. **Define Schema**: Edit `prisma/schema.prisma`
2. **Generate Client**: `pnpm prisma generate` (outputs to `app/generated/prisma/`)
3. **Create Migration**: `pnpm prisma migrate dev --name migration_name`
4. **Push to DB**: `pnpm prisma db push` (for prototyping without migrations)
5. **Prisma Studio**: `pnpm prisma studio` (visual database browser)

Import Prisma client in server routes:
```typescript
import { PrismaClient } from '~/generated/prisma'
const prisma = new PrismaClient()
```

## Claude Assistant Guidelines

### Package Installation & Deployment Operations

**IMPORTANT**: When package installation or deployment operations are required, Claude MUST:

1. **Provide the commands** instead of executing them directly
2. **Explain what needs to be done** and why
3. **Wait for user confirmation** after execution

This applies to operations requiring elevated privileges or special access:

**Package Installation**:
```bash
pnpm add package-name          # Add production dependency
pnpm add -D package-name       # Add dev dependency
pnpm remove package-name       # Remove dependency
```

**Prisma Operations**:
```bash
pnpm add -D prisma @prisma/client  # Install Prisma
pnpm prisma init                    # Initialize Prisma
```

**Database Operations**:
```bash
pnpm prisma migrate dev        # Create and apply migration
pnpm prisma db push            # Push schema without migration
pnpm prisma generate           # Generate Prisma Client
```

**Rationale**: Claude doesn't have root/admin access for certain operations. Providing commands allows the user to execute them with proper permissions.

## Project Context

**Project Name**: Observatoire des Mines de Madagascar (MOM)

**Organizations**:
- Transparency International - Initiative Madagascar (TIMG)
- Publiez Ce Que Vous Payez Madagascar (PCQVP)

**Purpose**: Monitor and promote transparency in mining governance, track community impacts, ensure accountability in mining revenue management.

**Documentation**: See `bank/docs/cahier_des_charges/` for detailed requirements and specifications.
