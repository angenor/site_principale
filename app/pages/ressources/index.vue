<script setup lang="ts">
const { thumb } = useImageVariants()
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

function formatDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

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
        <div v-if="status === 'pending'" class="grid md:grid-cols-2 xl:grid-cols-3 gap-x-20 gap-y-10">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
          </div>
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

        <!-- Grille de ressources avec design card -->
        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start justify-center gap-12 lg:gap-16">
          <article v-for="item in resources" :id="item.slug" :key="item.id" class="scroll-mt-28">
            <div class="relative">
              <!-- Image -->
              <img
                v-if="item.coverImage"
                :src="thumb(item.coverImage)"
                :alt="item.title"
                loading="lazy"
                class="w-full aspect-[3/2] lg:aspect-[3/4] h-32 lg:h-[22rem] object-cover shadow-lg"
              />
              <div
                v-else
                class="w-full aspect-[3/2] lg:aspect-[3/4] h-32 lg:h-[22rem] bg-gradient-to-br from-ti-blue to-ti-blue-700 shadow-lg flex items-center justify-center"
              >
                <font-awesome-icon :icon="getFileIcon(item.files[0]?.mimeType)" class="w-12 h-12 text-white/50" />
              </div>

              <!-- Info Card avec design chevauchant -->
              <div class="lg:rounded-l-[20px] lg:rounded-t-[20px] bg-white dark:bg-gray-800 lg:absolute bottom-6 -right-10 lg:w-[13rem] px-5 pt-4 pb-6 lg:h-72 shadow flex flex-col">
                <span class="inline-block text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(item.publishedAt) }}
                </span>
                <h2 class="text-lg font-bold leading-tight mt-1 mb-1.5 text-gray-900 dark:text-white line-clamp-2">
                  {{ item.title }}
                </h2>
                <button
                  v-if="item.category"
                  @click="filterByCategory(item.category.id)"
                  class="inline-block text-blue-400 text-xs capitalize hover:underline cursor-pointer text-left"
                >
                  {{ item.category.name }}
                </button>
                <div v-if="item.files.length" class="flex flex-wrap gap-1 mt-2" aria-label="Langues disponibles">
                  <span
                    v-for="file in item.files"
                    :key="file.id"
                    class="px-1.5 py-0.5 rounded text-[0.65rem] font-bold bg-ti-blue/10 text-ti-blue dark:text-blue-300"
                    :title="file.languageLabel"
                  >
                    {{ file.languageCode }}
                  </span>
                </div>
                <p class="text-gray-800 dark:text-gray-300 mt-3 leading-relaxed text-xs line-clamp-3 flex-1">
                  {{ item.description || 'Téléchargez ce rapport pour le consulter.' }}
                </p>
                <ResourceDownloadMenu
                  class="mt-auto"
                  :resource-id="item.id"
                  :title="item.title"
                  :files="item.files"
                />
              </div>
            </div>
          </article>
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
