<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/documents"
          class="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="text-[var(--text-muted)]" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">
            Téléverser des documents
          </h1>
          <p class="text-[var(--text-muted)]">
            Ajoutez un ou plusieurs fichiers à la bibliothèque
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main upload area -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Dropzone -->
        <div
          class="bg-[var(--bg-card)] rounded-xl border-2 border-dashed transition-colors p-8"
          :class="[
            isDragging
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
              : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
          ]"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" class="text-2xl text-[var(--color-primary)]" />
            </div>
            <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Déposez vos fichiers ici
            </h3>
            <p class="text-[var(--text-muted)] mb-4">
              ou cliquez pour sélectionner des fichiers
            </p>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              class="hidden"
              @change="handleFileSelect"
            />
            <button
              @click="fileInput?.click()"
              class="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Parcourir les fichiers
            </button>
            <p class="text-xs text-[var(--text-muted)] mt-4">
              Formats acceptés : PDF, Word, Excel • Taille max : 10 MB par fichier
            </p>
          </div>
        </div>

        <!-- Files list -->
        <div v-if="files.length > 0" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
          <div class="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 class="font-semibold text-[var(--text-primary)]">
              Fichiers sélectionnés ({{ files.length }})
            </h3>
            <button
              @click="clearAllFiles"
              class="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Tout supprimer
            </button>
          </div>

          <div class="divide-y divide-[var(--border-default)]">
            <div
              v-for="(file, index) in files"
              :key="file.id"
              class="p-4 flex items-start gap-4"
            >
              <!-- File icon -->
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                :class="getFileTypeClass(file.type)"
              >
                <font-awesome-icon :icon="getFileIcon(file.type)" class="text-xl" />
              </div>

              <!-- File info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <!-- Title input -->
                    <input
                      v-model="file.titre"
                      type="text"
                      class="w-full px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm font-medium"
                      placeholder="Titre du document"
                    />
                    <p class="text-xs text-[var(--text-muted)] mt-1">
                      {{ file.file.name }} • {{ formatFileSize(file.file.size) }}
                    </p>
                  </div>
                  <button
                    @click="removeFile(index)"
                    class="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" />
                  </button>
                </div>

                <!-- Description -->
                <textarea
                  v-model="file.description"
                  rows="2"
                  class="w-full mt-2 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm resize-none"
                  placeholder="Description (optionnel)"
                />

                <!-- Upload progress -->
                <div v-if="file.status !== 'pending'" class="mt-3">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span :class="getStatusClass(file.status)">
                      {{ getStatusText(file.status) }}
                    </span>
                    <span v-if="file.status === 'uploading'" class="text-[var(--text-muted)]">
                      {{ file.progress }}%
                    </span>
                  </div>
                  <div v-if="file.status === 'uploading'" class="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div
                      class="h-full bg-[var(--color-primary)] transition-all duration-300"
                      :style="{ width: `${file.progress}%` }"
                    />
                  </div>
                  <p v-if="file.error" class="text-xs text-red-500 mt-1">
                    {{ file.error }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-8 text-center">
          <font-awesome-icon :icon="['fas', 'file-circle-plus']" class="text-4xl text-[var(--text-muted)] mb-3" />
          <p class="text-[var(--text-muted)]">
            Aucun fichier sélectionné
          </p>
        </div>
      </div>

      <!-- Sidebar settings -->
      <div class="space-y-6">
        <!-- Common settings -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">
            Paramètres communs
          </h3>
          <p class="text-sm text-[var(--text-muted)] mb-4">
            Ces paramètres seront appliqués à tous les fichiers.
          </p>

          <div class="space-y-4">
            <!-- Visibility -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Visibilité
              </label>
              <div class="flex gap-2">
                <button
                  @click="commonSettings.est_public = true"
                  :class="[
                    'flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 text-sm',
                    commonSettings.est_public
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-emerald-500/50'
                  ]"
                >
                  <font-awesome-icon :icon="['fas', 'globe']" />
                  Public
                </button>
                <button
                  @click="commonSettings.est_public = false"
                  :class="[
                    'flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 text-sm',
                    !commonSettings.est_public
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-amber-500/50'
                  ]"
                >
                  <font-awesome-icon :icon="['fas', 'lock']" />
                  Privé
                </button>
              </div>
            </div>

            <!-- Compte administratif -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Compte administratif
              </label>
              <select
                v-model="commonSettings.compte_administratif_id"
                class="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
              >
                <option value="">Aucun</option>
                <option v-for="compte in comptes" :key="compte.id" :value="compte.id">
                  {{ compte.label }}
                </option>
              </select>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Tags communs
              </label>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="(tag, index) in commonSettings.tags"
                  :key="index"
                  class="px-2 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs flex items-center gap-1"
                >
                  {{ tag }}
                  <button @click="removeCommonTag(index)" class="hover:text-red-500">
                    <font-awesome-icon :icon="['fas', 'times']" class="text-[10px]" />
                  </button>
                </span>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newCommonTag"
                  type="text"
                  class="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                  placeholder="Ajouter un tag..."
                  @keyup.enter="addCommonTag"
                />
                <button
                  @click="addCommonTag"
                  class="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload button -->
        <button
          @click="uploadAllFiles"
          :disabled="files.length === 0 || isUploading"
          class="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          <font-awesome-icon
            :icon="['fas', isUploading ? 'spinner' : 'cloud-arrow-up']"
            :class="{ 'animate-spin': isUploading }"
          />
          {{ isUploading ? 'Téléversement en cours...' : `Téléverser ${files.length} fichier${files.length > 1 ? 's' : ''}` }}
        </button>

        <!-- Progress summary -->
        <div v-if="uploadSummary" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Résumé</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Réussis</span>
              <span class="text-emerald-500 font-medium">{{ uploadSummary.success }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Échoués</span>
              <span class="text-red-500 font-medium">{{ uploadSummary.failed }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">En attente</span>
              <span class="text-[var(--text-primary)] font-medium">{{ uploadSummary.pending }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FileUpload {
  id: string
  file: File
  titre: string
  description: string
  type: 'pdf' | 'excel' | 'word' | 'autre'
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const documentsService = useDocumentsService()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const isUploading = ref(false)
const files = ref<FileUpload[]>([])
const newCommonTag = ref('')

const commonSettings = ref({
  est_public: true,
  compte_administratif_id: '',
  tags: [] as string[],
})

// Mock comptes for development
const comptes = ref([
  { id: 'compte-1', label: 'Antsirabe - 2023' },
  { id: 'compte-2', label: 'Fianarantsoa - 2023' },
  { id: 'compte-3', label: 'Toamasina - 2022' },
])

const uploadSummary = computed(() => {
  if (files.value.length === 0) return null
  return {
    success: files.value.filter(f => f.status === 'success').length,
    failed: files.value.filter(f => f.status === 'error').length,
    pending: files.value.filter(f => f.status === 'pending' || f.status === 'uploading').length,
  }
})

const getFileType = (file: File): 'pdf' | 'excel' | 'word' | 'autre' => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['xls', 'xlsx'].includes(ext || '')) return 'excel'
  if (['doc', 'docx'].includes(ext || '')) return 'word'
  return 'autre'
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return ['fas', 'file-pdf']
    case 'excel':
      return ['fas', 'file-excel']
    case 'word':
      return ['fas', 'file-word']
    default:
      return ['fas', 'file']
  }
}

const getFileTypeClass = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    case 'excel':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'word':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'uploading':
      return 'text-[var(--color-primary)]'
    case 'success':
      return 'text-emerald-500'
    case 'error':
      return 'text-red-500'
    default:
      return 'text-[var(--text-muted)]'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'uploading':
      return 'Téléversement...'
    case 'success':
      return 'Téléversé avec succès'
    case 'error':
      return 'Erreur'
    default:
      return 'En attente'
  }
}

const addFiles = (newFiles: FileList | File[]) => {
  const maxSize = 10 * 1024 * 1024 // 10 MB
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

  Array.from(newFiles).forEach(file => {
    // Validate file
    if (file.size > maxSize) {
      console.warn(`File ${file.name} is too large (max 10 MB)`)
      return
    }

    const type = getFileType(file)

    // Create file upload object
    files.value.push({
      id: Math.random().toString(36).substring(2, 9),
      file,
      titre: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: '',
      type,
      status: 'pending',
      progress: 0,
    })
  })
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    addFiles(input.files)
    input.value = '' // Reset input
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(event.dataTransfer.files)
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const clearAllFiles = () => {
  files.value = []
}

const addCommonTag = () => {
  const tag = newCommonTag.value.trim()
  if (tag && !commonSettings.value.tags.includes(tag)) {
    commonSettings.value.tags.push(tag)
    newCommonTag.value = ''
  }
}

const removeCommonTag = (index: number) => {
  commonSettings.value.tags.splice(index, 1)
}

const uploadAllFiles = async () => {
  if (files.value.length === 0 || isUploading.value) return

  isUploading.value = true

  for (const fileUpload of files.value) {
    if (fileUpload.status !== 'pending') continue

    fileUpload.status = 'uploading'
    fileUpload.progress = 0

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        if (fileUpload.progress < 90) {
          fileUpload.progress += Math.random() * 20
        }
      }, 200)

      await documentsService.uploadFile(fileUpload.file, {
        titre: fileUpload.titre,
        description: fileUpload.description || undefined,
        compte_administratif_id: commonSettings.value.compte_administratif_id || undefined,
        est_public: commonSettings.value.est_public,
        tags: commonSettings.value.tags.length > 0 ? commonSettings.value.tags : undefined,
      })

      clearInterval(progressInterval)
      fileUpload.progress = 100
      fileUpload.status = 'success'
    } catch (error) {
      fileUpload.status = 'error'
      fileUpload.error = error instanceof Error ? error.message : 'Erreur lors du téléversement'
      console.error('Upload error:', error)
    }
  }

  isUploading.value = false

  // Redirect if all successful
  const allSuccess = files.value.every(f => f.status === 'success')
  if (allSuccess) {
    setTimeout(() => {
      router.push('/admin/documents')
    }, 1500)
  }
}
</script>
