<script setup lang="ts">
interface Partner {
  id: string
  name: string
  logo: string
  websiteUrl: string | null
  description: string | null
  sortOrder: number
}

// Charger les partenaires depuis l'API
const { data: partners, pending, error } = await useFetch<Partner[]>('/api/partners')

// Charger la configuration du site
const { data: siteConfig } = await useFetch<Record<string, string>>('/api/config')

// Texte d'introduction (dynamique ou fallback)
const introText = computed(() => {
  return siteConfig.value?.partners_intro || 'Ensemble pour une gouvernance minière transparente'
})

// Dupliquer les partenaires pour créer un effet de défilement infini
const duplicatedPartners = computed(() => {
  const p = partners.value || []
  return [...p, ...p]
})
</script>

<template>
  <section class="py-16 lg:py-20 bg-white dark:bg-gray-900 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Titre -->
      <div class="text-center mb-12">
        <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
          Nos Partenaires
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ introText }}
        </p>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="pending" class="flex justify-center gap-8 lg:gap-12">
      <div v-for="i in 4" :key="i" class="animate-pulse">
        <div class="h-12 lg:h-16 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500 dark:text-red-400">
        Impossible de charger les partenaires.
      </p>
    </div>

    <!-- Logos défilants -->
    <div v-else-if="partners && partners.length > 0" class="relative">
      <!-- Gradient masques -->
      <div class="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10" />
      <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10" />

      <!-- Conteneur de défilement -->
      <div class="flex animate-scroll">
        <div
          v-for="(partner, index) in duplicatedPartners"
          :key="`${partner.id}-${index}`"
          class="flex-shrink-0 mx-8 lg:mx-12"
        >
          <a
            v-if="partner.websiteUrl"
            :href="partner.websiteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="block grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            :title="partner.name"
          >
            <img
              :src="partner.logo"
              :alt="partner.name"
              class="h-12 lg:h-16 w-auto object-contain"
            />
          </a>
          <div
            v-else
            class="grayscale opacity-60"
            :title="partner.name"
          >
            <img
              :src="partner.logo"
              :alt="partner.name"
              class="h-12 lg:h-16 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Message si aucun partenaire -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600 dark:text-gray-400">
        Aucun partenaire disponible pour le moment.
      </p>
    </div>

    <!-- CTA -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div class="text-center">
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Vous souhaitez rejoindre notre réseau de partenaires ?
        </p>
        <NuxtLink
          to="/a-propos#partenaires"
          class="inline-flex items-center text-ti-blue hover:text-ti-blue-700 dark:text-ti-blue-400 dark:hover:text-ti-blue-300 font-semibold transition-colors duration-200"
        >
          Devenir partenaire
          <font-awesome-icon icon="arrow-right" class="ml-2 w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll 30s linear infinite;
}

.animate-scroll:hover {
  animation-play-state: paused;
}
</style>
