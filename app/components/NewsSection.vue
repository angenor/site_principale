<script setup lang="ts">
interface NewsItem {
  id: number
  title: string
  summary: string | null
  coverImage: string | null
  publishedAt: string | null
  slug: string
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

// Charger les actualités depuis l'API
const { data: newsResponse, pending, error } = await useFetch<NewsResponse>('/api/news', {
  query: {
    limit: 3
  }
})

// Computed pour faciliter l'accès aux données
const news = computed(() => newsResponse.value?.data || [])
</script>

<template>
  <section class="py-16 lg:py-24 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête de section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h2 class="text-3xl lg:text-4xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-2">
            Actualités
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Les dernières nouvelles du secteur minier malgache
          </p>
        </div>
        <NuxtLink
          to="/actualites"
          class="btn-ti-outline text-sm"
        >
          Toutes les actualités
          <font-awesome-icon icon="arrow-right" class="ml-2" />
        </NuxtLink>
      </div>

      <!-- État de chargement -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="bg-gray-200 dark:bg-gray-700 aspect-video rounded-xl mb-4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500 dark:text-red-400">
          Impossible de charger les actualités. Veuillez réessayer plus tard.
        </p>
      </div>

      <!-- Grille des actualités -->
      <div v-else-if="news.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <AppCard
          v-for="item in news"
          :key="item.id"
          :image="item.coverImage || '/images/placeholder-news.jpg'"
          :title="item.title"
          :description="item.summary || ''"
          :date="item.publishedAt || undefined"
          :link-to="`/actualites/${item.slug}`"
          variant="default"
        />
      </div>

      <!-- Message si aucune actualité -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">
          Aucune actualité disponible pour le moment.
        </p>
      </div>
    </div>
  </section>
</template>
