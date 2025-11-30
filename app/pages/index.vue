<script setup lang="ts">
// Métadonnées de la page
useHead({
  title: 'Observatoire des Mines de Madagascar - Accueil',
  meta: [
    {
      name: 'description',
      content: 'L\'Observatoire des Mines de Madagascar (MOM) promeut la transparence et la bonne gouvernance dans le secteur minier malgache.'
    },
    {
      property: 'og:title',
      content: 'Observatoire des Mines de Madagascar'
    },
    {
      property: 'og:description',
      content: 'Plateforme de suivi de la gouvernance minière à Madagascar par Transparency International et PCQVP.'
    },
    {
      property: 'og:type',
      content: 'website'
    }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Section avec slider -->
    <HeroSection />

    <!-- Section Axes Stratégiques -->
    <StrategicAxesSection />

    <!-- Section Actualités -->
    <NewsSection />

    <!-- Section Études de Cas -->
    <CaseStudiesSection />

    <!-- Section Partenaires -->
    <PartnersSection />

    <!-- Call to Action -->
    <section class="py-16 lg:py-24 section-ti-blue">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl lg:text-4xl font-heading font-bold uppercase text-white mb-6">
          Signaler un cas
        </h2>
        <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Vous avez connaissance d'un cas de mauvaise gouvernance ou d'impact négatif
          lié à l'exploitation minière ? Partagez l'information de manière sécurisée.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <NuxtLink
            to="/signaler"
            class="inline-flex items-center px-6 py-3 bg-white text-ti-blue font-heading font-semibold uppercase tracking-wide rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <font-awesome-icon icon="bullhorn" class="mr-2" />
            Faire un signalement
          </NuxtLink>
          <NuxtLink
            to="/a-propos"
            class="inline-flex items-center px-6 py-3 border-2 border-white text-white font-heading font-semibold uppercase tracking-wide rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            En savoir plus
            <font-awesome-icon icon="arrow-right" class="ml-2" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
