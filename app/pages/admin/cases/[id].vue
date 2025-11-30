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
  keywords: string[]
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
  keywords: [] as string[],
  isPublished: false
})

const newKeyword = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

// Fetch categories and regions
const { data: categories } = await useFetch<Category[]>('/api/categories')
const { data: regions } = await useFetch<Region[]>('/api/regions')

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
        keywords: caseData.value.keywords || [],
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

// Add keyword
function addKeyword() {
  const keyword = newKeyword.value.trim()
  if (keyword && !form.value.keywords.includes(keyword)) {
    form.value.keywords.push(keyword)
    newKeyword.value = ''
  }
}

// Remove keyword
function removeKeyword(keyword: string) {
  form.value.keywords = form.value.keywords.filter(k => k !== keyword)
}

// Handle keyword input keydown
function handleKeywordKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addKeyword()
  }
}

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
      keywords: form.value.keywords,
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
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mots-clés</h3>

            <div class="flex gap-2 mb-3">
              <input
                v-model="newKeyword"
                type="text"
                @keydown="handleKeywordKeydown"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
                placeholder="Ajouter un mot-clé"
              />
              <button
                type="button"
                @click="addKeyword"
                class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <font-awesome-icon icon="plus" />
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="keyword in form.keywords"
                :key="keyword"
                class="inline-flex items-center gap-1 px-3 py-1 bg-ti-blue/10 text-ti-blue rounded-full text-sm"
              >
                {{ keyword }}
                <button
                  type="button"
                  @click="removeKeyword(keyword)"
                  class="hover:text-red-500 transition-colors cursor-pointer"
                >
                  <font-awesome-icon icon="xmark" class="w-3 h-3" />
                </button>
              </span>
              <span v-if="form.keywords.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
                Aucun mot-clé ajouté
              </span>
            </div>
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image de couverture</h3>

            <div v-if="form.coverImage" class="mb-4">
              <img
                :src="form.coverImage"
                alt="Aperçu"
                class="w-full h-40 object-cover rounded-lg"
              />
            </div>
            <div v-else class="mb-4 w-full h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <font-awesome-icon icon="image" class="text-gray-400 dark:text-gray-500 text-3xl" />
            </div>

            <input
              v-model="form.coverImage"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue text-sm"
              placeholder="URL de l'image"
            />
          </div>

          <!-- Location & Date -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Localisation et date</h3>

            <div class="space-y-4">
              <div>
                <label for="region" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Région
                </label>
                <select
                  id="region"
                  v-model="form.regionId"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
                >
                  <option value="">Sélectionner une région</option>
                  <option v-for="region in regions" :key="region.id" :value="region.id">
                    {{ region.name }}
                  </option>
                </select>
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
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Catégories</h3>

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
              <p v-if="!categories?.length" class="text-gray-500 dark:text-gray-400 text-sm">
                Aucune catégorie disponible
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
