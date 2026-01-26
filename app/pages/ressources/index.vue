<script setup lang="ts">
const { thumb } = useImageVariants()

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Ressources - Observatoire des Mines de Madagascar',
  description: 'Téléchargez guides, recherches et rapports sur la gouvernance minière à Madagascar.'
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
  fileUrl: string
  filename: string
  mimeType: string
  fileSize: number
  downloadCount: number
  publishedAt: string
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
  if (mimeType.includes('image')) return 'file-image'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'file-archive'
  return 'file'
}

function changePage(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function trackAndDownload(resource: ResourceItem) {
  // Track download
  try {
    await $fetch('/api/track/download', {
      method: 'POST',
      body: { resourceId: resource.id }
    })
  } catch (e) {
    console.error('Erreur de tracking:', e)
  }

  // Create download link
  const link = document.createElement('a')
  link.href = resource.fileUrl
  link.download = resource.filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function viewResource(resource: ResourceItem) {
  window.open(resource.fileUrl, '_blank')
}

function filterByCategory(categoryId: string) {
  selectedCategory.value = categoryId
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-ti-blue via-ti-blue-600 to-ti-blue-800 text-white py-16 lg:py-24">
      <div class="absolute inset-0 bg-black/20" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl lg:text-5xl font-bold mb-4">
            Ressources
          </h1>
          <p class="text-xl text-white/90 max-w-2xl mx-auto">
            Guides, recherches et rapports sur la gouvernance minière à Madagascar
          </p>
        </div>
      </div>
    </section>

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
          <span v-if="pagination">{{ pagination.total }} ressource(s) disponible(s)</span>
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
            Aucune ressource disponible
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Les ressources seront publiées prochainement.
          </p>
        </div>

        <!-- Grille de ressources avec design card -->
        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start justify-center gap-12 lg:gap-16">
          <article v-for="item in resources" :key="item.id">
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
                <font-awesome-icon :icon="getFileIcon(item.mimeType)" class="w-12 h-12 text-white/50" />
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
                <p class="text-gray-800 dark:text-gray-300 mt-4 leading-relaxed text-xs line-clamp-3 flex-1">
                  {{ item.description || 'Cliquez pour consulter cette ressource.' }}
                </p>
                <div class="flex justify-end items-center gap-3 mt-auto">
                  <button
                    @click="viewResource(item)"
                    class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="Voir le document"
                  >
                    <font-awesome-icon icon="eye" />
                  </button>
                  <a
                    :href="item.fileUrl"
                    target="_blank"
                    @click.prevent="trackAndDownload(item)"
                    class="flex items-center uppercase text-blue-800 dark:text-blue-400 font-semibold text-xs hover:underline cursor-pointer"
                  >
                    <span class="mr-3 block w-8 h-0.5 bg-blue-800 dark:bg-blue-400" />
                    télécharger
                  </a>
                </div>
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
