<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Audios/Vidéos - Ressources - Observatoire des Mines de Madagascar',
  description: 'Émissions, podcasts, face-à-face et contenus éducatifs sur la gouvernance minière à Madagascar.'
})

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  count: number
}

interface ListResponse {
  view: 'list'
  data: AudioVideoSummary[]
  categories: Category[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface GroupsResponse {
  view: 'categories'
  groups: { category: Category; items: AudioVideoSummary[] }[]
  categories: Category[]
}

type ViewMode = 'list' | 'categories'

const route = useRoute()
const router = useRouter()

// Filtres repris de l'adresse, pour pouvoir partager une sélection
const viewMode = ref<ViewMode>(route.query.vue === 'categories' ? 'categories' : 'list')
const selectedCategory = ref((route.query.categorie as string) || '')
const sortOrder = ref<'recent' | 'oldest'>(route.query.tri === 'ancien' ? 'oldest' : 'recent')
const currentPage = ref(Math.max(parseInt(route.query.page as string) || 1, 1))

watch([viewMode, selectedCategory, sortOrder, currentPage], () => {
  router.replace({
    query: {
      ...(viewMode.value === 'categories' ? { vue: 'categories' } : {}),
      ...(selectedCategory.value ? { categorie: selectedCategory.value } : {}),
      ...(sortOrder.value === 'oldest' ? { tri: 'ancien' } : {}),
      ...(currentPage.value > 1 ? { page: String(currentPage.value) } : {})
    },
    hash: route.hash
  })
})

// La vue par catégorie ne s'applique qu'à l'ensemble des catégories
const effectiveView = computed<ViewMode>(() => selectedCategory.value ? 'list' : viewMode.value)

const { data, status } = await useFetch<ListResponse | GroupsResponse>('/api/audio-videos', {
  query: computed(() => ({
    view: effectiveView.value,
    page: currentPage.value,
    limit: 12,
    sort: sortOrder.value,
    category: selectedCategory.value
  }))
})

const categories = computed(() => data.value?.categories || [])
const listData = computed(() => data.value?.view === 'list' ? data.value : null)
const groups = computed(() => data.value?.view === 'categories' ? data.value.groups : [])
const totalCount = computed(() => categories.value.reduce((sum, cat) => sum + cat.count, 0))
const activeCategory = computed(() => categories.value.find(cat => cat.id === selectedCategory.value) || null)

const isEmpty = computed(() => effectiveView.value === 'list'
  ? (listData.value?.data.length ?? 0) === 0
  : groups.value.length === 0)

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
  currentPage.value = 1
  scrollToResults()
}

function setView(mode: ViewMode) {
  viewMode.value = mode
  selectedCategory.value = ''
  currentPage.value = 1
}

function setSort(order: 'recent' | 'oldest') {
  sortOrder.value = order
  currentPage.value = 1
}

function changePage(page: number) {
  currentPage.value = page
  scrollToResults()
}

const resultsRef = ref<HTMLElement | null>(null)
function scrollToResults() {
  resultsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function chipStyle(cat: Category, active: boolean) {
  const color = cat.color || '#3B82F6'
  return {
    backgroundColor: active ? color : `${color}20`,
    color: active ? 'white' : color
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <ResourcesHeader subtitle="Émissions, podcasts, face-à-face et contenus éducatifs sur la gouvernance minière à Madagascar" />

    <!-- Filtres -->
    <section class="py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Mode d'affichage -->
          <div class="inline-flex self-start rounded-lg bg-gray-100 dark:bg-gray-700 p-1" role="group" aria-label="Affichage">
            <button
              v-for="mode in ([
                { value: 'list', label: 'Plus récents', icon: 'calendar' },
                { value: 'categories', label: 'Par catégorie', icon: 'tags' }
              ] as const)"
              :key="mode.value"
              type="button"
              :aria-pressed="effectiveView === mode.value && !selectedCategory"
              :class="[
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer',
                effectiveView === mode.value && !selectedCategory
                  ? 'bg-white dark:bg-gray-800 text-ti-blue dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              ]"
              @click="setView(mode.value)"
            >
              <font-awesome-icon :icon="mode.icon" class="mr-2" />
              {{ mode.label }}
            </button>
          </div>

          <div v-if="effectiveView === 'list'" class="flex items-center gap-2">
            <label for="av-sort" class="text-sm text-gray-600 dark:text-gray-400">Trier :</label>
            <select
              id="av-sort"
              :value="sortOrder"
              class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ti-blue focus:border-transparent cursor-pointer"
              @change="setSort(($event.target as HTMLSelectElement).value as 'recent' | 'oldest')"
            >
              <option value="recent">Plus récent</option>
              <option value="oldest">Plus ancien</option>
            </select>
          </div>
        </div>

        <!-- Catégories -->
        <div v-if="categories.length" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-600 dark:text-gray-400">Catégorie :</span>
          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
              selectedCategory === ''
                ? 'bg-ti-blue text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
            @click="selectCategory('')"
          >
            Toutes <span class="opacity-70">({{ totalCount }})</span>
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            :aria-pressed="selectedCategory === cat.id"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-opacity cursor-pointer flex items-center gap-1.5 hover:opacity-80"
            :style="chipStyle(cat, selectedCategory === cat.id)"
            @click="selectCategory(cat.id)"
          >
            <CategoryIcon :icon="cat.icon" class="text-xs" />
            {{ cat.name }}
            <span class="opacity-70">({{ cat.count }})</span>
          </button>
        </div>
      </div>
    </section>

    <section ref="resultsRef" class="py-12 scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Chargement -->
        <div v-if="status === 'pending' && !data" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="animate-pulse bg-gray-200 dark:bg-gray-700 h-80 rounded-xl" />
        </div>

        <!-- Aucun contenu -->
        <div v-else-if="isEmpty" class="text-center py-16">
          <font-awesome-icon icon="video" class="text-5xl text-gray-400 mb-4" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun audio ou vidéo disponible
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Les contenus audios et vidéos seront publiés prochainement.
          </p>
        </div>

        <!-- Vue par catégorie -->
        <div v-else-if="effectiveView === 'categories'" class="space-y-14" :class="{ 'opacity-60': status === 'pending' }">
          <section v-for="group in groups" :key="group.category.id" :aria-labelledby="`group-${group.category.id}`">
            <div class="flex items-end justify-between gap-4 mb-5 pb-3 border-b-2" :style="{ borderColor: group.category.color || '#3B82F6' }">
              <h2 :id="`group-${group.category.id}`" class="text-2xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span
                  class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-base"
                  :style="{ backgroundColor: group.category.color || '#3B82F6' }"
                >
                  <CategoryIcon :icon="group.category.icon || 'play'" />
                </span>
                {{ group.category.name }}
              </h2>
              <button
                v-if="group.category.count > group.items.length"
                type="button"
                class="shrink-0 text-sm font-semibold text-ti-blue dark:text-blue-400 hover:underline cursor-pointer"
                @click="selectCategory(group.category.id)"
              >
                Voir tout ({{ group.category.count }})
                <font-awesome-icon icon="arrow-right" class="ml-1 text-xs" />
              </button>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AudioVideoCard
                v-for="item in group.items"
                :key="item.id"
                :item="item"
                @select-category="selectCategory"
              />
            </div>
          </section>
        </div>

        <!-- Vue chronologique -->
        <div v-else-if="listData" :class="{ 'opacity-60': status === 'pending' }">
          <p class="mb-6 text-gray-600 dark:text-gray-400">
            {{ listData.pagination.total }} contenu(s)
            <template v-if="activeCategory"> dans la catégorie <strong class="text-gray-900 dark:text-white">{{ activeCategory.name }}</strong></template>
          </p>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AudioVideoCard
              v-for="item in listData.data"
              :key="item.id"
              :item="item"
              @select-category="selectCategory"
            />
          </div>

          <div v-if="listData.pagination.totalPages > 1" class="mt-12 flex justify-center">
            <AppPagination
              :current-page="currentPage"
              :total-pages="listData.pagination.totalPages"
              @update:current-page="changePage"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
