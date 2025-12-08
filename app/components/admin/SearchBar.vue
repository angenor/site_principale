<template>
  <div class="relative" ref="searchContainer">
    <!-- Search input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-sm" />
      </div>
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher..."
        class="w-64 pl-10 pr-12 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
        @focus="showResults = true"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.up.prevent="navigateResults(-1)"
        @keydown.enter.prevent="selectResult"
        @keydown.escape="closeSearch"
      />
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <kbd class="hidden xl:inline-flex px-2 py-0.5 text-xs font-mono text-[var(--text-muted)] bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-800)] rounded">
          {{ isMac ? '⌘' : 'Ctrl+' }}K
        </kbd>
      </div>
    </div>

    <!-- Autocomplete dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showResults && filteredPages.length > 0"
        class="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto"
      >
        <!-- Group by category -->
        <div v-for="(group, category) in groupedResults" :key="category" class="border-b border-[var(--border-default)] last:border-b-0">
          <div class="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-secondary)]">
            {{ category }}
          </div>
          <div>
            <button
              v-for="(page, index) in group"
              :key="page.path"
              class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--interactive-hover)] transition-colors cursor-pointer"
              :class="{ 'bg-[var(--interactive-hover)]': selectedIndex === getGlobalIndex(category, index) }"
              @click="goToPage(page.path)"
              @mouseenter="selectedIndex = getGlobalIndex(category, index)"
            >
              <div class="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                <font-awesome-icon :icon="page.icon" class="text-sm" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-[var(--text-primary)] truncate">{{ page.name }}</div>
                <div class="text-xs text-[var(--text-muted)] truncate">{{ page.path }}</div>
              </div>
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-[var(--text-muted)] text-xs" />
            </button>
          </div>
        </div>

        <!-- No results message -->
        <div v-if="searchQuery && filteredPages.length === 0" class="px-4 py-8 text-center text-[var(--text-muted)]">
          <font-awesome-icon :icon="['fas', 'search']" class="text-2xl mb-2 opacity-50" />
          <p>Aucun résultat pour "{{ searchQuery }}"</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface SearchablePage {
  name: string
  path: string
  icon: [string, string]
  category: string
  keywords: string[]
}

const router = useRouter()
const emit = defineEmits<{
  navigate: [path: string]
}>()
const searchQuery = ref('')
const showResults = ref(false)
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)
const searchContainer = ref<HTMLElement | null>(null)

// Detect Mac
const isMac = computed(() => {
  if (import.meta.client) {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0
  }
  return false
})

// All searchable pages
const searchablePages: SearchablePage[] = [
  // Dashboard
  { name: 'Tableau de bord', path: '/admin', icon: ['fas', 'chart-pie'], category: 'Navigation', keywords: ['accueil', 'dashboard', 'home'] },

  // Gestion des données
  { name: 'Revenus miniers', path: '/admin/revenus', icon: ['fas', 'coins'], category: 'Gestion des données', keywords: ['revenus', 'miniers', 'argent', 'finances'] },
  { name: 'Nouveau revenu', path: '/admin/revenus/create', icon: ['fas', 'plus'], category: 'Gestion des données', keywords: ['ajouter', 'créer', 'revenu'] },
  { name: 'Recettes', path: '/admin/recettes', icon: ['fas', 'arrow-trend-up'], category: 'Gestion des données', keywords: ['recettes', 'revenus', 'entrées'] },
  { name: 'Dépenses', path: '/admin/depenses', icon: ['fas', 'money-bill-wave'], category: 'Gestion des données', keywords: ['dépenses', 'sorties', 'budget'] },
  { name: 'Exercices fiscaux', path: '/admin/exercices', icon: ['fas', 'calendar-days'], category: 'Gestion des données', keywords: ['exercices', 'années', 'fiscal'] },
  { name: 'Comptes administratifs', path: '/admin/comptes-administratifs', icon: ['fas', 'file-invoice-dollar'], category: 'Gestion des données', keywords: ['comptes', 'administratifs', 'budget'] },
  { name: 'Plan comptable', path: '/admin/plan-comptable', icon: ['fas', 'sitemap'], category: 'Gestion des données', keywords: ['plan', 'comptable', 'nomenclature'] },
  { name: 'Colonnes', path: '/admin/colonnes', icon: ['fas', 'table-columns'], category: 'Gestion des données', keywords: ['colonnes', 'configuration'] },

  // Projets
  { name: 'Projets miniers', path: '/admin/projets', icon: ['fas', 'gem'], category: 'Projets', keywords: ['projets', 'miniers', 'mines'] },
  { name: 'Nouveau projet', path: '/admin/projets/create', icon: ['fas', 'plus'], category: 'Projets', keywords: ['ajouter', 'créer', 'projet'] },
  { name: 'Sociétés minières', path: '/admin/projets/societes', icon: ['fas', 'building'], category: 'Projets', keywords: ['sociétés', 'entreprises', 'minières'] },
  { name: 'Nouvelle société', path: '/admin/projets/societes/create', icon: ['fas', 'plus'], category: 'Projets', keywords: ['ajouter', 'créer', 'société'] },

  // Géographie
  { name: 'Provinces', path: '/admin/geo/provinces', icon: ['fas', 'map'], category: 'Géographie', keywords: ['provinces', 'régions', 'géographie'] },
  { name: 'Régions', path: '/admin/geo/regions', icon: ['fas', 'map-location-dot'], category: 'Géographie', keywords: ['régions', 'zones', 'géographie'] },
  { name: 'Communes', path: '/admin/geo/communes', icon: ['fas', 'city'], category: 'Géographie', keywords: ['communes', 'villes', 'localités'] },
  { name: 'Nouvelle commune', path: '/admin/geo/communes/create', icon: ['fas', 'plus'], category: 'Géographie', keywords: ['ajouter', 'créer', 'commune'] },

  // Statistiques
  { name: 'Statistiques', path: '/admin/statistiques', icon: ['fas', 'chart-line'], category: 'Statistiques', keywords: ['stats', 'graphiques', 'analytics'] },
  { name: 'Visites', path: '/admin/statistiques/visites', icon: ['fas', 'users'], category: 'Statistiques', keywords: ['visites', 'trafic', 'visiteurs'] },
  { name: 'Journal d\'audit', path: '/admin/statistiques/audit', icon: ['fas', 'clipboard-list'], category: 'Statistiques', keywords: ['audit', 'logs', 'historique'] },

  // CMS
  { name: 'Pages CMS', path: '/admin/cms/pages', icon: ['fas', 'file-lines'], category: 'Contenu', keywords: ['pages', 'cms', 'contenu'] },
  { name: 'Nouvelle page', path: '/admin/cms/pages/create', icon: ['fas', 'plus'], category: 'Contenu', keywords: ['ajouter', 'créer', 'page'] },
  { name: 'Documents', path: '/admin/documents', icon: ['fas', 'folder-open'], category: 'Contenu', keywords: ['documents', 'fichiers', 'téléchargements'] },
  { name: 'Uploader document', path: '/admin/documents/upload', icon: ['fas', 'upload'], category: 'Contenu', keywords: ['upload', 'télécharger', 'importer'] },
  { name: 'Newsletter', path: '/admin/newsletter', icon: ['fas', 'envelope'], category: 'Contenu', keywords: ['newsletter', 'email', 'abonnés'] },

  // Administration
  { name: 'Utilisateurs', path: '/admin/utilisateurs', icon: ['fas', 'cogs'], category: 'Administration', keywords: ['utilisateurs', 'comptes', 'accès'] },
  { name: 'Nouvel utilisateur', path: '/admin/utilisateurs/create', icon: ['fas', 'user-plus'], category: 'Administration', keywords: ['ajouter', 'créer', 'utilisateur'] },
  { name: 'Paramètres', path: '/admin/parametres', icon: ['fas', 'gear'], category: 'Administration', keywords: ['paramètres', 'configuration', 'réglages'] },
  { name: 'Import de données', path: '/admin/import', icon: ['fas', 'file-import'], category: 'Administration', keywords: ['import', 'csv', 'excel', 'données'] },
  { name: 'Mon profil', path: '/admin/profil', icon: ['fas', 'user'], category: 'Administration', keywords: ['profil', 'compte', 'personnel'] },
]

// Filter pages based on search query
const filteredPages = computed(() => {
  if (!searchQuery.value.trim()) {
    return searchablePages.slice(0, 10) // Show first 10 pages when no query
  }

  const query = searchQuery.value.toLowerCase().trim()
  return searchablePages.filter(page => {
    const nameMatch = page.name.toLowerCase().includes(query)
    const pathMatch = page.path.toLowerCase().includes(query)
    const keywordMatch = page.keywords.some(kw => kw.includes(query))
    return nameMatch || pathMatch || keywordMatch
  })
})

// Group results by category
const groupedResults = computed(() => {
  const groups: Record<string, SearchablePage[]> = {}
  for (const page of filteredPages.value) {
    if (!groups[page.category]) {
      groups[page.category] = []
    }
    groups[page.category].push(page)
  }
  return groups
})

// Get global index for a result
const getGlobalIndex = (category: string, localIndex: number): number => {
  let globalIndex = 0
  for (const [cat, pages] of Object.entries(groupedResults.value)) {
    if (cat === category) {
      return globalIndex + localIndex
    }
    globalIndex += pages.length
  }
  return globalIndex
}

// Navigate through results with keyboard
const navigateResults = (direction: number) => {
  const total = filteredPages.value.length
  if (total === 0) return

  selectedIndex.value = (selectedIndex.value + direction + total) % total
}

// Select current result
const selectResult = () => {
  if (filteredPages.value.length > 0 && selectedIndex.value < filteredPages.value.length) {
    goToPage(filteredPages.value[selectedIndex.value].path)
  }
}

// Navigate to a page
const goToPage = (path: string) => {
  router.push(path)
  emit('navigate', path)
  closeSearch()
}

// Close search
const closeSearch = () => {
  showResults.value = false
  searchQuery.value = ''
  selectedIndex.value = 0
  searchInput.value?.blur()
}

// Handle clicks outside
const handleClickOutside = (event: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    showResults.value = false
  }
}

// Global keyboard shortcut
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
    showResults.value = true
  }
}

// Reset selected index when results change
watch(filteredPages, () => {
  selectedIndex.value = 0
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>
