<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
}

interface ResourceItem {
  id: string
  slug: string
  title: string
  description: string | null
  coverImage: string | null
  fileUrl: string
  filename: string
  mimeType: string
  fileSize: number
  isPublished: boolean
  categoryId: string | null
  category: Category | null
}

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const isNew = id === 'new'

const form = ref({
  title: '',
  description: '',
  coverImage: '',
  fileUrl: '',
  filename: '',
  mimeType: '',
  fileSize: 0,
  categoryId: '',
  isPublished: false
})

const categories = ref<Category[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isUploading = ref(false)
const error = ref('')
const success = ref('')

// Charger les catégories
const { data: categoriesData } = await useFetch<Category[]>('/api/admin/resource-categories')
if (categoriesData.value) {
  categories.value = categoriesData.value
}

if (!isNew) {
  isLoading.value = true
  try {
    const { data: resourceData, status } = await useFetch<ResourceItem>(`/api/admin/resources/${id}`)

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

    if (resourceData.value) {
      form.value = {
        title: resourceData.value.title,
        description: resourceData.value.description || '',
        coverImage: resourceData.value.coverImage || '',
        fileUrl: resourceData.value.fileUrl,
        filename: resourceData.value.filename,
        mimeType: resourceData.value.mimeType,
        fileSize: resourceData.value.fileSize,
        categoryId: resourceData.value.categoryId || '',
        isPublished: resourceData.value.isPublished
      }
    }
  } catch (e) {
    error.value = 'Erreur lors du chargement de la ressource'
  } finally {
    isLoading.value = false
  }
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  isUploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await $fetch<{
      success: boolean
      url: string
      filename: string
      originalName: string
      mimeType: string
      fileSize: number
    }>('/api/admin/upload-document', {
      method: 'POST',
      body: formData
    })

    if (result.success) {
      form.value.fileUrl = result.url
      form.value.filename = result.originalName || result.filename
      form.value.mimeType = result.mimeType
      form.value.fileSize = result.fileSize
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage || 'Erreur lors du téléversement'
  } finally {
    isUploading.value = false
  }
}

function removeFile() {
  form.value.fileUrl = ''
  form.value.filename = ''
  form.value.mimeType = ''
  form.value.fileSize = 0
}

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!form.value.title.trim()) {
    error.value = 'Le titre est requis'
    return
  }
  if (!form.value.fileUrl.trim()) {
    error.value = 'Le fichier est requis'
    return
  }

  isSaving.value = true

  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || null,
      coverImage: form.value.coverImage || null,
      fileUrl: form.value.fileUrl,
      filename: form.value.filename,
      mimeType: form.value.mimeType,
      fileSize: form.value.fileSize,
      categoryId: form.value.categoryId || null,
      isPublished: form.value.isPublished
    }

    if (isNew) {
      const result = await $fetch<{ success: boolean; data: { id: string } }>('/api/admin/resources', {
        method: 'POST',
        body: payload
      })
      if (result.success) {
        success.value = 'Ressource créée avec succès'
        setTimeout(() => {
          router.push(`/admin/resources/${result.data.id}`)
        }, 1500)
      }
    } else {
      await $fetch(`/api/admin/resources/${id}`, {
        method: 'PUT',
        body: payload
      })
      success.value = 'Ressource mise à jour avec succès'
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
    await $fetch(`/api/admin/resources/${id}`, {
      method: 'PUT',
      body: { isPublished: !form.value.isPublished }
    })
    form.value.isPublished = !form.value.isPublished
    success.value = form.value.isPublished ? 'Ressource publiée' : 'Ressource dépubliée'
  } catch {
    error.value = 'Erreur lors du changement de statut'
  } finally {
    isSaving.value = false
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
  if (mimeType.includes('image')) return 'file-image'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'file-archive'
  return 'file'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/resources"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <font-awesome-icon icon="arrow-left" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            {{ isNew ? 'Nouvelle ressource' : 'Modifier la ressource' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ isNew ? 'Ajouter un nouveau document téléchargeable' : 'Modifier les informations de la ressource' }}
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
          <!-- Title & Description -->
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
                  placeholder="Titre de la ressource"
                />
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Description du document (optionnel)"
                />
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  id="category"
                  v-model="form.categoryId"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Aucune catégorie</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- File Upload -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <font-awesome-icon icon="file" class="mr-2 text-green-600" />
              Document à télécharger <span class="text-red-500">*</span>
            </h3>

            <!-- File preview if uploaded -->
            <div v-if="form.fileUrl" class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg bg-ti-blue/10 flex items-center justify-center">
                    <font-awesome-icon :icon="getFileIcon(form.mimeType)" class="text-ti-blue text-xl" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ form.filename }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatFileSize(form.fileSize) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <a
                    :href="form.fileUrl"
                    target="_blank"
                    class="p-2 text-gray-500 hover:text-ti-blue transition-colors"
                    title="Voir le fichier"
                  >
                    <font-awesome-icon icon="external-link-alt" />
                  </a>
                  <button
                    type="button"
                    @click="removeFile"
                    class="p-2 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Upload zone -->
            <div
              v-if="!form.fileUrl"
              class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-ti-blue transition-colors"
            >
              <input
                type="file"
                @change="handleFileUpload"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
              />
              <div v-if="isUploading" class="flex flex-col items-center">
                <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-3xl mb-2" />
                <p class="text-gray-600 dark:text-gray-400">Téléversement en cours...</p>
              </div>
              <div v-else class="flex flex-col items-center">
                <font-awesome-icon icon="cloud-upload-alt" class="text-gray-400 text-4xl mb-3" />
                <p class="text-gray-600 dark:text-gray-400 mb-1">
                  Glissez un fichier ici ou cliquez pour sélectionner
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  PDF, Word, Excel, PowerPoint, archives (max 20 Mo)
                </p>
              </div>
            </div>

            <!-- Replace file button -->
            <div v-if="form.fileUrl" class="mt-4">
              <label class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <font-awesome-icon icon="sync-alt" />
                Remplacer le fichier
                <input
                  type="file"
                  @change="handleFileUpload"
                  class="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image de couverture</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Image qui sera affichée sur la carte de la ressource (optionnel)
            </p>
            <ImageUpload v-model="form.coverImage" :generate-variants="true" />
          </div>

          <!-- Preview -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aperçu</h3>
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div class="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <img
                  v-if="form.coverImage"
                  :src="form.coverImage"
                  :alt="form.title"
                  class="w-full h-full object-cover"
                />
                <font-awesome-icon
                  v-else
                  :icon="form.mimeType ? getFileIcon(form.mimeType) : 'file'"
                  class="text-gray-400 text-4xl"
                />
              </div>
              <div class="p-4">
                <h4 class="font-medium text-gray-900 dark:text-white line-clamp-2">
                  {{ form.title || 'Titre de la ressource' }}
                </h4>
                <p v-if="form.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {{ form.description }}
                </p>
                <div class="flex gap-2 mt-3">
                  <span class="text-xs px-2 py-1 bg-ti-blue/10 text-ti-blue rounded">Voir</span>
                  <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Télécharger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
