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
  files: ResourceFileVersion[]
  isPublished: boolean
  publishedAt: string | null
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
  files: (isNew ? [createEditableResourceFile('FR', 'Français')] : []) as EditableResourceFile[],
  categoryId: '',
  publishedAt: '',
  isPublished: false
})

const categories = ref<Category[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
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
        files: toEditableResourceFiles(resourceData.value.files),
        categoryId: resourceData.value.categoryId || '',
        publishedAt: toLocalInputValue(resourceData.value.publishedAt),
        isPublished: resourceData.value.isPublished
      }
    }
  } catch (e) {
    error.value = 'Erreur lors du chargement de la ressource'
  } finally {
    isLoading.value = false
  }
}

// Sauvegarde locale de la saisie en cours
const draft = useFormDraft({
  key: 'resources-v2',
  source: () => ({ ...form.value }),
  apply: (data) => {
    form.value = { ...form.value, ...data }
  }
})
const draftRestoredAt = draft.restoredAt

onMounted(() => {
  if (!error.value) draft.start(id)
})

// Aperçu : première version disponible
const previewFile = computed(() => form.value.files[0])

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!form.value.title.trim()) {
    error.value = 'Le titre est requis'
    return
  }
  const filesError = validateResourceFiles(form.value.files)
  if (filesError) {
    error.value = filesError
    return
  }

  isSaving.value = true

  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || null,
      coverImage: form.value.coverImage || null,
      files: toResourceFilesPayload(form.value.files),
      categoryId: form.value.categoryId || null,
      publishedAt: toIsoOrNull(form.value.publishedAt),
      isPublished: form.value.isPublished
    }

    if (isNew) {
      const result = await $fetch<{ success: boolean; data: { id: string } }>('/api/admin/resources', {
        method: 'POST',
        body: payload
      })
      if (result.success) {
        draft.clear()
        success.value = 'Rapport créé avec succès'
        setTimeout(() => {
          router.push(`/admin/resources/${result.data.id}`)
        }, 1500)
      }
    } else {
      const result = await $fetch<{ data: { publishedAt: string | null } }>(`/api/admin/resources/${id}`, {
        method: 'PUT',
        body: payload
      })
      form.value.publishedAt = toLocalInputValue(result.data.publishedAt)
      draft.commit()
      success.value = 'Rapport mis à jour avec succès'
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
    const result = await $fetch<{ data: { publishedAt: string | null } }>(`/api/admin/resources/${id}`, {
      method: 'PUT',
      body: { isPublished: !form.value.isPublished }
    })
    form.value.isPublished = !form.value.isPublished
    form.value.publishedAt = toLocalInputValue(result.data.publishedAt)
    draft.updateBaseline((reference) => {
      reference.isPublished = form.value.isPublished
      reference.publishedAt = form.value.publishedAt
    })
    success.value = form.value.isPublished ? 'Rapport publié' : 'Rapport dépublié'
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
          to="/admin/resources"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <font-awesome-icon icon="arrow-left" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            {{ isNew ? 'Nouveau rapport' : 'Modifier le rapport' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ isNew ? 'Ajouter un document téléchargeable, dans une ou plusieurs langues' : 'Modifier les informations du rapport' }}
          </p>
        </div>
      </div>
      <AdminPublishActions
        :published="form.isPublished"
        published-label="Publié"
        :saving="isSaving"
        @toggle="togglePublish"
        @save="handleSubmit"
      />
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
    <FormDraftNotice
      v-if="draftRestoredAt"
      :saved-at="draftRestoredAt"
      class="mb-6"
      @discard="draft.discard()"
    />

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
                  placeholder="Titre du rapport"
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

              <div>
                <label for="publishedAt" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de publication
                </label>
                <input
                  id="publishedAt"
                  v-model="form.publishedAt"
                  type="datetime-local"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ form.publishedAt ? 'Date affichée sur le site et utilisée pour le tri.' : 'Laissez vide pour utiliser la date de mise en ligne.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Documents par langue -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              <font-awesome-icon icon="file" class="mr-2 text-green-600" />
              Document à télécharger <span class="text-red-500">*</span>
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Une version par langue : fichier téléversé ou lien vers le site source.
            </p>
            <ResourceFilesEditor v-model="form.files" @error="error = $event" />
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image de couverture</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Image qui sera affichée sur la carte du rapport (optionnel)
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
                  :icon="getFileIcon(previewFile?.mimeType)"
                  class="text-gray-400 text-4xl"
                />
              </div>
              <div class="p-4">
                <h4 class="font-medium text-gray-900 dark:text-white line-clamp-2">
                  {{ form.title || 'Titre du rapport' }}
                </h4>
                <p v-if="form.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {{ form.description }}
                </p>
                <div class="flex flex-wrap gap-1.5 mt-3">
                  <span
                    v-for="file in form.files"
                    :key="file.key"
                    class="text-xs px-2 py-0.5 rounded font-semibold bg-ti-blue/10 text-ti-blue dark:text-blue-300"
                    :title="file.languageLabel"
                  >
                    {{ file.languageCode || '?' }}
                    <font-awesome-icon v-if="file.source === 'link'" icon="external-link-alt" class="ml-0.5 text-[0.6rem]" />
                  </span>
                  <span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded ml-auto">Télécharger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions répétées en bas du formulaire, pour éviter de remonter -->
      <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400 sm:mr-auto flex items-center gap-2">
          <font-awesome-icon icon="circle-exclamation" />
          {{ error }}
        </p>
        <p v-else-if="success" class="text-sm text-green-700 dark:text-green-400 sm:mr-auto flex items-center gap-2">
          <font-awesome-icon icon="check-circle" />
          {{ success }}
        </p>
        <AdminPublishActions
          :published="form.isPublished"
          published-label="Publié"
          :saving="isSaving"
          @toggle="togglePublish"
          @save="handleSubmit"
        />
      </div>
    </form>
  </div>
</template>
