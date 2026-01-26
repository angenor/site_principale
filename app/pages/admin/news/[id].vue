<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import { stringifyEditorData } from '~/utils/editorjs'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface Attachment {
  id: string
  filename: string
  url: string
  mimeType: string
  fileSize: number
  sortOrder: number
}

interface NewsItem {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  coverImage: string | null
  externalUrl: string | null
  isPublished: boolean
  label: 'STANDARD' | 'TRENDING' | 'FEATURED'
  labelExpiresAt: string | null
  attachments?: Attachment[]
}

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const isNew = id === 'new'

const form = ref({
  title: '',
  summary: '',
  content: '' as string | OutputData,
  coverImage: '',
  externalUrl: '',
  isPublished: false,
  label: 'STANDARD' as 'STANDARD' | 'TRENDING' | 'FEATURED',
  labelExpiresAt: '' as string
})

// Fichiers annexes
const attachments = ref<Attachment[]>([])

const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

// Track if data is loaded for the editor
const dataLoaded = ref(false)

if (!isNew) {
  isLoading.value = true
  try {
    const { data: newsData, status } = await useFetch<NewsItem>(`/api/admin/news/${id}`)

    // Wait for data to be ready
    if (status.value === 'pending') {
      await new Promise<void>(resolve => {
        const unwatch = watch(status, (newStatus) => {
          if (newStatus !== 'pending') {
            unwatch()
            resolve()
          }
        })
      })
    }

    if (newsData.value) {
      // Formater la date d'expiration pour l'input datetime-local
      let formattedExpiry = ''
      if (newsData.value.labelExpiresAt) {
        const date = new Date(newsData.value.labelExpiresAt)
        formattedExpiry = date.toISOString().slice(0, 16)
      }

      form.value = {
        title: newsData.value.title,
        summary: newsData.value.summary || '',
        content: newsData.value.content || '',
        coverImage: newsData.value.coverImage || '',
        externalUrl: newsData.value.externalUrl || '',
        isPublished: newsData.value.isPublished,
        label: newsData.value.label || 'STANDARD',
        labelExpiresAt: formattedExpiry
      }
      // Charger les fichiers annexes
      if (newsData.value.attachments) {
        attachments.value = newsData.value.attachments
      }
      dataLoaded.value = true
    }
  } catch (e) {
    error.value = 'Erreur lors du chargement de l\'actualité'
  } finally {
    isLoading.value = false
  }
} else {
  dataLoaded.value = true
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

async function handleSubmit() {
  error.value = ''
  success.value = ''

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
      summary: form.value.summary,
      content: contentToSave,
      coverImage: form.value.coverImage || null,
      externalUrl: form.value.externalUrl || null,
      isPublished: form.value.isPublished,
      label: form.value.label,
      labelExpiresAt: form.value.labelExpiresAt || null
    }

    if (isNew) {
      const result = await $fetch<{ success: boolean; data: { id: string } }>('/api/admin/news', {
        method: 'POST',
        body: payload
      })
      if (result.success) {
        // Associer les fichiers temporaires à l'actualité créée
        const tempAttachments = attachments.value.filter(a => a.id.startsWith('temp-'))
        let attachmentErrors = 0
        for (const attachment of tempAttachments) {
          try {
            await $fetch(`/api/admin/news/${result.data.id}/attachments`, {
              method: 'POST',
              body: {
                url: attachment.url,
                filename: attachment.filename,
                mimeType: attachment.mimeType,
                fileSize: attachment.fileSize
              }
            })
          } catch (err) {
            console.error('Erreur lors de l\'association du fichier:', err)
            attachmentErrors++
          }
        }
        if (attachmentErrors > 0) {
          success.value = `Actualité créée, mais ${attachmentErrors} fichier(s) n'ont pas pu être associés`
        } else if (tempAttachments.length > 0) {
          success.value = `Actualité créée avec ${tempAttachments.length} fichier(s) annexe(s)`
        } else {
          success.value = 'Actualité créée avec succès'
        }
        setTimeout(() => {
          router.push(`/admin/news/${result.data.id}`)
        }, 1500)
      }
    } else {
      await $fetch(`/api/admin/news/${id}`, {
        method: 'PUT',
        body: payload
      })
      success.value = 'Actualité mise à jour avec succès'
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

async function togglePublish() {
  if (isNew) {
    form.value.isPublished = !form.value.isPublished
    return
  }

  isSaving.value = true
  try {
    await $fetch(`/api/admin/news/${id}`, {
      method: 'PUT',
      body: { isPublished: !form.value.isPublished }
    })
    form.value.isPublished = !form.value.isPublished
    success.value = form.value.isPublished ? 'Actualité publiée' : 'Actualité dépubliée'
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
          to="/admin/news"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <font-awesome-icon icon="arrow-left" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            {{ isNew ? 'Nouvelle actualité' : 'Modifier l\'actualité' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ isNew ? 'Créer une nouvelle actualité' : 'Modifier les informations de l\'actualité' }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
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
          {{ form.isPublished ? 'Publiée' : 'Brouillon' }}
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSaving"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
      <font-awesome-icon icon="spinner" class="animate-spin text-green-600 text-3xl" />
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Title & Summary -->
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
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Titre de l'actualité"
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
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Court résumé pour les cartes d'aperçu"
                />
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contenu</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contenu <span class="text-red-500">*</span>
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Utilisez l'éditeur pour créer votre contenu. Appuyez sur Tab ou cliquez sur + pour ajouter des blocs.
              </p>
              <ClientOnly>
                <ContentEditor
                  v-if="dataLoaded"
                  :key="`editor-${id}-${dataLoaded}`"
                  v-model="form.content"
                  :min-height="400"
                  placeholder="Commencez à écrire le contenu de l'actualité..."
                />
                <div v-else class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[400px] bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                  <font-awesome-icon icon="spinner" class="animate-spin text-gray-400 text-2xl" />
                </div>
                <template #fallback>
                  <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[400px] bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                    <font-awesome-icon icon="spinner" class="animate-spin text-gray-400 text-2xl" />
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image de couverture</h3>
            <ImageUpload v-model="form.coverImage" :generate-variants="true" />
          </div>

          <!-- External URL -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lien externe</h3>

            <div>
              <label for="externalUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL externe
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Lien vers un article externe (optionnel)
              </p>
              <input
                id="externalUrl"
                v-model="form.externalUrl"
                type="url"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <!-- Étiquette -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <font-awesome-icon icon="tag" class="mr-2 text-green-600" />
              Étiquette
            </h3>

            <div class="space-y-2 mb-4">
              <label
                class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                :class="form.label === 'STANDARD' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
              >
                <input
                  type="radio"
                  v-model="form.label"
                  value="STANDARD"
                  class="text-green-600 focus:ring-green-500"
                />
                <span class="text-gray-900 dark:text-white">Standard (Récent)</span>
              </label>

              <label
                class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                :class="form.label === 'TRENDING' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
              >
                <input
                  type="radio"
                  v-model="form.label"
                  value="TRENDING"
                  class="text-yellow-600 focus:ring-yellow-500"
                />
                <span class="flex items-center gap-2">
                  <span class="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded font-medium">À la une</span>
                </span>
              </label>

              <label
                class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                :class="form.label === 'FEATURED' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
              >
                <input
                  type="radio"
                  v-model="form.label"
                  value="FEATURED"
                  class="text-indigo-600 focus:ring-indigo-500"
                />
                <span class="flex items-center gap-2">
                  <span class="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded font-medium">En vedette</span>
                </span>
              </label>
            </div>

            <!-- Date d'expiration (visible si TRENDING ou FEATURED) -->
            <div v-if="form.label !== 'STANDARD'" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label for="labelExpiresAt" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'expiration
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Après cette date, l'article sera automatiquement classé dans "Récent"
              </p>
              <input
                id="labelExpiresAt"
                v-model="form.labelExpiresAt"
                type="datetime-local"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <!-- Fichiers annexes -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <font-awesome-icon icon="paperclip" class="mr-2 text-green-600" />
              Fichiers annexes
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Ajoutez des documents à télécharger (PDF, Word, Excel, etc.)
            </p>
            <FileUpload
              v-model="attachments"
              :news-id="isNew ? undefined : id"
            />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
