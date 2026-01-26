<script setup lang="ts">
import { editorJsToHtml } from '~/utils/editorjs'

const { original, thumb } = useImageVariants()

// Interfaces
interface Category {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
}

interface Region {
  id: string
  name: string
}

interface Media {
  id: string
  type: string
  url: string
  filename: string | null
  caption: string | null
}

interface RelatedCase {
  id: number
  slug: string
  title: string
  coverImage: string | null
}

interface Keyword {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
}

interface CaseStudyDetail {
  id: number
  slug: string
  title: string
  subtitle: string | null
  summary: string | null
  content: string | null
  coverImage: string | null
  eventDate: string | null
  publishedAt: string | null
  readTime: number | null
  viewCount: number
  region: Region | null
  categories: Category[]
  keywords: Keyword[]
  media: Media[]
  author: string
  relatedCases: RelatedCase[]
}

const route = useRoute()
const slug = route.params.slug as string
const config = useRuntimeConfig()
const { setArticleSchema, setBreadcrumbSchema } = useJsonLd()

// Charger les données du cas depuis l'API
const { data: caseStudy, pending, error } = await useFetch<CaseStudyDetail>(`/api/cases/${slug}`)

// Métadonnées SEO
useSeoMeta({
  title: () => caseStudy.value?.title || 'Étude de cas',
  description: () => caseStudy.value?.subtitle || caseStudy.value?.summary || 'Étude de cas documentée par l\'Observatoire des Mines de Madagascar',
  ogTitle: () => caseStudy.value?.title || 'Étude de cas',
  ogDescription: () => caseStudy.value?.subtitle || caseStudy.value?.summary || '',
  ogImage: () => caseStudy.value?.coverImage || '/images/og-image.jpg',
  ogType: 'article',
  twitterCard: 'summary_large_image'
})

// Données structurées JSON-LD
watchEffect(() => {
  if (caseStudy.value) {
    setArticleSchema({
      title: caseStudy.value.title,
      description: caseStudy.value.subtitle || caseStudy.value.summary || '',
      image: caseStudy.value.coverImage || undefined,
      datePublished: caseStudy.value.publishedAt || caseStudy.value.eventDate || new Date().toISOString(),
      author: caseStudy.value.author,
      slug: `/cas/${caseStudy.value.slug}`
    })
    setBreadcrumbSchema([
      { name: 'Accueil', url: '/' },
      { name: 'Études de cas', url: '/cas' },
      { name: caseStudy.value.title, url: `/cas/${caseStudy.value.slug}` }
    ])
  }
})

// Convertir le contenu Editor.js en HTML
const contentHtml = computed(() => {
  if (!caseStudy.value?.content) return ''
  return editorJsToHtml(caseStudy.value.content)
})

// Formater la date
const formattedDate = computed(() => {
  const date = caseStudy.value?.eventDate || caseStudy.value?.publishedAt
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Temps de lecture formaté
const readTimeFormatted = computed(() => {
  const minutes = caseStudy.value?.readTime || 5
  return `${minutes} min`
})

// Filtrer les documents (médias de type document)
const documents = computed(() => {
  return caseStudy.value?.media.filter(m => m.type === 'DOCUMENT') || []
})

// Filtrer les images pour la galerie
const gallery = computed(() => {
  return caseStudy.value?.media.filter(m => m.type === 'IMAGE') || []
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
  <!-- État de chargement -->
  <div v-if="pending" class="min-h-screen">
    <div class="h-[400px] lg:h-[500px] bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div class="space-y-2 mt-8">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Erreur ou cas non trouvé -->
  <div v-else-if="error || !caseStudy" class="min-h-[60vh] flex items-center justify-center">
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

  <!-- Contenu de l'étude de cas -->
  <div v-else>
    <!-- Image de couverture -->
    <section class="relative h-[400px] lg:h-[500px]">
      <img
        :src="original(caseStudy.coverImage) || '/images/placeholder-case.jpg'"
        :alt="caseStudy.title"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <!-- Contenu superposé -->
      <div class="absolute bottom-0 left-0 right-0 pb-12 lg:pb-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Titre -->
          <h1 class="text-3xl lg:text-5xl font-heading font-bold uppercase text-white mb-3">
            {{ caseStudy.title }}
          </h1>
          <p v-if="caseStudy.subtitle" class="text-xl text-gray-200 mb-4">
            {{ caseStudy.subtitle }}
          </p>

          <!-- Badges catégories -->
          <div v-if="caseStudy.categories.length > 0" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="category in caseStudy.categories"
              :key="category.id"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white"
              :style="{ backgroundColor: category.color || '#6b7280' }"
            >
              <!-- Icône uploadée (image) -->
              <img
                v-if="category.icon && (category.icon.startsWith('/') || category.icon.startsWith('http'))"
                :src="category.icon"
                alt=""
                class="w-4 h-4 object-contain mr-2"
              />
              <!-- Icône FontAwesome -->
              <font-awesome-icon
                v-else-if="category.icon"
                :icon="category.icon"
                class="w-3 h-3 mr-2"
              />
              {{ category.name }}
            </span>
          </div>

          <!-- Métadonnées -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span v-if="formattedDate" class="flex items-center">
              <font-awesome-icon icon="calendar" class="w-4 h-4 mr-2" />
              {{ formattedDate }}
            </span>
            <span v-if="caseStudy.region" class="flex items-center">
              <font-awesome-icon icon="location-dot" class="w-4 h-4 mr-2" />
              {{ caseStudy.region.name }}
            </span>
            <span class="flex items-center">
              <font-awesome-icon icon="clock" class="w-4 h-4 mr-2" />
              {{ readTimeFormatted }} de lecture
            </span>
            <span class="flex items-center">
              <font-awesome-icon icon="eye" class="w-4 h-4 mr-2" />
              {{ caseStudy.viewCount }} vues
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Fil d'Ariane -->
    <nav class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol class="flex items-center space-x-2 text-sm">
          <li>
            <NuxtLink to="/" class="text-gray-500 dark:text-gray-400 hover:text-ti-blue dark:hover:text-ti-blue-400 transition-colors">
              <font-awesome-icon icon="home" class="w-4 h-4" />
              <span class="sr-only">Accueil</span>
            </NuxtLink>
          </li>
          <li class="text-gray-400 dark:text-gray-500">
            <font-awesome-icon icon="chevron-right" class="w-3 h-3" />
          </li>
          <li>
            <NuxtLink to="/cas" class="text-gray-500 dark:text-gray-400 hover:text-ti-blue dark:hover:text-ti-blue-400 transition-colors">
              Études de cas
            </NuxtLink>
          </li>
          <li class="text-gray-400 dark:text-gray-500">
            <font-awesome-icon icon="chevron-right" class="w-3 h-3" />
          </li>
          <li class="text-gray-900 dark:text-white font-medium truncate max-w-xs">
            {{ caseStudy.title }}
          </li>
        </ol>
      </div>
    </nav>

    <!-- Contenu principal -->
    <section class="py-12 lg:py-16 bg-white dark:bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:gap-12">
          <!-- Colonne principale -->
          <article class="lg:flex-1">
            <!-- Contenu HTML -->
            <div
              v-if="contentHtml"
              class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wide prose-a:text-ti-blue dark:prose-a:text-ti-blue-400"
              v-html="contentHtml"
            />

            <!-- Message si pas de contenu -->
            <div v-else class="text-gray-600 dark:text-gray-400">
              <p>{{ caseStudy.summary || 'Contenu à venir...' }}</p>
            </div>

            <!-- Mots-clés -->
            <div v-if="caseStudy.keywords.length > 0" class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                Mots-clés
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="keyword in caseStudy.keywords"
                  :key="keyword.id"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  :style="{
                    backgroundColor: keyword.color ? `${keyword.color}15` : '#f3f4f6',
                    color: keyword.color || '#374151'
                  }"
                >
                  <!-- Icône uploadée (image) -->
                  <img
                    v-if="keyword.icon && (keyword.icon.startsWith('/') || keyword.icon.startsWith('http'))"
                    :src="keyword.icon"
                    alt=""
                    class="w-4 h-4 object-contain"
                  />
                  <!-- Icône FontAwesome -->
                  <font-awesome-icon
                    v-else-if="keyword.icon"
                    :icon="keyword.icon"
                    class="w-3 h-3"
                  />
                  {{ keyword.name }}
                </span>
              </div>
            </div>

            <!-- Documents téléchargeables -->
            <div v-if="documents.length > 0" class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                Documents à télécharger
              </h3>
              <div class="space-y-3">
                <a
                  v-for="doc in documents"
                  :key="doc.id"
                  :href="doc.url"
                  download
                  class="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div class="w-10 h-10 rounded-lg bg-ti-blue/10 flex items-center justify-center mr-4">
                    <font-awesome-icon icon="file-pdf" class="w-5 h-5 text-ti-blue" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">{{ doc.filename || doc.caption || 'Document' }}</p>
                  </div>
                  <font-awesome-icon icon="download" class="w-5 h-5 text-gray-400" />
                </a>
              </div>
            </div>

            <!-- Galerie d'images -->
            <div v-if="gallery.length > 0" class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                Galerie
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  v-for="img in gallery"
                  :key="img.id"
                  class="aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    :src="img.url"
                    :alt="img.caption || img.filename || 'Image'"
                    loading="lazy"
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
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
                :src="thumb(related.coverImage) || '/images/placeholder-case.jpg'"
                :alt="related.title"
                loading="lazy"
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
</template>

<style scoped>
/* Styles pour le contenu HTML */
:deep(.prose h2) {
  font-size: 1.5rem;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

:deep(.prose h3) {
  font-size: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

:deep(.prose p) {
  margin-bottom: 1rem;
}

:deep(.prose ul),
:deep(.prose ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

:deep(.prose li) {
  margin-bottom: 0.5rem;
}

:deep(.prose blockquote) {
  border-left: 4px solid var(--color-ti-blue);
  padding-left: 1.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  font-style: italic;
  background-color: #f9fafb;
  border-radius: 0 0.5rem 0.5rem 0;
}

.dark :deep(.prose blockquote) {
  background-color: #1f2937;
}

:deep(.prose strong) {
  font-weight: 600;
}
</style>
