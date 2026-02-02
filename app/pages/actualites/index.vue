<script setup lang="ts">
const { thumb } = useImageVariants()

// Utiliser la config partagée
const { getConfig } = useAppSettings()

const introText = computed(() => getConfig('news_intro', 'Suivez les dernières nouvelles sur la gouvernance minière et la transparence à Madagascar'))

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

interface NewsHomeResponse {
  trending: NewsItem[]
  featured: NewsItem | null
  latest: {
    data: NewsItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

const currentPage = ref(1)

const { data: newsData, status } = await useFetch<NewsHomeResponse>('/api/news/home', {
  query: computed(() => ({
    page: currentPage.value,
    limit: 10
  }))
})

const trending = computed(() => newsData.value?.trending || [])
const featured = computed(() => newsData.value?.featured)
const latest = computed(() => newsData.value?.latest?.data || [])
const pagination = computed(() => newsData.value?.latest?.pagination)

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

function navigateToNews(item: NewsItem) {
  if (item.externalUrl) {
    window.open(item.externalUrl, '_blank')
  } else {
    navigateTo(`/actualites/${item.slug}`)
  }
}
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-900 min-h-screen">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-ti-blue via-ti-blue-600 to-ti-blue-800 text-white py-16 lg:py-24">
      <div class="absolute inset-0 bg-black/20" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl lg:text-5xl font-bold mb-4">
            Actualités
          </h1>
          <p class="text-xl text-white/90 max-w-2xl mx-auto">
            {{ introText }}
          </p>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="max-w-7xl mx-auto px-4 py-16">
      <div class="flex justify-center">
        <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-4xl" />
      </div>
    </div>

    <template v-else>
      <!-- Section À la une (Trending) -->
      <section v-if="trending.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h2 class="border-b-2 border-yellow-600 mb-6">
          <span class="bg-yellow-600 px-3 py-1.5 text-white uppercase tracking-wide text-sm font-semibold inline-block">
            À la une
          </span>
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Carte Trending -->
          <article
            v-for="item in trending"
            :key="item.id"
            class="h-72 md:h-96 block group relative overflow-hidden rounded-xl cursor-pointer"
            @click="navigateToNews(item)"
          >
            <!-- Image de fond -->
            <img
              v-if="item.coverImage"
              :src="thumb(item.coverImage)"
              :alt="item.title"
              class="absolute z-0 object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
            />
            <div v-else class="absolute z-0 w-full h-full bg-gradient-to-br from-ti-blue to-ti-blue-800" />

            <!-- Gradient overlay -->
            <div class="absolute inset-0 gradient-overlay transition-all duration-300 group-hover:bg-black/80 z-10" />

            <!-- Badge source externe -->
            <div v-if="item.externalUrl" class="absolute top-3 right-3 z-20">
              <span class="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                <font-awesome-icon icon="external-link-alt" class="mr-1" />
                Externe
              </span>
            </div>

            <!-- Contenu -->
            <div class="absolute inset-x-0 bottom-0 p-6 z-20">
              <!-- Titre toujours visible -->
              <div class="mb-0 group-hover:mb-4 transition-all duration-300">
                <time class="text-white/70 text-sm">{{ formatDate(item.publishedAt) }}</time>
                <h3 class="font-bold text-white text-xl leading-tight mt-2 group-hover:underline line-clamp-2">
                  {{ item.title }}
                </h3>
              </div>
              <!-- Contenu qui apparaît au hover -->
              <div class="max-h-0 overflow-hidden opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-300">
                <p v-if="item.summary" class="text-white/90 text-sm mb-4 line-clamp-2">{{ item.summary }}</p>
                <span class="inline-block bg-white text-gray-900 px-4 py-2 text-sm font-semibold hover:bg-gray-200 transition-colors">
                  {{ item.externalUrl ? 'Voir l\'article' : 'Lire la suite' }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Section principale: Récent + En vedette -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Récent (2/3 ou pleine largeur si pas de featured) -->
          <div :class="featured ? 'w-full lg:w-2/3' : 'w-full'">
            <h2 class="border-b-2 border-red-600 mb-6">
              <span class="bg-red-600 px-3 py-1.5 text-white uppercase tracking-wide text-sm font-semibold inline-block">
                Récent
              </span>
            </h2>

            <!-- Empty state -->
            <div v-if="latest.length === 0" class="text-center py-16">
              <font-awesome-icon icon="newspaper" class="w-16 h-16 text-gray-400 mb-4" />
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucune actualité disponible
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Les actualités seront publiées prochainement.
              </p>
            </div>

            <!-- Liste des actualités récentes -->
            <div v-else class="space-y-6">
              <article
                v-for="item in latest"
                :key="item.id"
                class="flex flex-col md:flex-row gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 cursor-pointer group"
                @click="navigateToNews(item)"
              >
                <!-- Image -->
                <div class="w-full md:w-1/4 flex-shrink-0">
                  <div class="relative">
                    <img
                      v-if="item.coverImage"
                      :src="thumb(item.coverImage)"
                      :alt="item.title"
                      class="w-full h-40 md:h-28 object-cover rounded-lg"
                    />
                    <div v-else class="w-full h-40 md:h-28 rounded-lg bg-gradient-to-br from-ti-blue/20 to-ti-blue/40 flex items-center justify-center">
                      <font-awesome-icon icon="newspaper" class="w-8 h-8 text-ti-blue/60" />
                    </div>
                    <div v-if="item.externalUrl" class="absolute top-2 right-2">
                      <span class="bg-white/90 dark:bg-gray-800/90 px-1.5 py-0.5 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                        <font-awesome-icon icon="external-link-alt" />
                      </span>
                    </div>
                  </div>
                </div>
                <!-- Contenu -->
                <div class="flex-1">
                  <h3 class="font-bold text-xl text-gray-900 dark:text-white group-hover:text-ti-blue dark:group-hover:text-ti-blue-400 leading-tight transition-colors">
                    {{ item.title }}
                  </h3>
                  <p v-if="item.summary" class="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {{ item.summary }}
                  </p>
                  <div class="text-gray-500 dark:text-gray-500 text-sm mt-2 italic">
                    Publié le {{ formatDate(item.publishedAt) }}
                  </div>
                </div>
              </article>
            </div>

            <!-- Pagination -->
            <div v-if="pagination && pagination.totalPages > 1" class="mt-8 flex justify-center">
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

          <!-- En vedette (1/3) - conditionnel -->
          <div v-if="featured" class="w-full lg:w-1/3">
            <h2 class="border-b-2 border-indigo-600 mb-6">
              <span class="bg-indigo-600 px-3 py-1.5 text-white uppercase tracking-wide text-sm font-semibold inline-block">
                En vedette
              </span>
            </h2>

            <article class="group cursor-pointer" @click="navigateToNews(featured)">
              <div class="relative">
                <img
                  v-if="featured.coverImage"
                  :src="thumb(featured.coverImage)"
                  :alt="featured.title"
                  class="w-full h-64 object-cover rounded-lg mb-4"
                />
                <div v-else class="w-full h-64 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-500/40 flex items-center justify-center mb-4">
                  <font-awesome-icon icon="newspaper" class="w-12 h-12 text-indigo-500/60" />
                </div>
                <div v-if="featured.externalUrl" class="absolute top-3 right-3">
                  <span class="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                    <font-awesome-icon icon="external-link-alt" class="mr-1" />
                    Externe
                  </span>
                </div>
              </div>
              <h3 class="font-bold text-2xl text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight transition-colors">
                {{ featured.title }}
              </h3>
              <p v-if="featured.summary" class="text-gray-600 dark:text-gray-400 mt-3 line-clamp-4">
                {{ featured.summary }}
              </p>
              <div class="text-gray-500 dark:text-gray-500 text-sm mt-3 italic">
                Publié le {{ formatDate(featured.publishedAt) }}
              </div>
              <span class="inline-flex items-center gap-2 mt-4 text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
                {{ featured.externalUrl ? 'Voir l\'article' : 'Lire la suite' }}
                <font-awesome-icon :icon="featured.externalUrl ? 'external-link-alt' : 'arrow-right'" class="w-4 h-4" />
              </span>
            </article>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.gradient-overlay {
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.8)
  );
}
</style>
