<script setup lang="ts">
const { thumb } = useImageVariants()

// Utiliser la config partagée
const { getConfig } = useAppSettings()

const introText = computed(() => getConfig('news_intro', 'Les dernières nouvelles du secteur minier malgache'))

interface NewsItem {
  id: string
  title: string
  summary: string | null
  coverImage: string | null
  publishedAt: string | null
  slug: string
  externalUrl: string | null
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

// Charger les actualités depuis l'API avec featured
const { data: newsResponse, pending, error } = await useFetch<NewsHomeResponse>('/api/news/home', {
  query: {
    limit: 4
  }
})

// Actualité en vedette (affichée en grand à gauche)
const featured = computed(() => newsResponse.value?.featured)

// Autres actualités récentes (à droite, max 2)
const latestNews = computed(() => {
  const latest = newsResponse.value?.latest?.data || []
  // Si on a une featured, on prend les 2 premières actualités récentes (exclure la featured si elle y est)
  if (featured.value) {
    return latest.filter(item => item.id !== featured.value?.id).slice(0, 2)
  }
  // Sinon, on prend les 3 premières
  return latest.slice(0, 3)
})

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
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
  <section class="py-16 lg:py-24 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête de section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h2 class="text-3xl lg:text-4xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-2">
            Actualités
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ introText }}
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
      <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div class="animate-pulse">
          <div class="bg-gray-200 dark:bg-gray-700 aspect-[4/3] rounded-xl mb-4"></div>
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div class="space-y-6">
          <div v-for="i in 2" :key="i" class="animate-pulse flex gap-4">
            <div class="bg-gray-200 dark:bg-gray-700 w-32 h-24 rounded-lg flex-shrink-0"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500 dark:text-red-400">
          Impossible de charger les actualités. Veuillez réessayer plus tard.
        </p>
      </div>

      <!-- Layout avec Featured + Latest -->
      <div v-else-if="featured || latestNews.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- Colonne gauche: Actualité en vedette -->
        <article
          v-if="featured"
          class="group cursor-pointer"
          @click="navigateToNews(featured)"
        >
          <div class="relative overflow-hidden rounded-xl mb-4">
            <img
              v-if="featured.coverImage"
              :src="thumb(featured.coverImage)"
              :alt="featured.title"
              class="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full aspect-[4/3] bg-gradient-to-br from-indigo-500/20 to-indigo-500/40 flex items-center justify-center">
              <font-awesome-icon icon="newspaper" class="w-16 h-16 text-indigo-500/60" />
            </div>
            <!-- Badge En vedette -->
            <div class="absolute top-4 left-4">
              <span class="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded font-semibold uppercase tracking-wide">
                En vedette
              </span>
            </div>
            <!-- Badge externe -->
            <div v-if="featured.externalUrl" class="absolute top-4 right-4">
              <span class="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                <font-awesome-icon icon="external-link-alt" class="mr-1" />
                Externe
              </span>
            </div>
          </div>
          <time v-if="featured.publishedAt" class="text-sm text-ti-blue dark:text-ti-blue-400 font-medium">
            {{ formatDate(featured.publishedAt) }}
          </time>
          <h3 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:text-ti-blue dark:group-hover:text-ti-blue-400 transition-colors line-clamp-2">
            {{ featured.title }}
          </h3>
          <p v-if="featured.summary" class="mt-3 text-gray-600 dark:text-gray-400 line-clamp-3">
            {{ featured.summary }}
          </p>
          <span class="inline-flex items-center gap-2 mt-4 text-ti-blue dark:text-ti-blue-400 font-medium group-hover:underline">
            Lire la suite
            <font-awesome-icon :icon="featured.externalUrl ? 'external-link-alt' : 'arrow-right'" class="w-4 h-4" />
          </span>
        </article>

        <!-- Colonne droite: Actualités récentes -->
        <div class="space-y-6" :class="{ 'lg:col-span-2': !featured }">
          <!-- Si pas de featured, afficher en grille -->
          <div v-if="!featured" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article
              v-for="item in latestNews"
              :key="item.id"
              class="group cursor-pointer"
              @click="navigateToNews(item)"
            >
              <div class="relative overflow-hidden rounded-xl mb-3">
                <img
                  v-if="item.coverImage"
                  :src="thumb(item.coverImage)"
                  :alt="item.title"
                  class="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="w-full aspect-video bg-gradient-to-br from-ti-blue/20 to-ti-blue/40 flex items-center justify-center">
                  <font-awesome-icon icon="newspaper" class="w-8 h-8 text-ti-blue/60" />
                </div>
              </div>
              <time v-if="item.publishedAt" class="text-xs text-ti-blue dark:text-ti-blue-400 font-medium">
                {{ formatDate(item.publishedAt) }}
              </time>
              <h3 class="mt-1 font-bold text-gray-900 dark:text-white group-hover:text-ti-blue dark:group-hover:text-ti-blue-400 transition-colors line-clamp-2">
                {{ item.title }}
              </h3>
            </article>
          </div>

          <!-- Si featured existe, afficher les autres en liste horizontale -->
          <template v-else>
            <article
              v-for="item in latestNews"
              :key="item.id"
              class="flex gap-4 group cursor-pointer"
              @click="navigateToNews(item)"
            >
              <div class="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  v-if="item.coverImage"
                  :src="thumb(item.coverImage)"
                  :alt="item.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-ti-blue/20 to-ti-blue/40 flex items-center justify-center">
                  <font-awesome-icon icon="newspaper" class="w-6 h-6 text-ti-blue/60" />
                </div>
                <div v-if="item.externalUrl" class="absolute top-1 right-1">
                  <span class="bg-white/90 dark:bg-gray-800/90 px-1 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300">
                    <font-awesome-icon icon="external-link-alt" />
                  </span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <time v-if="item.publishedAt" class="text-xs text-ti-blue dark:text-ti-blue-400 font-medium">
                  {{ formatDate(item.publishedAt) }}
                </time>
                <h3 class="mt-1 font-bold text-gray-900 dark:text-white group-hover:text-ti-blue dark:group-hover:text-ti-blue-400 transition-colors line-clamp-2">
                  {{ item.title }}
                </h3>
                <p v-if="item.summary" class="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {{ item.summary }}
                </p>
              </div>
            </article>

            <!-- Lien vers toutes les actualités -->
            <NuxtLink
              to="/actualites"
              class="inline-flex items-center text-ti-blue dark:text-ti-blue-400 font-medium hover:underline"
            >
              Voir toutes les actualités
              <font-awesome-icon icon="arrow-right" class="ml-2 w-4 h-4" />
            </NuxtLink>
          </template>
        </div>
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
