<script setup lang="ts">
const { getConfig } = useAppSettings()

const introText = computed(() => getConfig('resources_reports_intro', 'Rapports, guides et recherches sur la gouvernance minière à Madagascar, à télécharger dans les langues disponibles'))

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Rapports - Ressources - Observatoire des Mines de Madagascar',
  description: 'Téléchargez les rapports, guides et recherches sur la gouvernance minière à Madagascar, en malgache, en français ou en anglais.'
})

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  count: number
}

interface ResourceItem {
  id: string
  slug: string
  title: string
  description: string | null
  authorName: string | null
  coverImage: string | null
  files: ResourceFileVersion[]
  downloadCount: number
  publishedAt: string | null
  category: Category | null
}

interface ResourceResponse {
  data: ResourceItem[]
  categories: Category[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const currentPage = ref(1)
const sortOrder = ref<'recent' | 'oldest'>('recent')
const selectedCategory = ref('')

const { data: resourcesData, status } = await useFetch<ResourceResponse>('/api/resources', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 12,
    sort: sortOrder.value,
    category: selectedCategory.value
  }))
})

const resources = computed(() => resourcesData.value?.data || [])
const categories = computed(() => resourcesData.value?.categories || [])
const pagination = computed(() => resourcesData.value?.pagination)

function changePage(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function filterByCategory(categoryId: string) {
  selectedCategory.value = categoryId
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <ResourcesHeader :subtitle="introText" />

    <!-- Filtres -->
    <section class="py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm text-gray-600 dark:text-gray-400">Catégorie :</span>
            <button
              @click="selectedCategory = ''"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
                selectedCategory === ''
                  ? 'bg-ti-blue text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              Toutes
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5',
                selectedCategory === cat.id
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:opacity-80'
              ]"
              :style="{
                backgroundColor: selectedCategory === cat.id
                  ? (cat.color || '#3B82F6')
                  : (cat.color || '#3B82F6') + '20',
                color: selectedCategory === cat.id ? 'white' : (cat.color || '#3B82F6')
              }"
            >
              <font-awesome-icon v-if="cat.icon && !cat.icon.startsWith('/')" :icon="cat.icon" class="text-xs" />
              {{ cat.name }}
              <span class="opacity-70">({{ cat.count }})</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Trier :</span>
            <select
              v-model="sortOrder"
              class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ti-blue focus:border-transparent cursor-pointer"
            >
              <option value="recent">Plus récent</option>
              <option value="oldest">Plus ancien</option>
            </select>
          </div>
        </div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          <span v-if="pagination">{{ pagination.total }} rapport(s) disponible(s)</span>
        </p>
      </div>
    </section>

    <!-- Liste des ressources -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading -->
        <div v-if="status === 'pending'" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="animate-pulse bg-gray-200 dark:bg-gray-700 h-[32rem] rounded-xl" />
        </div>

        <!-- Empty state -->
        <div v-else-if="resources.length === 0" class="text-center py-16">
          <font-awesome-icon icon="book" class="w-16 h-16 text-gray-400 mb-4" />
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun rapport disponible
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Les rapports seront publiés prochainement.
          </p>
        </div>

        <!-- Grille de ressources -->
        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ResourceCard
            v-for="item in resources"
            :key="item.id"
            :item="item"
            @select-category="filterByCategory"
          />
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="mt-12 flex justify-center">
          <nav class="flex items-center gap-2">
            <button
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <font-awesome-icon icon="chevron-left" />
            </button>

            <template v-for="page in pagination.totalPages" :key="page">
              <button
                v-if="page === 1 || page === pagination.totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
                @click="changePage(page)"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer',
                  page === currentPage
                    ? 'bg-ti-blue text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                {{ page }}
              </button>
              <span
                v-else-if="page === currentPage - 2 || page === currentPage + 2"
                class="px-2 text-gray-500"
              >
                ...
              </span>
            </template>

            <button
              :disabled="currentPage === pagination.totalPages"
              @click="changePage(currentPage + 1)"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <font-awesome-icon icon="chevron-right" />
            </button>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>
