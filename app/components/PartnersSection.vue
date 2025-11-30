<script setup lang="ts">
// Partenaires (à terme, chargés depuis la base de données)
const partners = ref([
  {
    id: 1,
    name: 'Transparency International Madagascar',
    logo: '/images/logos/logo_fond_bleu_texte_blanc.jpeg',
    url: 'https://www.transparency.mg'
  },
  {
    id: 2,
    name: 'PCQVP Madagascar',
    logo: '/images/partners/pcqvp.png',
    url: 'https://www.pwyp.org'
  },
  {
    id: 3,
    name: 'Transparency International',
    logo: '/images/partners/ti-global.png',
    url: 'https://www.transparency.org'
  },
  {
    id: 4,
    name: 'EITI Madagascar',
    logo: '/images/partners/eiti.png',
    url: 'https://eiti.org'
  }
])

// Dupliquer les partenaires pour créer un effet de défilement infini
const duplicatedPartners = computed(() => [...partners.value, ...partners.value])
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
          Ensemble pour une gouvernance minière transparente
        </p>
      </div>
    </div>

    <!-- Logos défilants -->
    <div class="relative">
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
            :href="partner.url"
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
        </div>
      </div>
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
