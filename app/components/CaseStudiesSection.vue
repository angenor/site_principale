<script setup lang="ts">
// Études de cas mises en avant (à terme, chargées depuis la base de données)
const caseStudies = ref([
  {
    id: 1,
    title: 'Exploitation de saphirs à Ilakaka',
    subtitle: 'Impact sur les communautés locales',
    image: '/images/cases/ilakaka.jpg',
    category: 'Pierres précieuses',
    categoryColor: '#e31c79',
    region: 'Ihorombe',
    date: '2025-10-20',
    slug: 'exploitation-saphirs-ilakaka'
  },
  {
    id: 2,
    title: 'Projet QMM à Fort-Dauphin',
    subtitle: 'Extraction d\'ilménite et ses conséquences',
    image: '/images/cases/qmm.jpg',
    category: 'Minerais industriels',
    categoryColor: '#3695d8',
    region: 'Anosy',
    date: '2025-10-15',
    slug: 'projet-qmm-fort-dauphin'
  },
  {
    id: 3,
    title: 'Mines d\'or artisanales à Betsiaka',
    subtitle: 'Enjeux de formalisation',
    image: '/images/cases/betsiaka.jpg',
    category: 'Or',
    categoryColor: '#ffb81c',
    region: 'Diana',
    date: '2025-10-10',
    slug: 'mines-or-betsiaka'
  },
  {
    id: 4,
    title: 'Nickel et cobalt à Ambatovy',
    subtitle: 'Le plus grand investissement minier du pays',
    image: '/images/cases/ambatovy.jpg',
    category: 'Métaux de base',
    categoryColor: '#22c55e',
    region: 'Alaotra-Mangoro',
    date: '2025-10-05',
    slug: 'nickel-cobalt-ambatovy'
  }
])

// Cas mis en avant (le premier de la liste)
const featuredCase = computed(() => caseStudies.value[0])
const otherCases = computed(() => caseStudies.value.slice(1))
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
            Analyses approfondies des activités minières à Madagascar
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

      <!-- Layout : Featured + Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- Cas mis en avant -->
        <div class="lg:row-span-2">
          <AppCard
            :image="featuredCase.image"
            :title="featuredCase.title"
            :subtitle="featuredCase.subtitle"
            :category="featuredCase.category"
            :category-color="featuredCase.categoryColor"
            :region="featuredCase.region"
            :date="featuredCase.date"
            :link-to="`/cas/${featuredCase.slug}`"
            variant="featured"
            aspect-ratio="portrait"
            class="h-full min-h-[400px] lg:min-h-full"
          />
        </div>

        <!-- Autres cas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AppCard
            v-for="caseStudy in otherCases"
            :key="caseStudy.id"
            :image="caseStudy.image"
            :title="caseStudy.title"
            :category="caseStudy.category"
            :category-color="caseStudy.categoryColor"
            :region="caseStudy.region"
            :link-to="`/cas/${caseStudy.slug}`"
            variant="default"
            aspect-ratio="video"
          />
        </div>
      </div>
    </div>
  </section>
</template>
