<script setup lang="ts">
// Métadonnées de la page
useHead({
  title: 'Études de cas - Observatoire des Mines de Madagascar',
  meta: [
    {
      name: 'description',
      content: 'Découvrez les études de cas documentées par l\'Observatoire des Mines de Madagascar sur les activités minières et leurs impacts.'
    }
  ]
})

// Catégories (à terme, chargées depuis l'API)
const categories = ref([
  { id: 1, name: 'Pierres précieuses', slug: 'pierres-precieuses', color: '#e31c79', icon: 'gem' },
  { id: 2, name: 'Métaux précieux', slug: 'metaux-precieux', color: '#ffb81c', icon: 'coins' },
  { id: 3, name: 'Métaux de base', slug: 'metaux-base', color: '#22c55e', icon: 'cubes' },
  { id: 4, name: 'Minerais industriels', slug: 'minerais-industriels', color: '#3695d8', icon: 'industry' },
  { id: 5, name: 'Terres rares', slug: 'terres-rares', color: '#8b5cf6', icon: 'atom' },
  { id: 6, name: 'Matériaux de construction', slug: 'materiaux-construction', color: '#6b7280', icon: 'building' },
  { id: 7, name: 'Environnement', slug: 'environnement', color: '#c4d600', icon: 'leaf' },
  { id: 8, name: 'Social', slug: 'social', color: '#ee3124', icon: 'users' }
])

// Régions (à terme, chargées depuis l'API)
const regions = ref([
  { id: 1, name: 'Analamanga', code: 'ANA' },
  { id: 2, name: 'Alaotra-Mangoro', code: 'ALM' },
  { id: 3, name: 'Amoron\'i Mania', code: 'AMM' },
  { id: 4, name: 'Anosy', code: 'ANO' },
  { id: 5, name: 'Atsimo-Andrefana', code: 'ATA' },
  { id: 6, name: 'Atsimo-Atsinanana', code: 'ATS' },
  { id: 7, name: 'Atsinanana', code: 'ATN' },
  { id: 8, name: 'Betsiboka', code: 'BET' },
  { id: 9, name: 'Boeny', code: 'BOE' },
  { id: 10, name: 'Bongolava', code: 'BON' },
  { id: 11, name: 'Diana', code: 'DIA' },
  { id: 12, name: 'Haute Matsiatra', code: 'HMA' },
  { id: 13, name: 'Ihorombe', code: 'IHO' },
  { id: 14, name: 'Itasy', code: 'ITA' },
  { id: 15, name: 'Melaky', code: 'MEL' },
  { id: 16, name: 'Menabe', code: 'MEN' },
  { id: 17, name: 'Sava', code: 'SAV' },
  { id: 18, name: 'Sofia', code: 'SOF' },
  { id: 19, name: 'Vakinankaratra', code: 'VAK' },
  { id: 20, name: 'Vatovavy', code: 'VAT' },
  { id: 21, name: 'Fitovinany', code: 'FIT' },
  { id: 22, name: 'Androy', code: 'AND' }
])

// Études de cas (à terme, chargées depuis l'API)
const allCaseStudies = ref([
  {
    id: 1,
    title: 'Exploitation de saphirs à Ilakaka',
    subtitle: 'Impact sur les communautés locales',
    excerpt: 'Analyse des conséquences sociales et environnementales de l\'exploitation de saphirs dans la région d\'Ihorombe.',
    image: '/images/cases/ilakaka.jpg',
    category: { id: 1, name: 'Pierres précieuses', slug: 'pierres-precieuses', color: '#e31c79' },
    region: { id: 13, name: 'Ihorombe' },
    date: '2025-10-20',
    slug: 'exploitation-saphirs-ilakaka'
  },
  {
    id: 2,
    title: 'Projet QMM à Fort-Dauphin',
    subtitle: 'Extraction d\'ilménite et ses conséquences',
    excerpt: 'Étude des impacts du projet d\'extraction d\'ilménite sur l\'environnement et les populations locales de la région Anosy.',
    image: '/images/cases/qmm.jpg',
    category: { id: 4, name: 'Minerais industriels', slug: 'minerais-industriels', color: '#3695d8' },
    region: { id: 4, name: 'Anosy' },
    date: '2025-10-15',
    slug: 'projet-qmm-fort-dauphin'
  },
  {
    id: 3,
    title: 'Mines d\'or artisanales à Betsiaka',
    subtitle: 'Enjeux de formalisation',
    excerpt: 'Documentation des pratiques d\'extraction artisanale de l\'or et des défis liés à la formalisation du secteur.',
    image: '/images/cases/betsiaka.jpg',
    category: { id: 2, name: 'Métaux précieux', slug: 'metaux-precieux', color: '#ffb81c' },
    region: { id: 11, name: 'Diana' },
    date: '2025-10-10',
    slug: 'mines-or-betsiaka'
  },
  {
    id: 4,
    title: 'Nickel et cobalt à Ambatovy',
    subtitle: 'Le plus grand investissement minier du pays',
    excerpt: 'Analyse complète du projet Ambatovy, ses retombées économiques et ses impacts environnementaux.',
    image: '/images/cases/ambatovy.jpg',
    category: { id: 3, name: 'Métaux de base', slug: 'metaux-base', color: '#22c55e' },
    region: { id: 2, name: 'Alaotra-Mangoro' },
    date: '2025-10-05',
    slug: 'nickel-cobalt-ambatovy'
  },
  {
    id: 5,
    title: 'Exploitation du graphite à Toamasina',
    subtitle: 'Minerai stratégique pour les batteries',
    excerpt: 'Le graphite malgache, essentiel pour les batteries de véhicules électriques, et les enjeux de son exploitation.',
    image: '/images/cases/graphite.jpg',
    category: { id: 4, name: 'Minerais industriels', slug: 'minerais-industriels', color: '#3695d8' },
    region: { id: 7, name: 'Atsinanana' },
    date: '2025-09-28',
    slug: 'exploitation-graphite-toamasina'
  },
  {
    id: 6,
    title: 'Terres rares à Ampasindava',
    subtitle: 'Ressources stratégiques et controverses',
    excerpt: 'Étude du projet d\'extraction de terres rares et les préoccupations environnementales associées.',
    image: '/images/cases/terres-rares.jpg',
    category: { id: 5, name: 'Terres rares', slug: 'terres-rares', color: '#8b5cf6' },
    region: { id: 11, name: 'Diana' },
    date: '2025-09-20',
    slug: 'terres-rares-ampasindava'
  }
])

// Filtres
const selectedCategory = ref<string>('')
const selectedRegion = ref<string>('')
const searchQuery = ref('')
const sortOrder = ref<'recent' | 'oldest'>('recent')

// Cas filtrés
const filteredCaseStudies = computed(() => {
  let result = [...allCaseStudies.value]

  // Filtre par catégorie
  if (selectedCategory.value) {
    result = result.filter(c => c.category.slug === selectedCategory.value)
  }

  // Filtre par région
  if (selectedRegion.value) {
    result = result.filter(c => c.region.id === parseInt(selectedRegion.value))
  }

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.subtitle.toLowerCase().includes(query) ||
      c.excerpt.toLowerCase().includes(query)
    )
  }

  // Tri par date
  result.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder.value === 'recent' ? dateB - dateA : dateA - dateB
  })

  return result
})

// Nombre de résultats
const resultCount = computed(() => filteredCaseStudies.value.length)

// Réinitialiser les filtres
const resetFilters = () => {
  selectedCategory.value = ''
  selectedRegion.value = ''
  searchQuery.value = ''
  sortOrder.value = 'recent'
}
</script>

<template>
  <div>
    <!-- Hero de la page -->
    <section class="bg-gradient-to-br from-ti-blue-600 to-ti-blue-800 py-16 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl lg:text-5xl font-heading font-bold uppercase text-white mb-4">
            Études de Cas
          </h1>
          <p class="text-lg text-blue-100 max-w-2xl mx-auto">
            Analyses approfondies des activités minières à Madagascar et de leurs impacts
            sur les communautés et l'environnement.
          </p>
        </div>
      </div>
    </section>

    <!-- Filtres et résultats -->
    <section class="py-12 lg:py-16 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Barre de filtres -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 lg:p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Recherche -->
            <div class="lg:col-span-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rechercher
              </label>
              <div class="relative">
                <font-awesome-icon
                  icon="search"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Mot-clé..."
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <!-- Catégorie -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                v-model="selectedCategory"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors cursor-pointer"
              >
                <option value="">Toutes les catégories</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.slug"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Région -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Région
              </label>
              <select
                v-model="selectedRegion"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors cursor-pointer"
              >
                <option value="">Toutes les régions</option>
                <option
                  v-for="region in regions"
                  :key="region.id"
                  :value="region.id"
                >
                  {{ region.name }}
                </option>
              </select>
            </div>

            <!-- Tri -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trier par
              </label>
              <select
                v-model="sortOrder"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors cursor-pointer"
              >
                <option value="recent">Plus récent</option>
                <option value="oldest">Plus ancien</option>
              </select>
            </div>
          </div>

          <!-- Actions des filtres -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <span class="font-semibold text-gray-900 dark:text-white">{{ resultCount }}</span>
              {{ resultCount > 1 ? 'études de cas trouvées' : 'étude de cas trouvée' }}
            </p>
            <button
              v-if="selectedCategory || selectedRegion || searchQuery"
              @click="resetFilters"
              class="text-sm text-ti-blue hover:text-ti-blue-700 dark:text-ti-blue-400 dark:hover:text-ti-blue-300 font-medium cursor-pointer"
            >
              <font-awesome-icon icon="times" class="mr-1" />
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        <!-- Grille des études de cas -->
        <div v-if="filteredCaseStudies.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AppCard
            v-for="caseStudy in filteredCaseStudies"
            :key="caseStudy.id"
            :image="caseStudy.image"
            :title="caseStudy.title"
            :subtitle="caseStudy.subtitle"
            :description="caseStudy.excerpt"
            :category="caseStudy.category.name"
            :category-color="caseStudy.category.color"
            :region="caseStudy.region.name"
            :date="caseStudy.date"
            :link-to="`/cas/${caseStudy.slug}`"
            variant="default"
          />
        </div>

        <!-- Message si aucun résultat -->
        <div v-else class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <font-awesome-icon icon="search" class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Aucun résultat trouvé
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
          </p>
          <button
            @click="resetFilters"
            class="btn-ti"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </section>

    <!-- CTA Signalement -->
    <section class="py-12 lg:py-16 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
          Vous avez des informations à partager ?
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Si vous avez connaissance d'un cas qui devrait être documenté, n'hésitez pas à nous contacter.
        </p>
        <NuxtLink to="/signaler" class="btn-ti">
          <font-awesome-icon icon="bullhorn" class="mr-2" />
          Signaler un cas
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
