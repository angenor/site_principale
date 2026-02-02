<script setup lang="ts">
// Utiliser la config partagée
const { getConfig } = useAppSettings()

const introText = computed(() => getConfig('case_studies_intro', 'Analyses approfondies des activités minières à Madagascar'))

interface Category {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
}

interface Region {
  id: number
  name: string
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
  region: Region | null
  categories: Category[]
}

// Charger les études de cas depuis l'API
const { data: caseStudies, pending, error } = await useFetch<CaseStudy[]>('/api/cases/featured', {
  query: {
    limit: 4
  }
})

// Cas mis en avant (le premier de la liste)
const featuredCase = computed(() => caseStudies.value?.[0] || null)
const otherCases = computed(() => caseStudies.value?.slice(1) || [])

// Helper pour obtenir la date à afficher
const getDisplayDate = (cs: CaseStudy) => cs.eventDate || cs.publishedAt || undefined
</script>

<template>
  <section class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête de section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h2 class="text-3xl lg:text-4xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-2">
            Études de Cas
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ introText }}
          </p>
        </div>
        <NuxtLink
          to="/cas"
          class="btn-ti-outline text-sm"
        >
          Tous les cas
          <font-awesome-icon icon="arrow-right" class="ml-2" />
        </NuxtLink>
      </div>

      <!-- État de chargement -->
      <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div class="lg:row-span-2 animate-pulse">
          <div class="bg-gray-200 dark:bg-gray-700 rounded-xl h-[400px] lg:h-full"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="bg-gray-200 dark:bg-gray-700 aspect-video rounded-xl mb-4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500 dark:text-red-400">
          Impossible de charger les études de cas. Veuillez réessayer plus tard.
        </p>
      </div>

      <!-- Layout : Featured + Grid -->
      <div v-else-if="featuredCase" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- Cas mis en avant -->
        <div class="lg:row-span-2">
          <AppCard
            :image="featuredCase.coverImage || '/images/placeholder-case.jpg'"
            :title="featuredCase.title"
            :subtitle="featuredCase.subtitle || undefined"
            :categories="featuredCase.categories"
            :region="featuredCase.region?.name"
            :date="getDisplayDate(featuredCase)"
            :link-to="`/cas/${featuredCase.slug}`"
            variant="featured"
            aspect-ratio="portrait"
            class="h-full min-h-[400px] lg:min-h-full"
          />
        </div>

        <!-- Autres cas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
          <AppCard
            v-for="caseStudy in otherCases"
            :key="caseStudy.id"
            :image="caseStudy.coverImage || '/images/placeholder-case.jpg'"
            :title="caseStudy.title"
            :categories="caseStudy.categories"
            :region="caseStudy.region?.name"
            :link-to="`/cas/${caseStudy.slug}`"
            variant="default"
            aspect-ratio="video"
            class="h-fit"
          />
        </div>
      </div>

      <!-- Message si aucune étude de cas -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">
          Aucune étude de cas disponible pour le moment.
        </p>
      </div>
    </div>
  </section>
</template>
