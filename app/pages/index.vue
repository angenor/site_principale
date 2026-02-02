<script setup lang="ts">
const { setWebsiteSchema, setOrganizationSchema } = useJsonLd()

// Utiliser la config partagée
const { getConfig } = useAppSettings()

const reportCaseIntro = computed(() => getConfig('report_case_intro', 'Vous avez connaissance d\'un cas de mauvaise gouvernance ou d\'impact négatif lié à l\'exploitation minière ? Partagez l\'information de manière sécurisée.'))

// Métadonnées de la page
useSeoMeta({
  title: 'Accueil',
  ogTitle: 'Observatoire des Mines de Madagascar',
  description: 'L\'Observatoire des Mines de Madagascar (MOM) promeut la transparence et la bonne gouvernance dans le secteur minier malgache.',
  ogDescription: 'Plateforme de suivi de la gouvernance minière à Madagascar par Transparency International et PCQVP.',
  ogType: 'website',
  ogImage: '/images/og-image.jpg',
  twitterCard: 'summary_large_image'
})

// Données structurées JSON-LD
setWebsiteSchema()
setOrganizationSchema()
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
          {{ reportCaseIntro }}
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
