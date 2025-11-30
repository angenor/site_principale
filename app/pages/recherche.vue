<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Recherche - Observatoire des Mines de Madagascar'
})

interface SearchResult {
  id: string
  type: 'case' | 'news'
  slug: string
  title: string
  summary: string
  coverImage: string | null
  date: string | null
  url: string
}

interface SearchResponse {
  results: SearchResult[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  counts: {
    cases: number
    news: number
  }
  query: string
}

const route = useRoute()
const router = useRouter()

const searchQuery = ref((route.query.q as string) || '')
const activeType = ref((route.query.type as string) || 'all')
const page = ref(parseInt(route.query.page as string) || 1)

const debouncedQuery = refDebounced(searchQuery, 300)

// Fetch results
const { data: searchData, pending } = await useFetch<SearchResponse>('/api/search', {
  query: computed(() => ({
    q: debouncedQuery.value,
    type: activeType.value,
    page: page.value,
    limit: 12
  })),
  watch: [debouncedQuery, activeType, page]
})

// Update URL when search changes
watch([debouncedQuery, activeType, page], () => {
  router.replace({
    query: {
      q: debouncedQuery.value || undefined,
      type: activeType.value !== 'all' ? activeType.value : undefined,
      page: page.value > 1 ? page.value : undefined
    }
  })
})

// Reset page when query or type changes
watch([debouncedQuery, activeType], () => {
  page.value = 1
})

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function highlightText(text: string, query: string): string {
  if (!query) return text
  const terms = query.split(/\s+/).filter(t => t.length >= 2)
  let result = text
  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi')
    result = result.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>')
  })
  return result
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Search Header -->
    <div class="bg-ti-blue dark:bg-gray-800 py-12">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-heading font-bold text-white text-center mb-6">
          Rechercher
        </h1>

        <!-- Search Input -->
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <font-awesome-icon
              icon="search"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher des études de cas, actualités..."
              class="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg focus:ring-2 focus:ring-white/50"
              autofocus
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <font-awesome-icon icon="xmark" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="container mx-auto px-4 py-8">
      <!-- Filters & Count -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="activeType = 'all'"
            :class="[
              activeType === 'all'
                ? 'bg-ti-blue text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer'
            ]"
          >
            Tout
            <span v-if="searchData?.counts" class="ml-1 text-sm opacity-75">
              ({{ searchData.counts.cases + searchData.counts.news }})
            </span>
          </button>
          <button
            @click="activeType = 'cases'"
            :class="[
              activeType === 'cases'
                ? 'bg-ti-blue text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer'
            ]"
          >
            Études de cas
            <span v-if="searchData?.counts" class="ml-1 text-sm opacity-75">
              ({{ searchData.counts.cases }})
            </span>
          </button>
          <button
            @click="activeType = 'news'"
            :class="[
              activeType === 'news'
                ? 'bg-ti-blue text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer'
            ]"
          >
            Actualités
            <span v-if="searchData?.counts" class="ml-1 text-sm opacity-75">
              ({{ searchData.counts.news }})
            </span>
          </button>
        </div>

        <p v-if="searchData?.pagination.total && debouncedQuery" class="text-gray-600 dark:text-gray-400">
          {{ searchData.pagination.total }} résultat{{ searchData.pagination.total > 1 ? 's' : '' }}
          pour "{{ debouncedQuery }}"
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex justify-center py-12">
        <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-3xl" />
      </div>

      <!-- No query -->
      <div v-else-if="!debouncedQuery" class="text-center py-16">
        <font-awesome-icon icon="search" class="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Entrez un terme de recherche pour trouver des études de cas ou des actualités
        </p>
      </div>

      <!-- No results -->
      <div v-else-if="!searchData?.results.length" class="text-center py-16">
        <font-awesome-icon icon="folder-open" class="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-600 dark:text-gray-400 text-lg mb-2">
          Aucun résultat pour "{{ debouncedQuery }}"
        </p>
        <p class="text-gray-500 dark:text-gray-500 text-sm">
          Essayez avec d'autres mots-clés
        </p>
      </div>

      <!-- Results Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="result in searchData.results"
          :key="result.id"
          :to="result.url"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
        >
          <!-- Image -->
          <div class="aspect-video relative overflow-hidden">
            <img
              v-if="result.coverImage"
              :src="result.coverImage"
              :alt="result.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div
              v-else
              class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
            >
              <font-awesome-icon
                :icon="result.type === 'case' ? 'folder-open' : 'newspaper'"
                class="text-4xl text-gray-400 dark:text-gray-500"
              />
            </div>
            <!-- Type badge -->
            <span
              :class="[
                result.type === 'case'
                  ? 'bg-ti-blue'
                  : 'bg-green-600',
                'absolute top-3 left-3 px-2 py-1 text-xs font-medium text-white rounded'
              ]"
            >
              {{ result.type === 'case' ? 'Étude de cas' : 'Actualité' }}
            </span>
          </div>

          <!-- Content -->
          <div class="p-4">
            <h3
              class="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-ti-blue transition-colors"
              v-html="highlightText(result.title, debouncedQuery)"
            />
            <p
              class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3"
              v-html="highlightText(result.summary.substring(0, 150), debouncedQuery)"
            />
            <p v-if="result.date" class="text-xs text-gray-500 dark:text-gray-500">
              {{ formatDate(result.date) }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div
        v-if="searchData?.pagination && searchData.pagination.totalPages > 1"
        class="flex justify-center gap-2 mt-8"
      >
        <button
          :disabled="page === 1"
          @click="page--"
          class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <font-awesome-icon icon="chevron-left" class="mr-1" />
          Précédent
        </button>
        <span class="px-4 py-2 text-gray-600 dark:text-gray-400">
          Page {{ page }} sur {{ searchData.pagination.totalPages }}
        </span>
        <button
          :disabled="page === searchData.pagination.totalPages"
          @click="page++"
          class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          Suivant
          <font-awesome-icon icon="chevron-right" class="ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>
