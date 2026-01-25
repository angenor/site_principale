<script setup lang="ts">
import { editorJsToHtml } from '~/utils/editorjs'

const { original } = useImageVariants()

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const slug = route.params.slug as string
const { setArticleSchema, setBreadcrumbSchema } = useJsonLd()

interface Attachment {
  id: string
  filename: string
  url: string
  mimeType: string
  fileSize: number
}

interface NewsArticle {
  id: string
  slug: string
  title: string
  summary: string | null
  content: string | null
  coverImage: string | null
  externalUrl: string | null
  publishedAt: string
  author: string
  viewCount: number
  attachments?: Attachment[]
}

const { data: article, status, error } = await useFetch<NewsArticle>(`/api/news/${slug}`)

// Rediriger si c'est un lien externe
if (article.value?.externalUrl) {
  navigateTo(article.value.externalUrl, { external: true })
}

// Métadonnées SEO
useSeoMeta({
  title: () => article.value ? `${article.value.title} - Actualités` : 'Actualité',
  description: () => article.value?.summary || 'Lire cette actualité sur l\'Observatoire des Mines de Madagascar',
  ogTitle: () => article.value?.title || 'Actualité',
  ogDescription: () => article.value?.summary || '',
  ogImage: () => article.value?.coverImage || '/images/og-image.jpg',
  ogType: 'article',
  twitterCard: 'summary_large_image'
})

// Données structurées JSON-LD
watchEffect(() => {
  if (article.value) {
    setArticleSchema({
      title: article.value.title,
      description: article.value.summary || '',
      image: article.value.coverImage || undefined,
      datePublished: article.value.publishedAt,
      author: article.value.author,
      slug: `/actualites/${article.value.slug}`
    })
    setBreadcrumbSchema([
      { name: 'Accueil', url: '/' },
      { name: 'Actualités', url: '/actualites' },
      { name: article.value.title, url: `/actualites/${article.value.slug}` }
    ])
  }
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Convertir le contenu Editor.js en HTML
const contentHtml = computed(() => {
  if (!article.value?.content) return ''
  return editorJsToHtml(article.value.content)
})

// Helpers pour les fichiers annexes
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
  if (mimeType.includes('image')) return 'file-image'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'file-zipper'
  return 'file'
}

function getFileColor(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'text-red-500'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-green-600'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'text-orange-500'
  if (mimeType.includes('image')) return 'text-purple-500'
  return 'text-gray-500'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading -->
    <div v-if="status === 'pending'" class="max-w-4xl mx-auto px-4 py-16">
      <div class="animate-pulse space-y-8">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div class="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-16 text-center">
      <font-awesome-icon icon="exclamation-triangle" class="w-16 h-16 text-red-500 mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Actualité non trouvée
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Cette actualité n'existe pas ou a été supprimée.
      </p>
      <NuxtLink
        to="/actualites"
        class="inline-flex items-center gap-2 btn-ti"
      >
        <font-awesome-icon icon="arrow-left" />
        Retour aux actualités
      </NuxtLink>
    </div>

    <!-- Article -->
    <article v-else-if="article" class="pb-16">
      <!-- Header avec image -->
      <header class="relative">
        <div
          v-if="article.coverImage"
          class="relative h-64 md:h-96 lg:h-[500px] overflow-hidden"
        >
          <img
            :src="original(article.coverImage)"
            :alt="article.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div v-else class="h-32 bg-gradient-to-br from-ti-blue to-ti-blue-700" />

        <!-- Titre superposé ou après -->
        <div
          :class="[
            'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
            article.coverImage ? '-mt-32 relative z-10' : 'pt-8'
          ]"
        >
          <div
            :class="[
              'rounded-xl p-6 md:p-8',
              article.coverImage ? 'bg-white dark:bg-gray-800 shadow-xl' : ''
            ]"
          >
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-sm mb-4">
              <NuxtLink to="/" class="text-gray-500 dark:text-gray-400 hover:text-ti-blue dark:hover:text-ti-blue-400">
                Accueil
              </NuxtLink>
              <font-awesome-icon icon="chevron-right" class="w-3 h-3 text-gray-400" />
              <NuxtLink to="/actualites" class="text-gray-500 dark:text-gray-400 hover:text-ti-blue dark:hover:text-ti-blue-400">
                Actualités
              </NuxtLink>
              <font-awesome-icon icon="chevron-right" class="w-3 h-3 text-gray-400" />
              <span class="text-gray-700 dark:text-gray-300 truncate">{{ article.title }}</span>
            </nav>

            <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {{ article.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="calendar" class="w-4 h-4" />
                <time :datetime="article.publishedAt">{{ formatDate(article.publishedAt) }}</time>
              </div>
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="user" class="w-4 h-4" />
                <span>{{ article.author }}</span>
              </div>
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="eye" class="w-4 h-4" />
                <span>{{ article.viewCount }} vue(s)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenu -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <!-- Résumé -->
        <div v-if="article.summary" class="bg-ti-blue-50 dark:bg-ti-blue-900/30 rounded-xl p-6 mb-8 border-l-4 border-ti-blue">
          <p class="text-lg text-gray-700 dark:text-gray-300 italic">
            {{ article.summary }}
          </p>
        </div>

        <!-- Corps de l'article -->
        <div
          v-if="contentHtml"
          class="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-ti-blue dark:prose-a:text-ti-blue-400"
          v-html="contentHtml"
        />

        <!-- Message si pas de contenu -->
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Le contenu complet de cette actualité n'est pas disponible.</p>
        </div>

        <!-- Fichiers annexes -->
        <div v-if="article.attachments && article.attachments.length > 0" class="mt-10 bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <font-awesome-icon icon="paperclip" class="text-ti-blue" />
            Documents annexes
          </h3>
          <div class="space-y-3">
            <a
              v-for="attachment in article.attachments"
              :key="attachment.id"
              :href="attachment.url"
              target="_blank"
              download
              class="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow group"
            >
              <div :class="['w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-600', getFileColor(attachment.mimeType)]">
                <font-awesome-icon :icon="getFileIcon(attachment.mimeType)" class="w-6 h-6" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate group-hover:text-ti-blue dark:group-hover:text-ti-blue-400 transition-colors">
                  {{ attachment.filename }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(attachment.fileSize) }}
                </p>
              </div>
              <font-awesome-icon icon="download" class="w-5 h-5 text-gray-400 group-hover:text-ti-blue transition-colors" />
            </a>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
          <NuxtLink
            to="/actualites"
            class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-ti-blue dark:hover:text-ti-blue-400 transition-colors"
          >
            <font-awesome-icon icon="arrow-left" />
            Retour aux actualités
          </NuxtLink>

          <!-- Partage -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600 dark:text-gray-400">Partager :</span>
            <a
              :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent($route.fullPath)}`"
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-ti-blue hover:text-white transition-colors"
              title="Partager sur Twitter"
            >
              <font-awesome-icon :icon="['fab', 'x-twitter']" />
            </a>
            <a
              :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent($route.fullPath)}`"
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-ti-blue hover:text-white transition-colors"
              title="Partager sur Facebook"
            >
              <font-awesome-icon :icon="['fab', 'facebook-f']" />
            </a>
            <a
              :href="`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent($route.fullPath)}&title=${encodeURIComponent(article.title)}`"
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-ti-blue hover:text-white transition-colors"
              title="Partager sur LinkedIn"
            >
              <font-awesome-icon :icon="['fab', 'linkedin-in']" />
            </a>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
