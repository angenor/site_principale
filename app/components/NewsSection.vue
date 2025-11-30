<script setup lang="ts">
// Actualités (à terme, chargées depuis la base de données)
const news = ref([
  {
    id: 1,
    title: 'Lancement de l\'Observatoire des Mines de Madagascar',
    excerpt: 'TI Madagascar et PCQVP lancent une nouvelle plateforme pour renforcer la transparence dans le secteur minier.',
    image: '/images/news/launch.jpg',
    date: '2025-11-15',
    slug: 'lancement-observatoire-mines'
  },
  {
    id: 2,
    title: 'Rapport sur les impacts environnementaux à Ilakaka',
    excerpt: 'Une nouvelle étude révèle les conséquences de l\'exploitation de saphirs sur l\'écosystème local.',
    image: '/images/news/environment.jpg',
    date: '2025-11-10',
    slug: 'rapport-impacts-ilakaka'
  },
  {
    id: 3,
    title: 'Consultation communautaire à Moramanga',
    excerpt: 'Les communautés locales s\'expriment sur les projets d\'exploitation de nickel dans la région.',
    image: '/images/news/community.jpg',
    date: '2025-11-05',
    slug: 'consultation-moramanga'
  }
])

// Formater la date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
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

      <!-- Grille des actualités -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <AppCard
          v-for="item in news"
          :key="item.id"
          :image="item.image"
          :title="item.title"
          :description="item.excerpt"
          :date="item.date"
          :link-to="`/actualites/${item.slug}`"
          variant="default"
        />
      </div>
    </div>
  </section>
</template>
