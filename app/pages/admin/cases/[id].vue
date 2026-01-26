<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import { stringifyEditorData } from '~/utils/editorjs'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
}

interface Region {
  id: string
  name: string
}

interface Keyword {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
}

interface CaseStudy {
  id: string
  slug: string
  title: string
  subtitle: string | null
  summary: string
  content: string
  coverImage: string | null
  eventDate: string | null
  location: string | null
  isPublished: boolean
  regionId: string | null
  categoryIds: string[]
  keywordIds: string[]
}

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const isNew = id === 'new'

// Form state
const form = ref({
  title: '',
  subtitle: '',
  summary: '',
  content: '' as string | OutputData,
  coverImage: '',
  eventDate: '',
  location: '',
  regionId: '',
  categoryIds: [] as string[],
  keywordIds: [] as string[],
  isPublished: false
})

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')
const keywordSearch = ref('')

// Fetch categories, regions, and keywords (use useLazyFetch to avoid caching issues on client navigation)
const { data: categories, pending: categoriesPending, refresh: refreshCategories } = useLazyFetch<Category[]>('/api/categories')
const { data: regions, pending: regionsPending, refresh: refreshRegions } = useLazyFetch<Region[]>('/api/regions')
const { data: keywords, pending: keywordsPending, refresh: refreshKeywords } = useLazyFetch<Keyword[]>('/api/keywords')

// Ensure data is loaded on client-side navigation
onMounted(() => {
  refreshCategories()
  refreshRegions()
  refreshKeywords()
})

// Fetch existing case if editing
if (!isNew) {
  isLoading.value = true
  try {
    const { data: caseData } = await useFetch<CaseStudy>(`/api/admin/cases/${id}`)
    if (caseData.value) {
      form.value = {
        title: caseData.value.title,
        subtitle: caseData.value.subtitle || '',
        summary: caseData.value.summary,
        content: caseData.value.content,
        coverImage: caseData.value.coverImage || '',
        eventDate: caseData.value.eventDate ? caseData.value.eventDate.split('T')[0] : '',
        location: caseData.value.location || '',
        regionId: caseData.value.regionId || '',
        categoryIds: caseData.value.categoryIds || [],
        keywordIds: caseData.value.keywordIds || [],
        isPublished: caseData.value.isPublished
      }
    }
  } catch (e) {
    error.value = 'Erreur lors du chargement de l\'étude de cas'
  } finally {
    isLoading.value = false
  }
}

// Toggle category selection
function toggleCategory(categoryId: string) {
  const index = form.value.categoryIds.indexOf(categoryId)
  if (index === -1) {
    form.value.categoryIds.push(categoryId)
  } else {
    form.value.categoryIds.splice(index, 1)
  }
}

// Toggle keyword selection
function toggleKeyword(keywordId: string) {
  const index = form.value.keywordIds.indexOf(keywordId)
  if (index === -1) {
    form.value.keywordIds.push(keywordId)
  } else {
    form.value.keywordIds.splice(index, 1)
  }
}

// Filter keywords based on search
const filteredKeywords = computed(() => {
  if (!keywords.value) return []
  const query = keywordSearch.value.toLowerCase().trim()
  if (!query) return keywords.value
  return keywords.value.filter(k =>
    k.name.toLowerCase().includes(query) ||
    k.slug.toLowerCase().includes(query)
  )
})

// Check if content has blocks
function hasContent(content: string | OutputData): boolean {
  if (!content) return false
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      return parsed.blocks && parsed.blocks.length > 0 && parsed.blocks.some((b: { data?: { text?: string } }) => b.data?.text?.trim())
    } catch {
      return content.trim().length > 0
    }
  }
  return content.blocks && content.blocks.length > 0 && content.blocks.some(b => (b.data as { text?: string })?.text?.trim())
}

// Submit form
async function handleSubmit() {
  error.value = ''
  success.value = ''

  // Validation
  if (!form.value.title.trim()) {
    error.value = 'Le titre est requis'
    return
  }
  if (!form.value.summary.trim()) {
    error.value = 'Le résumé est requis'
    return
  }
  if (!hasContent(form.value.content)) {
    error.value = 'Le contenu est requis'
    return
  }

  isSaving.value = true

  // Serialize content if it's an OutputData object
  const contentToSave = typeof form.value.content === 'string'
    ? form.value.content
    : stringifyEditorData(form.value.content as OutputData) || ''

  try {
    const payload = {
      title: form.value.title,
      subtitle: form.value.subtitle || null,
      summary: form.value.summary,
      content: contentToSave,
      coverImage: form.value.coverImage || null,
      eventDate: form.value.eventDate || null,
      location: form.value.location || null,
      regionId: form.value.regionId || null,
      categoryIds: form.value.categoryIds,
      keywordIds: form.value.keywordIds,
      isPublished: form.value.isPublished
    }

    if (isNew) {
      const result = await $fetch<{ success: boolean; data: { id: string } }>('/api/admin/cases', {
        method: 'POST',
        body: payload
      })
      if (result.success) {
        success.value = 'Étude de cas créée avec succès'
        setTimeout(() => {
          router.push(`/admin/cases/${result.data.id}`)
        }, 1000)
      }
    } else {
      await $fetch(`/api/admin/cases/${id}`, {
        method: 'PUT',
        body: payload
      })
      success.value = 'Étude de cas mise à jour avec succès'
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

// Toggle publish status
async function togglePublish() {
  if (isNew) {
    form.value.isPublished = !form.value.isPublished
    return
  }

  isSaving.value = true
  try {
    await $fetch(`/api/admin/cases/${id}`, {
      method: 'PUT',
      body: { isPublished: !form.value.isPublished }
    })
    form.value.isPublished = !form.value.isPublished
    success.value = form.value.isPublished ? 'Étude de cas publiée' : 'Étude de cas dépubliée'
  } catch {
    error.value = 'Erreur lors du changement de statut'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/cases"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <font-awesome-icon icon="arrow-left" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            {{ isNew ? 'Nouvelle étude de cas' : 'Modifier l\'étude de cas' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ isNew ? 'Créer une nouvelle étude de cas' : 'Modifier les informations de l\'étude de cas' }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <!-- Publish toggle -->
        <button
          type="button"
          @click="togglePublish"
          :disabled="isSaving"
          :class="[
            form.isPublished
              ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300',
            'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50'
          ]"
        >
          <font-awesome-icon :icon="form.isPublished ? 'check-circle' : 'eye-slash'" class="mr-2" />
          {{ form.isPublished ? 'Publié' : 'Brouillon' }}
        </button>
        <!-- Save button -->
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSaving"
          class="px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin" />
          <font-awesome-icon v-else icon="check" />
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="circle-exclamation" />
      {{ error }}
    </div>
    <div v-if="success" class="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="check-circle" />
      {{ success }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-3xl" />
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Title & Subtitle -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h3>

            <div class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre <span class="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
                  placeholder="Titre de l'étude de cas"
                />
              </div>

              <div>
                <label for="subtitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sous-titre
                </label>
                <input
                  id="subtitle"
                  v-model="form.subtitle"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
                  placeholder="Sous-titre (optionnel)"
                />
              </div>

              <div>
                <label for="summary" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Résumé <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="summary"
                  v-model="form.summary"
                  rows="3"
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue resize-none"
                  placeholder="Court résumé pour les cartes d'aperçu"
                />
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contenu détaillé</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contenu <span class="text-red-500">*</span>
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Utilisez l'éditeur pour créer votre contenu. Appuyez sur Tab ou cliquez sur + pour ajouter des blocs.
              </p>
              <ClientOnly>
                <ContentEditor
                  v-model="form.content"
                  :min-height="400"
                  placeholder="Commencez à écrire le contenu de l'étude de cas..."
                />
                <template #fallback>
                  <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[400px] bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                    <font-awesome-icon icon="spinner" class="animate-spin text-gray-400 text-2xl" />
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>

          <!-- Keywords -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Mots-clés</h3>
              <NuxtLink
                to="/admin/keywords"
                class="text-xs text-ti-blue hover:underline"
              >
                <font-awesome-icon icon="cog" class="mr-1" />
                Gérer
              </NuxtLink>
            </div>

            <!-- Search bar -->
            <div v-if="keywords?.length && keywords.length > 5" class="relative mb-3">
              <font-awesome-icon
                icon="search"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3"
              />
              <input
                v-model="keywordSearch"
                type="text"
                placeholder="Rechercher un mot-clé..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
              />
            </div>

            <div class="flex flex-wrap gap-2">
              <label
                v-for="keyword in filteredKeywords"
                :key="keyword.id"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                :class="form.keywordIds.includes(keyword.id)
                  ? 'border-ti-blue bg-ti-blue/10'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
              >
                <input
                  type="checkbox"
                  :checked="form.keywordIds.includes(keyword.id)"
                  @change="toggleKeyword(keyword.id)"
                  class="sr-only"
                />
                <span
                  v-if="keyword.icon && (keyword.icon.startsWith('/') || keyword.icon.startsWith('http'))"
                  class="w-5 h-5 rounded flex items-center justify-center overflow-hidden"
                  :style="{ backgroundColor: keyword.color ? `${keyword.color}20` : '#e5e7eb' }"
                >
                  <img :src="keyword.icon" alt="" class="w-4 h-4 object-contain" />
                </span>
                <span
                  v-else-if="keyword.icon"
                  class="w-5 h-5 rounded flex items-center justify-center text-xs"
                  :style="{ backgroundColor: keyword.color ? `${keyword.color}20` : '#e5e7eb', color: keyword.color || '#374151' }"
                >
                  <font-awesome-icon :icon="keyword.icon" />
                </span>
                <span
                  v-else
                  class="w-5 h-5 rounded flex items-center justify-center text-xs bg-gray-100 dark:bg-gray-700"
                >
                  <font-awesome-icon icon="hashtag" class="text-gray-400" />
                </span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ keyword.name }}</span>
                <font-awesome-icon
                  v-if="form.keywordIds.includes(keyword.id)"
                  icon="check"
                  class="w-3 h-3 text-ti-blue"
                />
              </label>
              <!-- No results from search -->
              <div v-if="keywords?.length && !filteredKeywords.length" class="w-full text-center py-3">
                <p class="text-gray-500 dark:text-gray-400 text-sm">
                  Aucun mot-clé trouvé pour "{{ keywordSearch }}"
                </p>
              </div>
              <!-- Loading keywords -->
              <div v-else-if="keywordsPending" class="w-full text-center py-3">
                <font-awesome-icon icon="spinner" class="animate-spin text-gray-400" />
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Chargement...</p>
              </div>
              <!-- No keywords at all -->
              <div v-else-if="!keywords?.length" class="w-full text-center py-3">
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  <font-awesome-icon icon="exclamation-triangle" class="mr-1 text-amber-500" />
                  Aucun mot-clé disponible
                </p>
                <NuxtLink
                  to="/admin/keywords"
                  class="inline-flex items-center gap-1 text-sm text-ti-blue hover:underline"
                >
                  <font-awesome-icon icon="plus" />
                  Créer un mot-clé
                </NuxtLink>
              </div>
            </div>

            <!-- Selected count -->
            <p v-if="form.keywordIds.length > 0" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {{ form.keywordIds.length }} mot(s)-clé(s) sélectionné(s)
            </p>
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image de couverture</h3>
            <ImageUpload v-model="form.coverImage" :generate-variants="true" />
          </div>

          <!-- Location & Date -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Localisation et date</h3>
              <NuxtLink
                to="/admin/regions"
                class="text-xs text-ti-blue hover:underline"
              >
                <font-awesome-icon icon="cog" class="mr-1" />
                Gérer les régions
              </NuxtLink>
            </div>

            <div class="space-y-4">
              <div>
                <label for="region" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Région
                </label>
                <select
                  id="region"
                  v-model="form.regionId"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue cursor-pointer"
                >
                  <option value="">Sélectionner une région</option>
                  <option v-for="region in regions" :key="region.id" :value="region.id">
                    {{ region.name }}
                  </option>
                </select>
                <p v-if="regionsPending" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <font-awesome-icon icon="spinner" class="animate-spin mr-1" />
                  Chargement des régions...
                </p>
                <p v-else-if="!regions?.length" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  <font-awesome-icon icon="exclamation-triangle" class="mr-1" />
                  Aucune région disponible.
                  <NuxtLink to="/admin/regions" class="underline">Créer une région</NuxtLink>
                </p>
              </div>

              <div>
                <label for="location" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lieu précis
                </label>
                <input
                  id="location"
                  v-model="form.location"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
                  placeholder="Ex: Commune de Moramanga"
                />
              </div>

              <div>
                <label for="eventDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de l'événement
                </label>
                <input
                  id="eventDate"
                  v-model="form.eventDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
                />
              </div>
            </div>
          </div>

          <!-- Categories -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Catégories</h3>
              <NuxtLink
                to="/admin/categories"
                class="text-xs text-ti-blue hover:underline"
              >
                <font-awesome-icon icon="cog" class="mr-1" />
                Gérer
              </NuxtLink>
            </div>

            <div class="space-y-2">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="form.categoryIds.includes(category.id)"
                  @change="toggleCategory(category.id)"
                  class="w-4 h-4 text-ti-blue border-gray-300 dark:border-gray-600 rounded focus:ring-ti-blue cursor-pointer"
                />
                <span
                  v-if="category.icon"
                  class="w-6 h-6 rounded flex items-center justify-center text-sm"
                  :style="{ backgroundColor: category.color ? `${category.color}20` : '#e5e7eb', color: category.color || '#374151' }"
                >
                  <font-awesome-icon :icon="category.icon" />
                </span>
                <span class="text-gray-700 dark:text-gray-300">{{ category.name }}</span>
              </label>
              <div v-if="categoriesPending" class="text-center py-3">
                <font-awesome-icon icon="spinner" class="animate-spin text-gray-400" />
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Chargement...</p>
              </div>
              <div v-else-if="!categories?.length" class="text-center py-3">
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  <font-awesome-icon icon="exclamation-triangle" class="mr-1 text-amber-500" />
                  Aucune catégorie disponible
                </p>
                <NuxtLink
                  to="/admin/categories"
                  class="inline-flex items-center gap-1 text-sm text-ti-blue hover:underline"
                >
                  <font-awesome-icon icon="plus" />
                  Créer une catégorie
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
