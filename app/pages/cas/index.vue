<script setup lang="ts">
// Interfaces
interface Category {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
}

interface Region {
  id: string
  name: string
  code: string
}

interface CaseStudy {
  id: number
  slug: string
  title: string
  subtitle: string | null
  summary: string | null
  coverImage: string | null
  eventDate: string | null
  publishedAt: string | null
  region: { id: string; name: string } | null
  categories: Category[]
}

interface CasesResponse {
  data: CaseStudy[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Métadonnées de la page
useHead({
  title: 'Études de cas - Observatoire des Mines de Madagascar',
  meta: [
    {
      name: 'description',
      content: 'Découvrez les études de cas documentées par l\'Observatoire des Mines de Madagascar sur les activités minières et leurs impacts.'
    }
  ]
})

// Filtres (états réactifs)
const selectedCategory = ref<string>('')
const selectedRegion = ref<string>('')
const searchQuery = ref('')
const sortOrder = ref<'recent' | 'oldest'>('recent')
const currentPage = ref(1)

// Debounce pour la recherche
const debouncedSearch = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newVal
    currentPage.value = 1
  }, 300)
})

// Charger les catégories et régions
const { data: categoriesData } = await useFetch<Category[]>('/api/categories')
const { data: regionsData } = await useFetch<Region[]>('/api/regions')

const categories = computed(() => categoriesData.value || [])
const regions = computed(() => regionsData.value || [])

// Paramètres de requête pour les cas
const queryParams = computed(() => ({
  category: selectedCategory.value || undefined,
  region: selectedRegion.value || undefined,
  search: debouncedSearch.value || undefined,
  sort: sortOrder.value,
  page: currentPage.value,
  limit: 12
}))

// Charger les études de cas avec les filtres
const { data: casesResponse, pending, error, refresh } = await useFetch<CasesResponse>('/api/cases', {
  query: queryParams,
  watch: [queryParams]
})

const caseStudies = computed(() => casesResponse.value?.data || [])
const pagination = computed(() => casesResponse.value?.pagination || { total: 0, totalPages: 1, page: 1 })

// Rafraîchir quand les filtres changent
watch([selectedCategory, selectedRegion, sortOrder], () => {
  currentPage.value = 1
})

// Réinitialiser les filtres
const resetFilters = () => {
  selectedCategory.value = ''
  selectedRegion.value = ''
  searchQuery.value = ''
  debouncedSearch.value = ''
  sortOrder.value = 'recent'
  currentPage.value = 1
}

// Obtenir la première catégorie d'un cas
const getPrimaryCategory = (cs: CaseStudy) => cs.categories[0] || null

// Obtenir la date à afficher
const getDisplayDate = (cs: CaseStudy) => cs.eventDate || cs.publishedAt || undefined
</script>

<template>
  <div>
    <!-- Hero de la page -->
    <section class="bg-gradient-to-br from-ti-blue-600 to-ti-blue-800 py-16 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl lg:text-5xl font-heading font-bold uppercase text-white mb-4">
            Études de Cas
          </h1>
          <p class="text-lg text-blue-100 max-w-2xl mx-auto">
            Analyses approfondies des activités minières à Madagascar et de leurs impacts
            sur les communautés et l'environnement.
          </p>
        </div>
      </div>
    </section>

    <!-- Filtres et résultats -->
    <section class="py-12 lg:py-16 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Barre de filtres -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 lg:p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Recherche -->
            <div class="lg:col-span-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rechercher
              </label>
              <div class="relative">
                <font-awesome-icon
                  icon="search"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Mot-clé..."
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <!-- Catégorie -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                v-model="selectedCategory"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors cursor-pointer"
              >
                <option value="">Toutes les catégories</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.slug"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Région -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Région
              </label>
              <select
                v-model="selectedRegion"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors cursor-pointer"
              >
                <option value="">Toutes les régions</option>
                <option
                  v-for="region in regions"
                  :key="region.id"
                  :value="region.id"
                >
                  {{ region.name }}
                </option>
              </select>
            </div>

            <!-- Tri -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trier par
              </label>
              <select
                v-model="sortOrder"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors cursor-pointer"
              >
                <option value="recent">Plus récent</option>
                <option value="oldest">Plus ancien</option>
              </select>
            </div>
          </div>

          <!-- Actions des filtres -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <span class="font-semibold text-gray-900 dark:text-white">{{ pagination.total }}</span>
              {{ pagination.total > 1 ? 'études de cas trouvées' : 'étude de cas trouvée' }}
            </p>
            <button
              v-if="selectedCategory || selectedRegion || searchQuery"
              @click="resetFilters"
              class="text-sm text-ti-blue hover:text-ti-blue-700 dark:text-ti-blue-400 dark:hover:text-ti-blue-300 font-medium cursor-pointer"
            >
              <font-awesome-icon icon="times" class="mr-1" />
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        <!-- État de chargement -->
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="bg-gray-200 dark:bg-gray-700 aspect-video rounded-xl mb-4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-else-if="error" class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <font-awesome-icon icon="circle-exclamation" class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Erreur de chargement
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Impossible de charger les études de cas. Veuillez réessayer.
          </p>
          <button @click="refresh" class="btn-ti">
            Réessayer
          </button>
        </div>

        <!-- Grille des études de cas -->
        <div v-else-if="caseStudies.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AppCard
            v-for="caseStudy in caseStudies"
            :key="caseStudy.id"
            :image="caseStudy.coverImage || '/images/placeholder-case.jpg'"
            :title="caseStudy.title"
            :subtitle="caseStudy.subtitle || undefined"
            :description="caseStudy.summary || undefined"
            :category="getPrimaryCategory(caseStudy)?.name"
            :category-color="getPrimaryCategory(caseStudy)?.color"
            :region="caseStudy.region?.name"
            :date="getDisplayDate(caseStudy)"
            :link-to="`/cas/${caseStudy.slug}`"
            variant="default"
          />
        </div>

        <!-- Message si aucun résultat -->
        <div v-else class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <font-awesome-icon icon="search" class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Aucun résultat trouvé
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
          </p>
          <button
            @click="resetFilters"
            class="btn-ti"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center gap-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <font-awesome-icon icon="chevron-left" class="w-4 h-4" />
          </button>

          <span class="px-4 py-2 text-gray-700 dark:text-gray-300">
            Page {{ currentPage }} sur {{ pagination.totalPages }}
          </span>

          <button
            :disabled="currentPage >= pagination.totalPages"
            @click="currentPage++"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <font-awesome-icon icon="chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>

    <!-- CTA Signalement -->
    <section class="py-12 lg:py-16 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
          Vous avez des informations à partager ?
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Si vous avez connaissance d'un cas qui devrait être documenté, n'hésitez pas à nous contacter.
        </p>
        <NuxtLink to="/signaler" class="btn-ti">
          <font-awesome-icon icon="bullhorn" class="mr-2" />
          Signaler un cas
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
