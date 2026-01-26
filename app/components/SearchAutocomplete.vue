<script setup lang="ts">
interface AutocompleteResult {
  id: string
  type: 'case' | 'news' | 'resource'
  slug: string
  title: string
  summary: string
  coverImage: string | null
  date: string | null
  url: string
  category?: { name: string; color: string | null }
  region?: string
}

interface AutocompleteResponse {
  results: AutocompleteResult[]
  counts: {
    cases: number
    news: number
    resources: number
  }
  query: string
}

interface Props {
  isMobile?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false,
  placeholder: 'Rechercher...'
})

const emit = defineEmits<{
  close: []
  submit: [query: string]
}>()

const router = useRouter()
const { thumb } = useImageVariants()

// State
const query = ref('')
const isOpen = ref(false)
const isLoading = ref(false)
const activeType = ref<'all' | 'cases' | 'news' | 'resources'>('all')
const selectedIndex = ref(-1)
const results = ref<AutocompleteResult[]>([])
const counts = ref({ cases: 0, news: 0, resources: 0 })

// Refs
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const resultsContainerRef = ref<HTMLElement | null>(null)

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(query, (newQuery) => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!newQuery || newQuery.length < 2) {
    results.value = []
    counts.value = { cases: 0, news: 0, resources: 0 }
    isOpen.value = false
    return
  }

  isLoading.value = true
  searchTimeout = setTimeout(async () => {
    await fetchResults(newQuery)
  }, 300)
})

// Re-fetch when type filter changes
watch(activeType, () => {
  if (query.value.length >= 2) {
    fetchResults(query.value)
  }
})

async function fetchResults(q: string) {
  try {
    isLoading.value = true
    const response = await $fetch<AutocompleteResponse>('/api/search/autocomplete', {
      query: {
        q,
        type: activeType.value,
        limit: 5
      }
    })
    results.value = response.results
    counts.value = response.counts
    isOpen.value = true
    selectedIndex.value = -1
  } catch (error) {
    console.error('Search error:', error)
    results.value = []
  } finally {
    isLoading.value = false
  }
}

// Computed
const filteredResults = computed(() => {
  if (activeType.value === 'all') return results.value
  return results.value.filter(r => {
    if (activeType.value === 'cases') return r.type === 'case'
    if (activeType.value === 'news') return r.type === 'news'
    if (activeType.value === 'resources') return r.type === 'resource'
    return true
  })
})

const totalCount = computed(() => counts.value.cases + counts.value.news + counts.value.resources)

const typeFilters = [
  { value: 'all' as const, label: 'Tous', countKey: 'all' as const },
  { value: 'cases' as const, label: 'Cas', countKey: 'cases' as const },
  { value: 'news' as const, label: 'Actualités', countKey: 'news' as const },
  { value: 'resources' as const, label: 'Ressources', countKey: 'resources' as const }
]

function getFilterCount(key: 'all' | 'cases' | 'news' | 'resources'): number {
  if (key === 'all') return totalCount.value
  return counts.value[key]
}

// Type styling
function getTypeBadgeClass(type: 'case' | 'news' | 'resource'): string {
  const classes: Record<string, string> = {
    case: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    news: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    resource: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
  return classes[type] || ''
}

function getTypeLabel(type: 'case' | 'news' | 'resource'): string {
  const labels: Record<string, string> = {
    case: 'Étude de cas',
    news: 'Actualité',
    resource: 'Ressource'
  }
  return labels[type] || ''
}

function getTypeIcon(type: 'case' | 'news' | 'resource'): string {
  const icons: Record<string, string> = {
    case: 'folder-open',
    news: 'newspaper',
    resource: 'file-alt'
  }
  return icons[type] || 'file'
}

// Event handlers
function onFocus() {
  if (query.value.length >= 2 && results.value.length > 0) {
    isOpen.value = true
  }
}

function onBlur(e: FocusEvent) {
  // Delay close to allow click on results
  const relatedTarget = e.relatedTarget as HTMLElement | null
  if (dropdownRef.value?.contains(relatedTarget)) return

  setTimeout(() => {
    isOpen.value = false
  }, 200)
}

function clearSearch() {
  query.value = ''
  results.value = []
  counts.value = { cases: 0, news: 0, resources: 0 }
  isOpen.value = false
  selectedIndex.value = -1
  inputRef.value?.focus()
}

function navigateToResult(result: AutocompleteResult) {
  router.push(result.url)
  isOpen.value = false
  query.value = ''
  emit('close')
}

function submitSearch() {
  if (query.value.trim()) {
    router.push({ path: '/recherche', query: { q: query.value.trim() } })
    isOpen.value = false
    query.value = ''
    emit('submit', query.value)
    emit('close')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value && e.key !== 'Enter') return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredResults.value.length - 1)
      scrollToSelected()
      break

    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      scrollToSelected()
      break

    case 'Enter':
      e.preventDefault()
      if (selectedIndex.value >= 0 && filteredResults.value[selectedIndex.value]) {
        navigateToResult(filteredResults.value[selectedIndex.value])
      } else {
        submitSearch()
      }
      break

    case 'Escape':
      isOpen.value = false
      selectedIndex.value = -1
      emit('close')
      break
  }
}

function scrollToSelected() {
  nextTick(() => {
    const container = resultsContainerRef.value
    if (!container) return
    const selected = container.querySelector('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  })
}

// Click outside handler
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout) clearTimeout(searchTimeout)
})

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!dropdownRef.value?.contains(target) && !inputRef.value?.contains(target)) {
    isOpen.value = false
  }
}
</script>

<template>
  <div class="relative w-full" @keydown="handleKeydown">
    <!-- Search Input -->
    <div class="relative">
      <font-awesome-icon
        icon="search"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
      />
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        :class="[
          'w-full pl-11 pr-10 py-3 rounded-xl border transition-colors',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
          'placeholder-gray-500 dark:placeholder-gray-400',
          'border-gray-300 dark:border-gray-600',
          'focus:ring-2 focus:ring-ti-blue focus:border-transparent',
          isMobile ? 'text-base' : 'text-lg'
        ]"
        autocomplete="off"
        @focus="onFocus"
        @blur="onBlur"
      />
      <!-- Clear button -->
      <button
        v-if="query"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
        @click="clearSearch"
      >
        <font-awesome-icon icon="times" class="w-4 h-4" />
      </button>
      <!-- Loading spinner -->
      <font-awesome-icon
        v-else-if="isLoading"
        icon="spinner"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin"
      />
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen && (filteredResults.length > 0 || isLoading)"
        ref="dropdownRef"
        :class="[
          'absolute left-0 right-0 mt-2 z-50',
          'bg-white dark:bg-gray-800 rounded-xl shadow-xl',
          'border border-gray-200 dark:border-gray-700',
          'overflow-hidden',
          isMobile ? 'max-h-[60vh]' : 'max-h-[70vh]'
        ]"
      >
        <!-- Type Filters -->
        <div class="flex flex-wrap gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
          <button
            v-for="filter in typeFilters"
            :key="filter.value"
            type="button"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer',
              activeType === filter.value
                ? 'bg-ti-blue text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
            @click="activeType = filter.value"
          >
            {{ filter.label }}
            <span class="ml-1 opacity-75">({{ getFilterCount(filter.value) }})</span>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-6 text-center">
          <font-awesome-icon icon="spinner" class="w-6 h-6 text-ti-blue animate-spin" />
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Recherche en cours...</p>
        </div>

        <!-- Results List -->
        <div
          v-else-if="filteredResults.length > 0"
          ref="resultsContainerRef"
          class="max-h-96 overflow-y-auto"
        >
          <NuxtLink
            v-for="(result, index) in filteredResults"
            :key="result.id"
            :to="result.url"
            :data-selected="selectedIndex === index"
            :class="[
              'flex items-start gap-3 p-3 cursor-pointer transition-colors',
              'hover:bg-gray-50 dark:hover:bg-gray-700/50',
              selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
            ]"
            @click="navigateToResult(result)"
          >
            <!-- Thumbnail -->
            <div class="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                v-if="result.coverImage"
                :src="thumb(result.coverImage)"
                :alt="result.title"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500"
              >
                <font-awesome-icon :icon="getTypeIcon(result.type)" class="w-6 h-6" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <!-- Type badge and category -->
              <div class="flex items-center gap-2 mb-1">
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    getTypeBadgeClass(result.type)
                  ]"
                >
                  {{ getTypeLabel(result.type) }}
                </span>
                <span
                  v-if="result.category"
                  class="text-xs font-medium"
                  :style="{ color: result.category.color || '#6b7280' }"
                >
                  {{ result.category.name }}
                </span>
                <span
                  v-if="result.region"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  <font-awesome-icon icon="map-marker-alt" class="w-3 h-3 mr-1" />
                  {{ result.region }}
                </span>
              </div>

              <!-- Title -->
              <h4 class="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {{ result.title }}
              </h4>

              <!-- Summary -->
              <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {{ result.summary }}
              </p>
            </div>

            <!-- Arrow icon -->
            <font-awesome-icon
              icon="chevron-right"
              class="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-4"
            />
          </NuxtLink>
        </div>

        <!-- No Results -->
        <div v-else-if="!isLoading && query.length >= 2" class="p-6 text-center">
          <font-awesome-icon icon="search" class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Aucun résultat pour "{{ query }}"
          </p>
        </div>

        <!-- See All Results Footer -->
        <div
          v-if="filteredResults.length > 0 && !isLoading"
          class="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
        >
          <button
            type="button"
            class="w-full text-center text-sm font-medium text-ti-blue hover:text-ti-blue-600 dark:text-ti-blue-400 dark:hover:text-ti-blue-300 cursor-pointer transition-colors"
            @click="submitSearch"
          >
            Voir tous les résultats pour "{{ query }}"
            <font-awesome-icon icon="arrow-right" class="ml-2 w-3 h-3" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Hint text (desktop only) -->
    <p
      v-if="!isMobile && isOpen && query.length >= 2"
      class="mt-2 text-xs text-gray-500 dark:text-gray-400"
    >
      Utilisez ↑↓ pour naviguer, Entrée pour sélectionner, Échap pour fermer
    </p>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
