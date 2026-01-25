<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Actualités - Observatoire des Mines de Madagascar',
  description: 'Suivez les dernières actualités sur la gouvernance minière, la transparence et la durabilité à Madagascar.'
})

interface NewsItem {
  id: string
  slug: string
  title: string
  summary: string | null
  coverImage: string | null
  externalUrl: string | null
  publishedAt: string
}

interface NewsResponse {
  data: NewsItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const currentPage = ref(1)
const sortOrder = ref<'recent' | 'oldest'>('recent')

const { data: newsData, status, refresh } = await useFetch<NewsResponse>('/api/news', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 9,
    sort: sortOrder.value
  }))
})

const news = computed(() => newsData.value?.data || [])
const pagination = computed(() => newsData.value?.pagination)

function formatDate(date: string) {
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
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-ti-blue via-ti-blue-600 to-ti-blue-800 text-white py-16 lg:py-24">
      <div class="absolute inset-0 bg-black/20" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl lg:text-5xl font-bold mb-4">
            Actualités
          </h1>
          <p class="text-xl text-white/90 max-w-2xl mx-auto">
            Suivez les dernières nouvelles sur la gouvernance minière et la transparence à Madagascar
          </p>
        </div>
      </div>
    </section>

    <!-- Filtres -->
    <section class="py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <p class="text-gray-600 dark:text-gray-400">
            <span v-if="pagination">{{ pagination.total }} actualité(s)</span>
          </p>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Trier par :</span>
            <select
              v-model="sortOrder"
              class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-ti-blue focus:border-transparent cursor-pointer"
            >
              <option value="recent">Plus récent</option>
              <option value="oldest">Plus ancien</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Liste des actualités -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading -->
        <div v-if="status === 'pending'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="bg-gray-200 dark:bg-gray-700 rounded-xl h-48" />
            <div class="mt-4 space-y-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="news.length === 0" class="text-center py-16">
          <font-awesome-icon icon="newspaper" class="w-16 h-16 text-gray-400 mb-4" />
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucune actualité disponible
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Les actualités seront publiées prochainement.
          </p>
        </div>

        <!-- Grille d'actualités -->
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article
            v-for="item in news"
            :key="item.id"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
            @click="item.externalUrl ? window.open(item.externalUrl, '_blank') : navigateTo(`/actualites/${item.slug}`)"
          >
            <!-- Image -->
            <div class="relative h-48 overflow-hidden">
              <img
                v-if="item.coverImage"
                :src="item.coverImage"
                :alt="item.title"
                loading="lazy"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-ti-blue/20 to-ti-blue/40 flex items-center justify-center">
                <font-awesome-icon icon="newspaper" class="w-12 h-12 text-ti-blue/60" />
              </div>
              <div v-if="item.externalUrl" class="absolute top-3 right-3">
                <span class="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                  <font-awesome-icon icon="external-link-alt" class="mr-1" />
                  Source externe
                </span>
              </div>
            </div>

            <!-- Contenu -->
            <div class="p-5">
              <time class="text-sm text-ti-blue dark:text-ti-blue-400 font-medium">
                {{ formatDate(item.publishedAt) }}
              </time>
              <h2 class="mt-2 text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-ti-blue dark:group-hover:text-ti-blue-400 transition-colors">
                {{ item.title }}
              </h2>
              <p v-if="item.summary" class="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                {{ item.summary }}
              </p>

              <span class="inline-flex items-center gap-1 mt-4 text-ti-blue dark:text-ti-blue-400 font-medium text-sm group-hover:underline">
                Lire la suite
                <font-awesome-icon :icon="item.externalUrl ? 'external-link-alt' : 'arrow-right'" class="w-3 h-3" />
              </span>
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
