<script setup lang="ts">
interface Attachment {
  id: string
  filename: string
  url: string
  mimeType: string
  fileSize: number
  sortOrder: number
}

interface Props {
  newsId?: string
  modelValue?: Attachment[]
}

const props = withDefaults(defineProps<Props>(), {
  newsId: undefined,
  modelValue: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Attachment[]): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const isDragOver = ref(false)

// Liste locale des fichiers
const attachments = computed({
  get: () => props.modelValue || [],
  set: (value) => emit('update:modelValue', value)
})

// Ouvrir le sélecteur de fichier
function openFilePicker() {
  fileInput.value?.click()
}

// Types de fichiers acceptés
const acceptedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.webp'

// Gérer la sélection de fichier
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
  }
  // Réinitialiser l'input
  if (target) target.value = ''
}

// Gérer le drag & drop
function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
}

async function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
  }
}

// Téléverser le fichier
async function uploadFile(file: File) {
  error.value = ''
  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Vérifier la taille (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('Le fichier ne doit pas dépasser 20MB')
    }

    const formData = new FormData()
    formData.append('file', file)

    // Simuler la progression
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)

    const response = await $fetch<{
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

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (response.success) {
      // Si on a un newsId, sauvegarder en base
      if (props.newsId) {
        const attachmentResponse = await $fetch<{ success: boolean; data: Attachment }>(
          `/api/admin/news/${props.newsId}/attachments`,
          {
            method: 'POST',
            body: {
              url: response.url,
              filename: response.originalName,
              mimeType: response.mimeType,
              fileSize: response.fileSize
            }
          }
        )
        if (attachmentResponse.success) {
          attachments.value = [...attachments.value, attachmentResponse.data]
        }
      } else {
        // Mode création : stocker temporairement
        const tempAttachment: Attachment = {
          id: `temp-${Date.now()}`,
          filename: response.originalName,
          url: response.url,
          mimeType: response.mimeType,
          fileSize: response.fileSize,
          sortOrder: attachments.value.length
        }
        attachments.value = [...attachments.value, tempAttachment]
      }
    }
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string; statusCode?: number }
    console.error('Erreur upload:', e)
    if (e.statusCode === 401) {
      error.value = 'Session expirée. Veuillez vous reconnecter.'
    } else {
      error.value = e.data?.statusMessage || e.message || 'Erreur lors du téléversement'
    }
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// Supprimer une pièce jointe
async function removeAttachment(attachment: Attachment) {
  try {
    // Si c'est un fichier temporaire ou si on n'a pas de newsId
    if (attachment.id.startsWith('temp-') || !props.newsId) {
      attachments.value = attachments.value.filter(a => a.id !== attachment.id)
      return
    }

    // Supprimer en base
    await $fetch(`/api/admin/news/attachments/${attachment.id}`, {
      method: 'DELETE'
    })
    attachments.value = attachments.value.filter(a => a.id !== attachment.id)
  } catch (err) {
    console.error('Erreur suppression:', err)
    error.value = 'Erreur lors de la suppression'
  }
}

// Formater la taille du fichier
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// Obtenir l'icône selon le type de fichier
function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
  if (mimeType.includes('image')) return 'file-image'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'file-zipper'
  if (mimeType.includes('text') || mimeType.includes('csv')) return 'file-lines'
  return 'file'
}

// Obtenir la couleur selon le type de fichier
function getFileColor(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'text-red-500'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-green-600'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'text-orange-500'
  if (mimeType.includes('image')) return 'text-purple-500'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'text-yellow-600'
  return 'text-gray-500'
}
</script>

<template>
  <div class="file-upload">
    <!-- Input file caché -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedTypes"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Liste des fichiers existants -->
    <div v-if="attachments.length > 0" class="space-y-2 mb-4">
      <div
        v-for="attachment in attachments"
        :key="attachment.id"
        class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group"
      >
        <div :class="['w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-600', getFileColor(attachment.mimeType)]">
          <font-awesome-icon :icon="getFileIcon(attachment.mimeType)" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ attachment.filename }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatFileSize(attachment.fileSize) }}
          </p>
        </div>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            :href="attachment.url"
            target="_blank"
            class="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            title="Télécharger"
          >
            <font-awesome-icon icon="download" class="w-4 h-4" />
          </a>
          <button
            type="button"
            @click="removeAttachment(attachment)"
            class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="Supprimer"
          >
            <font-awesome-icon icon="trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Zone d'upload -->
    <div
      class="relative rounded-lg border-2 border-dashed transition-colors cursor-pointer"
      :class="[
        isDragOver
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
      ]"
      @click="openFilePicker"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="p-6 flex flex-col items-center justify-center text-center">
        <!-- Indicateur d'upload en cours -->
        <div v-if="isUploading" class="text-center">
          <font-awesome-icon icon="spinner" class="animate-spin text-green-600 text-2xl mb-2" />
          <p class="text-sm text-gray-600 dark:text-gray-400">Téléversement en cours...</p>
          <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full bg-green-600 transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            />
          </div>
        </div>

        <!-- État par défaut -->
        <template v-else>
          <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
            <font-awesome-icon icon="paperclip" class="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span class="text-green-600 dark:text-green-400 font-medium">Cliquez pour ajouter</span>
            <span class="mx-1">ou</span>
            <span>glissez-déposez des fichiers</span>
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
            PDF, Word, Excel, PowerPoint, images, archives • Max 20MB
          </p>
        </template>
      </div>
    </div>

    <!-- Message d'erreur -->
    <p v-if="error" class="mt-2 text-sm text-red-500 flex items-center gap-1">
      <font-awesome-icon icon="circle-exclamation" class="w-3 h-3" />
      {{ error }}
    </p>
  </div>
</template>
