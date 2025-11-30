<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// Données simulées (à terme, chargées depuis l'API)
const caseStudiesData: Record<string, any> = {
  'exploitation-saphirs-ilakaka': {
    id: 1,
    title: 'Exploitation de saphirs à Ilakaka',
    subtitle: 'Impact sur les communautés locales',
    coverImage: '/images/cases/ilakaka.jpg',
    category: { id: 1, name: 'Pierres précieuses', slug: 'pierres-precieuses', color: '#e31c79', icon: 'gem' },
    region: { id: 13, name: 'Ihorombe' },
    date: '2025-10-20',
    author: 'Équipe MOM',
    readTime: '12 min',
    keywords: ['saphir', 'exploitation artisanale', 'communautés', 'Ihorombe', 'impacts sociaux'],
    content: `
      <h2>Contexte</h2>
      <p>La découverte de gisements de saphirs à Ilakaka en 1998 a transformé radicalement cette région du sud de Madagascar. En quelques mois, un petit village est devenu l'un des plus grands centres d'exploitation de saphirs au monde, attirant des milliers de chercheurs de pierres précieuses.</p>

      <h2>Situation actuelle</h2>
      <p>Aujourd'hui, l'exploitation minière à Ilakaka reste largement artisanale et informelle. Les impacts sur les communautés locales sont multiples :</p>
      <ul>
        <li><strong>Démographie :</strong> La population a explosé, passant de quelques centaines à plus de 100 000 habitants.</li>
        <li><strong>Économie :</strong> L'économie locale dépend presque entièrement du secteur minier.</li>
        <li><strong>Environnement :</strong> Dégradation significative des sols et des ressources en eau.</li>
        <li><strong>Social :</strong> Augmentation des problèmes sociaux (travail des enfants, prostitution, criminalité).</li>
      </ul>

      <h2>Enjeux de gouvernance</h2>
      <p>La formalisation du secteur reste un défi majeur. Malgré les efforts du gouvernement pour encadrer l'activité, une grande partie de l'exploitation échappe au contrôle de l'État, privant ainsi les communautés locales des retombées fiscales.</p>

      <blockquote>
        "Les revenus générés par l'exploitation des saphirs devraient bénéficier en priorité aux communautés locales qui subissent les impacts négatifs de cette activité."
      </blockquote>

      <h2>Recommandations</h2>
      <p>L'Observatoire des Mines de Madagascar formule les recommandations suivantes :</p>
      <ol>
        <li>Renforcer le cadre réglementaire pour l'exploitation artisanale</li>
        <li>Améliorer la traçabilité des pierres précieuses</li>
        <li>Garantir une redistribution équitable des revenus miniers</li>
        <li>Mettre en place des programmes de réhabilitation environnementale</li>
        <li>Lutter contre le travail des enfants dans les mines</li>
      </ol>
    `,
    documents: [
      { id: 1, name: 'Rapport complet - Ilakaka 2025.pdf', size: '2.4 MB', url: '/documents/rapport-ilakaka-2025.pdf' },
      { id: 2, name: 'Données statistiques.xlsx', size: '156 KB', url: '/documents/donnees-ilakaka.xlsx' }
    ],
    gallery: [
      { id: 1, src: '/images/cases/ilakaka-1.jpg', alt: 'Vue aérienne des mines d\'Ilakaka' },
      { id: 2, src: '/images/cases/ilakaka-2.jpg', alt: 'Mineurs artisanaux au travail' },
      { id: 3, src: '/images/cases/ilakaka-3.jpg', alt: 'Impact environnemental' }
    ],
    relatedCases: [
      { id: 3, title: 'Mines d\'or artisanales à Betsiaka', slug: 'mines-or-betsiaka', image: '/images/cases/betsiaka.jpg' },
      { id: 6, title: 'Terres rares à Ampasindava', slug: 'terres-rares-ampasindava', image: '/images/cases/terres-rares.jpg' }
    ]
  },
  'projet-qmm-fort-dauphin': {
    id: 2,
    title: 'Projet QMM à Fort-Dauphin',
    subtitle: 'Extraction d\'ilménite et ses conséquences',
    coverImage: '/images/cases/qmm.jpg',
    category: { id: 4, name: 'Minerais industriels', slug: 'minerais-industriels', color: '#3695d8', icon: 'industry' },
    region: { id: 4, name: 'Anosy' },
    date: '2025-10-15',
    author: 'Équipe MOM',
    readTime: '15 min',
    keywords: ['ilménite', 'QMM', 'Rio Tinto', 'Anosy', 'industrie minière'],
    content: `
      <h2>Présentation du projet</h2>
      <p>QIT Madagascar Minerals (QMM) est une joint-venture entre Rio Tinto (80%) et l'État malgache (20%) pour l'extraction d'ilménite dans la région d'Anosy. Le projet, démarré en 2009, représente l'un des plus grands investissements miniers à Madagascar.</p>

      <h2>Impacts documentés</h2>
      <p>Notre analyse révèle des impacts significatifs sur plusieurs dimensions :</p>

      <h3>Environnement</h3>
      <ul>
        <li>Destruction de la forêt littorale unique de Mandena</li>
        <li>Contamination des sources d'eau locales</li>
        <li>Perte de biodiversité endémique</li>
      </ul>

      <h3>Communautés</h3>
      <ul>
        <li>Déplacement de populations locales</li>
        <li>Perte d'accès aux ressources traditionnelles</li>
        <li>Promesses non tenues en matière d'emploi local</li>
      </ul>

      <h2>Enjeux de transparence</h2>
      <p>Les questions de transparence concernent notamment les revenus générés, leur redistribution, et les engagements environnementaux de l'entreprise.</p>
    `,
    documents: [
      { id: 1, name: 'Analyse QMM 2025.pdf', size: '3.1 MB', url: '/documents/analyse-qmm-2025.pdf' }
    ],
    gallery: [],
    relatedCases: [
      { id: 4, title: 'Nickel et cobalt à Ambatovy', slug: 'nickel-cobalt-ambatovy', image: '/images/cases/ambatovy.jpg' }
    ]
  }
}

// Charger les données du cas
const caseStudy = computed(() => {
  return caseStudiesData[slug] || null
})

// Métadonnées de la page
useHead(() => ({
  title: caseStudy.value
    ? `${caseStudy.value.title} - Observatoire des Mines de Madagascar`
    : 'Étude de cas - Observatoire des Mines de Madagascar',
  meta: [
    {
      name: 'description',
      content: caseStudy.value?.subtitle || 'Étude de cas documentée par l\'Observatoire des Mines de Madagascar'
    }
  ]
}))

// Formater la date
const formattedDate = computed(() => {
  if (!caseStudy.value?.date) return ''
  return new Date(caseStudy.value.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Partage social
const shareUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return ''
})

const shareOnTwitter = () => {
  const text = encodeURIComponent(caseStudy.value?.title || '')
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl.value)}`, '_blank')
}

const shareOnFacebook = () => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`, '_blank')
}

const shareOnLinkedIn = () => {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`, '_blank')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    alert('Lien copié dans le presse-papier')
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
  }
}
</script>

<template>
  <div v-if="caseStudy">
    <!-- Image de couverture -->
    <section class="relative h-[400px] lg:h-[500px]">
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${caseStudy.coverImage})` }"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <!-- Contenu superposé -->
      <div class="absolute bottom-0 left-0 right-0 pb-12 lg:pb-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Badge catégorie -->
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white mb-4"
            :style="{ backgroundColor: caseStudy.category.color }"
          >
            <font-awesome-icon :icon="caseStudy.category.icon" class="w-3 h-3 mr-2" />
            {{ caseStudy.category.name }}
          </span>

          <!-- Titre -->
          <h1 class="text-3xl lg:text-5xl font-heading font-bold uppercase text-white mb-3">
            {{ caseStudy.title }}
          </h1>
          <p class="text-xl text-gray-200 mb-6">
            {{ caseStudy.subtitle }}
          </p>

          <!-- Métadonnées -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span class="flex items-center">
              <font-awesome-icon icon="calendar" class="w-4 h-4 mr-2" />
              {{ formattedDate }}
            </span>
            <span class="flex items-center">
              <font-awesome-icon icon="location-dot" class="w-4 h-4 mr-2" />
              {{ caseStudy.region.name }}
            </span>
            <span class="flex items-center">
              <font-awesome-icon icon="clock" class="w-4 h-4 mr-2" />
              {{ caseStudy.readTime }} de lecture
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <section class="py-12 lg:py-16 bg-white dark:bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:gap-12">
          <!-- Colonne principale -->
          <article class="lg:flex-1">
            <!-- Contenu HTML -->
            <div
              class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wide prose-a:text-ti-blue dark:prose-a:text-ti-blue-400"
              v-html="caseStudy.content"
            />

            <!-- Mots-clés -->
            <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                Mots-clés
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="keyword in caseStudy.keywords"
                  :key="keyword"
                  class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>

            <!-- Documents téléchargeables -->
            <div v-if="caseStudy.documents?.length" class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                Documents à télécharger
              </h3>
              <div class="space-y-3">
                <a
                  v-for="doc in caseStudy.documents"
                  :key="doc.id"
                  :href="doc.url"
                  download
                  class="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div class="w-10 h-10 rounded-lg bg-ti-blue/10 flex items-center justify-center mr-4">
                    <font-awesome-icon icon="file-pdf" class="w-5 h-5 text-ti-blue" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ doc.name }}</p>
                    <p class="text-sm text-gray-500">{{ doc.size }}</p>
                  </div>
                  <font-awesome-icon icon="download" class="w-5 h-5 text-gray-400" />
                </a>
              </div>
            </div>

            <!-- Partage -->
            <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                Partager cette étude
              </h3>
              <div class="flex gap-3">
                <button
                  @click="shareOnTwitter"
                  class="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label="Partager sur Twitter"
                >
                  <font-awesome-icon :icon="['fab', 'twitter']" class="w-4 h-4" />
                </button>
                <button
                  @click="shareOnFacebook"
                  class="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label="Partager sur Facebook"
                >
                  <font-awesome-icon :icon="['fab', 'facebook-f']" class="w-4 h-4" />
                </button>
                <button
                  @click="shareOnLinkedIn"
                  class="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label="Partager sur LinkedIn"
                >
                  <font-awesome-icon :icon="['fab', 'linkedin-in']" class="w-4 h-4" />
                </button>
                <button
                  @click="copyLink"
                  class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label="Copier le lien"
                >
                  <font-awesome-icon icon="link" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Cas connexes -->
    <section v-if="caseStudy.relatedCases?.length" class="py-12 lg:py-16 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-8">
          Études connexes
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="related in caseStudy.relatedCases"
            :key="related.id"
            :to="`/cas/${related.slug}`"
            class="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div class="aspect-video relative overflow-hidden">
              <img
                :src="related.image"
                :alt="related.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div class="p-4">
              <h3 class="font-heading font-bold uppercase text-gray-900 dark:text-white group-hover:text-ti-blue dark:group-hover:text-ti-blue-400 transition-colors">
                {{ related.title }}
              </h3>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Navigation -->
    <section class="py-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <NuxtLink
            to="/cas"
            class="inline-flex items-center text-ti-blue hover:text-ti-blue-700 dark:text-ti-blue-400 dark:hover:text-ti-blue-300 font-medium transition-colors"
          >
            <font-awesome-icon icon="arrow-left" class="w-4 h-4 mr-2" />
            Retour aux études de cas
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>

  <!-- Page non trouvée -->
  <div v-else class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center">
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <font-awesome-icon icon="file-circle-question" class="w-12 h-12 text-gray-400" />
      </div>
      <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
        Étude de cas non trouvée
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        L'étude de cas que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <NuxtLink to="/cas" class="btn-ti">
        Voir toutes les études de cas
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* Styles pour le contenu HTML */
:deep(.prose h2) {
  @apply text-2xl mt-10 mb-4;
}

:deep(.prose h3) {
  @apply text-xl mt-8 mb-3;
}

:deep(.prose p) {
  @apply mb-4;
}

:deep(.prose ul),
:deep(.prose ol) {
  @apply mb-4 pl-6;
}

:deep(.prose li) {
  @apply mb-2;
}

:deep(.prose blockquote) {
  @apply border-l-4 border-ti-blue pl-6 py-2 my-6 italic bg-gray-50 dark:bg-gray-800 rounded-r-lg;
}

:deep(.prose strong) {
  @apply font-semibold;
}
</style>
