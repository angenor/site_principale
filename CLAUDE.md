# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Nuxt 4 web application for managing information about French territorial authorities ("Collectivités Territoriales"). Built with Vue 3, Nuxt, Supabase (PostgreSQL backend), and Tailwind CSS.

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

**Database:**
```bash
# Database is managed through Supabase Dashboard
# Connection string in .env file (SUPABASE_URL and SUPABASE_KEY)
```

## Critical Setup Requirements

1. **Package Manager**: MUST use `pnpm`. The project uses pnpm lockfile v9.0.
2. **Backend**: Supabase for database, authentication, and storage. Configure `SUPABASE_URL` and `SUPABASE_KEY` in `.env` file.
3. **Database**: PostgreSQL managed by Supabase. Use Supabase Dashboard or SQL Editor for schema management.

## Architecture Overview

### Routing System (Auto-routed by Nuxt)

Pages in `app/pages/` are automatically converted to routes:
- `pages/index.vue` → `/`
- `pages/about.vue` → `/about`
- `pages/contact.vue` → `/contact`
- `pages/dashboard.vue` → `/dashboard`
- `pages/blog/index.vue` → `/blog`
- `pages/blog/[id].vue` → `/blog/:id` (dynamic route)

### Layout System

Two layouts exist in `app/layouts/`:
- **default.vue**: Used by most pages (includes Nav.vue component)
- **mylayout.vue**: Alternative layout (currently used by contact page)

Pages specify layouts via `definePageMeta({ layout: 'layoutname' })` or use default.

### Middleware

- **global-auth.global.ts**: Runs on every route change (logs navigation)
- **log.ts**: Page-specific middleware (applied via definePageMeta)

All middleware files use Nuxt's `defineNuxtRouteMiddleware()`.

### Database & Backend

- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Client**: `@supabase/supabase-js` for database queries
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Connection**: Via `SUPABASE_URL` and `SUPABASE_KEY` in `.env`

When adding tables:
1. Use Supabase Dashboard SQL Editor or Table Editor
2. Define Row Level Security (RLS) policies
3. Generate TypeScript types if needed

### Styling

- **Tailwind CSS**: Primary framework (configured in nuxt.config.ts with Vite plugin)
- **Dark Mode**: Fully implemented with class-based strategy using Tailwind v4
  - Composable: `app/composables/useDarkMode.ts` for theme management
  - Component: `ThemeToggle.vue` for toggle button in navigation
  - Persistence: Theme preference saved to localStorage with key `theme`
  - System Detection: Automatically detects system preference on first visit
  - All components support dark mode with `dark:` prefix classes
- **Animate.css**: Available globally for animations
- Main CSS: `app/assets/css/main.css` (imports Tailwind directives)
- Component styles: Supports `<style lang="scss" scoped>`

### Content Management

- Nuxt Content installed for markdown/MDC rendering
- Content files location: `.data/content/`

## Module Configuration

Key Nuxt modules in `nuxt.config.ts`:
- `@nuxt/image`: Image optimization
- `@nuxt/content`: Markdown content management
- `@nuxt/ui`: UI component library
- `@nuxt/test-utils`: Testing utilities (not yet configured)

## Project Documentation

- **Requirements**: `bank/cahier_des_charges/TIMG_PCQVP_TdR_Prestataire-Conception-Plateforme-Web.pdf`
- **Data Tables**: `bank/cahier_des_charges/Tableaux_de_Compte_Administratif.xlsx`
- **Database Schema**: `bank/modele_de_donnees/schema.sql` - Complete PostgreSQL schema with tables, triggers, views, and indexes
- **Data Model**: `bank/modele_de_donnees/mcd.md` - Conceptual data model with detailed entity descriptions, relationships, and business rules

## Dark Mode Implementation

### Overview
The application features a fully functional dark/light mode toggle, implemented using Tailwind CSS v4's class-based strategy.

### Tailwind v4 Configuration (CRITICAL)
**IMPORTANT**: Tailwind CSS v4 requires explicit dark mode configuration in the CSS file:

In `app/assets/css/main.css`:
```css
@import "tailwindcss";

/* Enable class-based dark mode in Tailwind v4 */
@variant dark (&:where(.dark, .dark *));
```

Without this `@variant` declaration, dark mode classes (e.g., `dark:bg-gray-900`) will NOT work, even if the `.dark` class is present on the HTML element.

### TailwindCSS v4 Migration Notes

**IMPORTANT**: TailwindCSS v4 introduces breaking changes that affect styling throughout the application:

#### Opacity Syntax Change
The `bg-opacity-xx`, `text-opacity-xx`, and similar opacity utilities are **no longer supported** in v4.

- **Old (v3) - DEPRECATED**:
  ```html
  <div class="bg-green-500 bg-opacity-50">...</div>
  <div class="text-blue-600 text-opacity-75">...</div>
  <div class="border-red-500 border-opacity-25">...</div>
  ```

- **New (v4) - REQUIRED**:
  ```html
  <div class="bg-green-500/50">...</div>
  <div class="text-blue-600/75">...</div>
  <div class="border-red-500/25">...</div>
  ```

The new syntax uses `/opacity` directly after the color utility (e.g., `bg-green-500/50` for 50% opacity).

#### Button Cursor Pointer
Buttons and interactive elements **no longer have `cursor-pointer` by default** in v4.

- **Required**: Explicitly add `cursor-pointer` class to all buttons and clickable elements:
  ```html
  <button class="cursor-pointer bg-blue-600 hover:bg-blue-700">
    Click me
  </button>
  ```

#### Application Impact
These changes affect:
- All modal overlays (fixed with `bg-gray-500/75` syntax)
- Interactive buttons throughout the admin interface
- Any component using opacity utilities
- Custom styled elements with hover states

**When adding new components**: Always use the v4 syntax to ensure compatibility.

### Core Components
- **Composable**: `app/composables/useDarkMode.ts`
  - Manages theme state and persistence
  - Detects system preference automatically
  - Saves preference to localStorage (key: `theme`)
  - Provides `isDark`, `toggleDarkMode()`, and `setTheme()` methods

- **Toggle Component**: `app/components/ThemeToggle.vue`
  - Icon-based toggle button (sun/moon icons)
  - Integrated into navigation bar
  - Smooth animations and transitions

### Usage in Components
When creating or modifying components, use Tailwind's `dark:` prefix for dark mode styles:

```vue
<template>
  <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    <!-- Content -->
  </div>
</template>
```

### Key Features
- **Automatic Detection**: Detects system theme preference on first visit
- **Persistence**: Theme choice saved to localStorage
- **Smooth Transitions**: All color transitions use `transition-colors duration-200`
- **Component Coverage**: All major components support dark mode:
  - Navigation (Nav.vue)
  - Page layouts (default.vue)
  - Home page (index.vue) with cards, loading states, error messages
  - Financial tables (TableauFinancier.vue) with full table styling
  - Hero section (HeroSection.vue)

## Important Development Notes

- Auto-imports enabled: Components, composables, and utilities are auto-imported by Nuxt
- DevTools enabled in dev mode for debugging
- TypeScript configuration references Nuxt-generated configs in `.nuxt/`
- No linting or testing setup currently configured
- Compatibility date set to 2025-07-15
- **Dark Mode**: Fully implemented - use `dark:` prefix when adding new components

## Claude Assistant Guidelines

### Package Installation & Deployment Operations

**IMPORTANT**: When package installation or deployment operations are required, Claude MUST:

1. **Provide the commands** instead of executing them directly
2. **Explain what needs to be done** and why
3. **Wait for user confirmation** after execution

This applies to operations requiring elevated privileges or special access:

- **Package Installation**:
  ```bash
  pnpm add package-name          # Add production dependency
  pnpm add -D package-name       # Add dev dependency
  ```

- **Supabase Deployments**:
  ```bash
  supabase functions deploy function-name    # Deploy edge function
  supabase db push                           # Push database migrations
  ```

- **Other privileged operations**:
  - Database schema changes
  - Authentication configuration
  - Storage bucket setup
  - Environment variable updates

**Rationale**: Claude doesn't have root/admin access for certain operations. Providing commands allows the user to execute them with proper permissions.
