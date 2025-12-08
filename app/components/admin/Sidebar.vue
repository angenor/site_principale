<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-[var(--z-fixed)] flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-[var(--border-default)]">
      <NuxtLink to="/admin" class="flex items-center gap-3">
        <img
          src="/images/logos/logo_fond_noire_texte_bleu.jpeg"
          alt="TI Madagascar"
          class="h-10 w-10 rounded-lg object-cover"
        />
        <span
          v-if="!isCollapsed"
          class="font-heading font-bold text-lg text-[var(--color-primary)] uppercase tracking-wide truncate"
        >
          TI Madagascar
        </span>
      </NuxtLink>
      <!-- Collapse button (when expanded) -->
      <button
        v-if="!isCollapsed"
        @click="$emit('toggle')"
        class="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
        title="Réduire la sidebar"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" />
      </button>
    </div>

    <!-- Expand button (when collapsed) - positioned at top for visibility -->
    <button
      v-if="isCollapsed"
      @click="$emit('toggle')"
      class="hidden lg:flex items-center justify-center w-full py-3 text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer border-b border-[var(--border-default)]"
      title="Agrandir la sidebar"
    >
      <font-awesome-icon :icon="['fas', 'chevron-right']" />
    </button>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-2">
      <div v-for="group in menuGroups" :key="group.title" class="mb-6">
        <!-- Group Title -->
        <div
          v-if="!isCollapsed && group.title"
          class="px-3 mb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider"
        >
          {{ group.title }}
        </div>

        <!-- Menu Items -->
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.to">
            <!-- Item with submenu -->
            <template v-if="item.children">
              <button
                @click="toggleSubmenu(item.to)"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
                  isActiveParent(item)
                    ? 'bg-[var(--interactive-selected)] text-[var(--color-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]'
                ]"
              >
                <font-awesome-icon :icon="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span v-if="!isCollapsed" class="flex-1 text-left text-sm font-medium truncate">
                  {{ item.label }}
                </span>
                <font-awesome-icon
                  v-if="!isCollapsed"
                  :icon="['fas', 'chevron-down']"
                  :class="[
                    'w-3 h-3 transition-transform',
                    openSubmenus.includes(item.to) ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <!-- Submenu -->
              <ul
                v-if="!isCollapsed && openSubmenus.includes(item.to)"
                class="mt-1 ml-4 pl-4 border-l border-[var(--border-light)] space-y-1"
              >
                <li v-for="child in item.children" :key="child.to">
                  <NuxtLink
                    :to="child.to"
                    :class="[
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive(child.to)
                        ? 'bg-[var(--interactive-selected)] text-[var(--color-primary)] font-medium'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]'
                    ]"
                    @click="$emit('close-mobile')"
                  >
                    <font-awesome-icon :icon="child.icon" class="w-4 h-4" />
                    <span class="truncate">{{ child.label }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </template>

            <!-- Simple item -->
            <template v-else>
              <NuxtLink
                :to="item.to"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive(item.to)
                    ? 'bg-[var(--interactive-selected)] text-[var(--color-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]'
                ]"
                @click="$emit('close-mobile')"
              >
                <font-awesome-icon :icon="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span v-if="!isCollapsed" class="text-sm font-medium truncate">
                  {{ item.label }}
                </span>
                <!-- Badge -->
                <span
                  v-if="!isCollapsed && item.badge"
                  class="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary)] text-white"
                >
                  {{ item.badge }}
                </span>
              </NuxtLink>
            </template>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-[var(--border-default)]">
      <!-- Version info -->
      <div v-if="!isCollapsed" class="text-center text-xs text-[var(--text-muted)]">
        <p>Version 1.0.0</p>
      </div>
    </div>
  </aside>

  <!-- Mobile overlay -->
  <div
    v-if="isMobileOpen"
    class="fixed inset-0 z-[calc(var(--z-fixed)-1)] bg-black/50 lg:hidden"
    @click="$emit('close-mobile')"
  />
</template>

<script setup lang="ts">
interface MenuItem {
  to: string
  label: string
  icon: string[]
  badge?: number | string
  children?: MenuItem[]
}

interface MenuGroup {
  title?: string
  items: MenuItem[]
}

defineProps<{
  isCollapsed: boolean
  isMobileOpen: boolean
}>()

defineEmits<{
  toggle: []
  'close-mobile': []
}>()

const route = useRoute()

// Submenus state
const openSubmenus = ref<string[]>([])

// Menu structure
const menuGroups = computed<MenuGroup[]>(() => [
  {
    items: [
      { to: '/admin', label: 'Tableau de bord', icon: ['fas', 'chart-pie'] },
    ]
  },
  {
    title: 'Données Financières',
    items: [
      {
        to: '/admin/donnees',
        label: 'Comptes Administratifs',
        icon: ['fas', 'file-invoice-dollar'],
        children: [
          { to: '/admin/comptes-administratifs', label: 'Comptes', icon: ['fas', 'list'] },
          { to: '/admin/recettes', label: 'Recettes', icon: ['fas', 'arrow-trend-up'] },
          { to: '/admin/depenses', label: 'Dépenses', icon: ['fas', 'arrow-trend-down'] },
        ]
      },
      { to: '/admin/exercices', label: 'Exercices', icon: ['fas', 'calendar-days'] },
      { to: '/admin/plan-comptable', label: 'Plan Comptable', icon: ['fas', 'sitemap'] },
      { to: '/admin/import', label: 'Import Données', icon: ['fas', 'file-import'] },
    ]
  },
  {
    title: 'Géographie',
    items: [
      {
        to: '/admin/geo',
        label: 'Territoires',
        icon: ['fas', 'map-location-dot'],
        children: [
          { to: '/admin/geo/provinces', label: 'Provinces', icon: ['fas', 'map'] },
          { to: '/admin/geo/regions', label: 'Régions', icon: ['fas', 'location-dot'] },
          { to: '/admin/geo/communes', label: 'Communes', icon: ['fas', 'city'] },
        ]
      },
    ]
  },
  {
    title: 'Projets Miniers',
    items: [
      { to: '/admin/projets/societes', label: 'Sociétés', icon: ['fas', 'building'] },
      { to: '/admin/projets', label: 'Projets', icon: ['fas', 'gem'] },
      { to: '/admin/revenus', label: 'Revenus Miniers', icon: ['fas', 'coins'] },
    ]
  },
  {
    title: 'Contenu',
    items: [
      {
        to: '/admin/cms',
        label: 'CMS',
        icon: ['fas', 'newspaper'],
        children: [
          { to: '/admin/cms/pages', label: 'Pages', icon: ['fas', 'file-lines'] },
          { to: '/admin/cms/sections', label: 'Sections', icon: ['fas', 'puzzle-piece'] },
        ]
      },
      { to: '/admin/documents', label: 'Documents', icon: ['fas', 'folder-open'] },
    ]
  },
  {
    title: 'Administration',
    items: [
      { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: ['fas', 'users'] },
      { to: '/admin/newsletter', label: 'Newsletter', icon: ['fas', 'envelope'] },
      {
        to: '/admin/statistiques',
        label: 'Statistiques',
        icon: ['fas', 'chart-line'],
        children: [
          { to: '/admin/statistiques', label: 'Vue générale', icon: ['fas', 'chart-simple'] },
          { to: '/admin/statistiques/visites', label: 'Visites', icon: ['fas', 'eye'] },
          { to: '/admin/statistiques/audit', label: 'Journal d\'audit', icon: ['fas', 'clipboard-list'] },
        ]
      },
      { to: '/admin/colonnes', label: 'Colonnes', icon: ['fas', 'table-columns'] },
      { to: '/admin/parametres', label: 'Paramètres', icon: ['fas', 'gear'] },
      { to: '/admin/profil', label: 'Mon Profil', icon: ['fas', 'user-circle'] },
    ]
  },
])

// Check if route is active
const isActive = (path: string) => {
  // Exact match for dashboard and "Vue générale" pages
  if (path === '/admin' || path === '/admin/statistiques') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

// Check if parent menu should be highlighted
const isActiveParent = (item: MenuItem) => {
  if (item.children) {
    return item.children.some(child => isActive(child.to))
  }
  return isActive(item.to)
}

// Toggle submenu
const toggleSubmenu = (path: string) => {
  const index = openSubmenus.value.indexOf(path)
  if (index === -1) {
    openSubmenus.value.push(path)
  } else {
    openSubmenus.value.splice(index, 1)
  }
}

// Auto-open parent submenus on route change
watch(() => route.path, () => {
  menuGroups.value.forEach(group => {
    group.items.forEach(item => {
      if (item.children && isActiveParent(item)) {
        if (!openSubmenus.value.includes(item.to)) {
          openSubmenus.value.push(item.to)
        }
      }
    })
  })
}, { immediate: true })
</script>
