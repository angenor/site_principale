<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Documents
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Téléchargez et gérez les documents justificatifs
        </p>
      </div>
      <button
        @click="openUploadModal"
        class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Icon name="heroicons:arrow-up-tray" class="h-5 w-5" />
        Uploader un Document
      </button>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          @keyup.enter="performSearch"
          type="text"
          placeholder="Rechercher dans les documents (titre, description, contenu)..."
          class="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="cursor-pointer absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          <Icon name="heroicons:x-mark" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <select
        v-model="filterTypeDocument"
        @change="fetchDocuments"
        class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Tous les types</option>
        <option v-for="type in typesDocuments" :key="type.id" :value="type.id">
          {{ type.nom }}
        </option>
      </select>

      <select
        v-model="filterCommune"
        @change="fetchDocuments"
        class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Toutes les communes</option>
        <option v-for="commune in communes" :key="commune.id" :value="commune.id">
          {{ commune.nom }}
        </option>
      </select>

      <select
        v-model="filterExercice"
        @change="fetchDocuments"
        class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Tous les exercices</option>
        <option v-for="exercice in exercices" :key="exercice.id" :value="exercice.id">
          {{ exercice.annee }}
        </option>
      </select>

      <select
        v-model="filterExtension"
        @change="fetchDocuments"
        class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Toutes les extensions</option>
        <option value=".pdf">PDF</option>
        <option value=".xlsx">Excel</option>
        <option value=".docx">Word</option>
        <option value=".jpg">Image (JPG)</option>
        <option value=".png">Image (PNG)</option>
      </select>
    </div>

    <!-- Documents Grid -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="mx-auto h-12 w-12 animate-spin text-gray-400" />
      <p class="mt-2 text-gray-500">Chargement des documents...</p>
    </div>

    <div v-else-if="documents.length === 0" class="text-center py-12">
      <Icon name="heroicons:document" class="mx-auto h-16 w-16 text-gray-300" />
      <p class="mt-4 text-gray-500">Aucun document trouvé</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="rounded-lg border border-gray-200 bg-white p-4 shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <!-- Document Icon and Type -->
        <div class="mb-3 flex items-start justify-between">
          <div class="flex items-center gap-2">
            <Icon
              :name="getFileIcon(doc.extension)"
              class="h-8 w-8 text-blue-600 dark:text-blue-400"
            />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ doc.titre }}
              </h3>
              <p class="text-xs text-gray-500">{{ doc.nom_fichier }}</p>
            </div>
          </div>
          <span
            class="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
          >
            {{ doc.extension }}
          </span>
        </div>

        <!-- Description -->
        <p v-if="doc.description" class="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {{ doc.description }}
        </p>

        <!-- Metadata -->
        <div class="mb-3 space-y-1 text-xs text-gray-500">
          <div v-if="doc.type_document">
            <span class="font-medium">Type:</span> {{ doc.type_document.nom }}
          </div>
          <div>
            <span class="font-medium">Taille:</span> {{ formatSize(doc.taille_ko) }}
          </div>
          <div>
            <span class="font-medium">Uploadé:</span> {{ formatDate(doc.created_at) }}
          </div>
        </div>

        <!-- Tags -->
        <div v-if="doc.tags && doc.tags.length > 0" class="mb-3 flex flex-wrap gap-1">
          <span
            v-for="tag in doc.tags"
            :key="tag"
            class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
          <button
            @click="downloadDocument(doc)"
            class="cursor-pointer flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
          >
            <Icon name="heroicons:arrow-down-tray" class="h-4 w-4" />
            Télécharger
          </button>
          <button
            @click="openEditModal(doc)"
            class="cursor-pointer inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Icon name="heroicons:pencil" class="h-4 w-4" />
          </button>
          <button
            @click="deleteDocument(doc)"
            class="cursor-pointer inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            <Icon name="heroicons:trash" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 overflow-y-auto"
      @click.self="closeUploadModal"
    >
      <div class="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 my-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Uploader un Document
          </h2>
          <button
            @click="closeUploadModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="uploadDocument" class="space-y-4">
          <!-- File Input -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fichier <span class="text-red-500">*</span>
            </label>
            <input
              ref="fileInput"
              type="file"
              required
              @change="handleFileChange"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p v-if="selectedFile" class="mt-1 text-sm text-gray-600">
              Fichier sélectionné: {{ selectedFile.name }} ({{ formatSize(selectedFile.size / 1024) }})
            </p>
          </div>

          <!-- Titre -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre <span class="text-red-500">*</span>
            </label>
            <input
              v-model="uploadForm.titre"
              type="text"
              required
              placeholder="Titre du document"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              v-model="uploadForm.description"
              rows="3"
              placeholder="Description du document"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Type de document -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type de document
              </label>
              <select
                v-model="uploadForm.type_document_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucun</option>
                <option v-for="type in typesDocuments" :key="type.id" :value="type.id">
                  {{ type.nom }}
                </option>
              </select>
            </div>

            <!-- Commune -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Commune
              </label>
              <select
                v-model="uploadForm.commune_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucune</option>
                <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                  {{ commune.nom }}
                </option>
              </select>
            </div>

            <!-- Exercice -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Exercice fiscal
              </label>
              <select
                v-model="uploadForm.exercice_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucun</option>
                <option v-for="exercice in exercices" :key="exercice.id" :value="exercice.id">
                  {{ exercice.annee }}
                </option>
              </select>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <input
              v-model="uploadForm.tags"
              type="text"
              placeholder="Ex: budget,2024,rapport (séparés par des virgules)"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="text-blue-900 dark:text-blue-300">Upload en cours...</span>
              <span class="text-blue-700 dark:text-blue-400">{{ uploadProgress }}%</span>
            </div>
            <div class="h-2 rounded-full bg-blue-200 dark:bg-blue-800">
              <div
                class="h-2 rounded-full bg-blue-600 transition-all duration-300"
                :style="{ width: uploadProgress + '%' }"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeUploadModal"
              :disabled="uploading"
              class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="uploading || !selectedFile"
              class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Icon v-if="uploading" name="heroicons:arrow-path" class="h-4 w-4 animate-spin" />
              {{ uploading ? 'Upload en cours...' : 'Uploader' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
      @click.self="closeEditModal"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Modifier le Document
          </h2>
          <button
            @click="closeEditModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="updateDocument" class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editForm.titre"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              v-model="editForm.description"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <input
              v-model="editTagsInput"
              type="text"
              placeholder="Ex: budget,2024,rapport"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeEditModal"
              class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Icon v-if="saving" name="heroicons:arrow-path" class="h-4 w-4 animate-spin" />
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const api = useApi()

// State
const documents = ref<any[]>([])
const typesDocuments = ref<any[]>([])
const communes = ref<any[]>([])
const exercices = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const showUploadModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')
const filterTypeDocument = ref('')
const filterCommune = ref('')
const filterExercice = ref('')
const filterExtension = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const editTagsInput = ref('')

// Form data
const uploadForm = ref({
  titre: '',
  description: '',
  type_document_id: '',
  commune_id: '',
  exercice_id: '',
  tags: ''
})

const editForm = ref({
  titre: '',
  description: '',
  tags: [] as string[]
})

const currentDocument = ref<any>(null)

// Methods
const fetchDocuments = async () => {
  try {
    loading.value = true
    let url = '/api/v1/documents/documents?'

    if (filterTypeDocument.value) url += `type_document_id=${filterTypeDocument.value}&`
    if (filterCommune.value) url += `commune_id=${filterCommune.value}&`
    if (filterExercice.value) url += `exercice_id=${filterExercice.value}&`
    if (filterExtension.value) url += `extension=${filterExtension.value}&`

    documents.value = await api.get(url)
  } catch (error) {
    console.error('Erreur chargement documents:', error)
  } finally {
    loading.value = false
  }
}

const performSearch = async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    await fetchDocuments()
    return
  }

  try {
    loading.value = true
    let url = `/api/v1/documents/documents/search/full-text?query=${encodeURIComponent(searchQuery.value)}`

    if (filterTypeDocument.value) url += `&type_document_id=${filterTypeDocument.value}`
    if (filterCommune.value) url += `&commune_id=${filterCommune.value}`
    if (filterExercice.value) url += `&exercice_id=${filterExercice.value}`

    documents.value = await api.get(url)
  } catch (error) {
    console.error('Erreur recherche:', error)
  } finally {
    loading.value = false
  }
}

const clearSearch = async () => {
  searchQuery.value = ''
  await fetchDocuments()
}

const fetchTypesDocuments = async () => {
  try {
    typesDocuments.value = await api.get('/api/v1/documents/types-documents')
  } catch (error) {
    console.error('Erreur chargement types documents:', error)
  }
}

const fetchCommunes = async () => {
  try {
    communes.value = await api.get('/api/v1/geo/communes')
  } catch (error) {
    console.error('Erreur chargement communes:', error)
  }
}

const fetchExercices = async () => {
  try {
    exercices.value = await api.get('/api/v1/exercices/exercices')
  } catch (error) {
    console.error('Erreur chargement exercices:', error)
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    // Auto-fill titre with filename if empty
    if (!uploadForm.value.titre) {
      uploadForm.value.titre = target.files[0].name.replace(/\.[^/.]+$/, '')
    }
  }
}

const uploadDocument = async () => {
  if (!selectedFile.value) return

  try {
    uploading.value = true
    uploadProgress.value = 0

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    // Build query parameters
    let url = `/api/v1/documents/documents/upload?titre=${encodeURIComponent(uploadForm.value.titre)}`
    if (uploadForm.value.description) url += `&description=${encodeURIComponent(uploadForm.value.description)}`
    if (uploadForm.value.type_document_id) url += `&type_document_id=${uploadForm.value.type_document_id}`
    if (uploadForm.value.commune_id) url += `&commune_id=${uploadForm.value.commune_id}`
    if (uploadForm.value.exercice_id) url += `&exercice_id=${uploadForm.value.exercice_id}`
    if (uploadForm.value.tags) url += `&tags=${encodeURIComponent(uploadForm.value.tags)}`

    // Simulate progress (in real app, use xhr or fetch with progress)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    const response = await fetch(`http://localhost:8000${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: formData
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Erreur lors de l\'upload')
    }

    await fetchDocuments()
    closeUploadModal()
  } catch (error: any) {
    console.error('Erreur upload:', error)
    alert(error.message || 'Erreur lors de l\'upload')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const downloadDocument = async (doc: any) => {
  try {
    window.open(`http://localhost:8000/api/v1/documents/documents/download/${doc.id}`, '_blank')
  } catch (error) {
    console.error('Erreur téléchargement:', error)
    alert('Erreur lors du téléchargement')
  }
}

const openUploadModal = () => {
  uploadForm.value = {
    titre: '',
    description: '',
    type_document_id: '',
    commune_id: '',
    exercice_id: '',
    tags: ''
  }
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadForm.value = {
    titre: '',
    description: '',
    type_document_id: '',
    commune_id: '',
    exercice_id: '',
    tags: ''
  }
  selectedFile.value = null
}

const openEditModal = (doc: any) => {
  currentDocument.value = doc
  editForm.value = {
    titre: doc.titre,
    description: doc.description || '',
    tags: doc.tags || []
  }
  editTagsInput.value = doc.tags ? doc.tags.join(',') : ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  currentDocument.value = null
}

const updateDocument = async () => {
  try {
    saving.value = true

    const tags = editTagsInput.value
      ? editTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []

    await api.put(`/api/v1/documents/documents/${currentDocument.value.id}`, {
      titre: editForm.value.titre,
      description: editForm.value.description,
      tags
    })

    await fetchDocuments()
    closeEditModal()
  } catch (error: any) {
    console.error('Erreur mise à jour:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

const deleteDocument = async (doc: any) => {
  if (!confirm(`Voulez-vous vraiment supprimer le document "${doc.titre}" ?`)) return

  try {
    await api.delete(`/api/v1/documents/documents/${doc.id}`)
    await fetchDocuments()
  } catch (error) {
    console.error('Erreur suppression:', error)
    alert('Erreur lors de la suppression')
  }
}

const getFileIcon = (extension: string) => {
  const ext = extension?.toLowerCase()
  if (ext === '.pdf') return 'heroicons:document-text'
  if (ext === '.xlsx' || ext === '.xls') return 'heroicons:table-cells'
  if (ext === '.docx' || ext === '.doc') return 'heroicons:document'
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') return 'heroicons:photo'
  return 'heroicons:document'
}

const formatSize = (kb: number) => {
  if (kb < 1024) return `${kb.toFixed(0)} Ko`
  return `${(kb / 1024).toFixed(2)} Mo`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchDocuments(),
    fetchTypesDocuments(),
    fetchCommunes(),
    fetchExercices()
  ])
})
</script>
