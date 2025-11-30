<script setup lang="ts">
interface Props {
  modelValue?: string | null
  label?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Image',
  placeholder: 'https://... ou téléverser une image'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const isDragOver = ref(false)
const showUrlInput = ref(false)
const urlInput = ref('')

// Computed pour l'URL actuelle
const currentUrl = computed(() => props.modelValue || '')

// Ouvrir le sélecteur de fichier
function openFilePicker() {
  fileInput.value?.click()
}

// Gérer la sélection de fichier
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await uploadFile(file)
  }
  // Réinitialiser l'input pour permettre de sélectionner le même fichier
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

  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    await uploadFile(file)
  } else {
    error.value = 'Veuillez déposer un fichier image valide'
  }
}

// Téléverser le fichier
async function uploadFile(file: File) {
  error.value = ''
  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image')
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('L\'image ne doit pas dépasser 5MB')
    }

    const formData = new FormData()
    formData.append('file', file)

    // Simuler la progression
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)

    const response = await $fetch<{ success: boolean; url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (response.success && response.url) {
      emit('update:modelValue', response.url)
    }
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e.data?.statusMessage || e.message || 'Erreur lors du téléversement'
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// Appliquer l'URL manuelle
function applyUrl() {
  if (urlInput.value.trim()) {
    emit('update:modelValue', urlInput.value.trim())
    urlInput.value = ''
    showUrlInput.value = false
  }
}

// Supprimer l'image
function removeImage() {
  emit('update:modelValue', null)
}

// Toggle affichage URL input
function toggleUrlInput() {
  showUrlInput.value = !showUrlInput.value
  if (showUrlInput.value) {
    urlInput.value = currentUrl.value
  }
}
</script>

<template>
  <div class="image-upload">
    <!-- Input file caché -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Zone d'aperçu / upload -->
    <div
      class="relative rounded-lg overflow-hidden border-2 transition-colors"
      :class="[
        isDragOver
          ? 'border-ti-blue bg-ti-blue-50 dark:bg-ti-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 border-dashed',
        currentUrl ? 'border-solid' : ''
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Aperçu de l'image -->
      <div v-if="currentUrl" class="relative">
        <img
          :src="currentUrl"
          alt="Aperçu"
          class="w-full h-48 object-cover"
        />
        <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            @click="openFilePicker"
            class="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Changer l'image"
          >
            <font-awesome-icon icon="edit" class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="toggleUrlInput"
            class="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Modifier l'URL"
          >
            <font-awesome-icon icon="link" class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="removeImage"
            class="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer l'image"
          >
            <font-awesome-icon icon="trash" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Zone de drop / sélection -->
      <div
        v-else
        class="h-48 flex flex-col items-center justify-center p-4 cursor-pointer"
        @click="openFilePicker"
      >
        <!-- Indicateur d'upload en cours -->
        <div v-if="isUploading" class="text-center">
          <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-3xl mb-2" />
          <p class="text-sm text-gray-600 dark:text-gray-400">Téléversement en cours...</p>
          <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full bg-ti-blue transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            />
          </div>
        </div>

        <!-- État par défaut -->
        <template v-else>
          <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
            <font-awesome-icon icon="image" class="w-6 h-6 text-gray-400" />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
            <span class="text-ti-blue font-medium">Cliquez pour sélectionner</span>
            <br />
            ou glissez-déposez une image
          </p>
          <p class="text-xs text-gray-400 mt-2">
            JPEG, PNG, GIF, WebP • Max 5MB
          </p>
        </template>
      </div>

      <!-- Barre de progression overlay -->
      <div
        v-if="isUploading && currentUrl"
        class="absolute inset-0 bg-black/50 flex items-center justify-center"
      >
        <div class="text-center text-white">
          <font-awesome-icon icon="spinner" class="animate-spin text-2xl mb-2" />
          <p class="text-sm">{{ uploadProgress }}%</p>
        </div>
      </div>
    </div>

    <!-- Message d'erreur -->
    <p v-if="error" class="mt-2 text-sm text-red-500 flex items-center gap-1">
      <font-awesome-icon icon="circle-exclamation" class="w-3 h-3" />
      {{ error }}
    </p>

    <!-- Input URL manuel -->
    <div v-if="showUrlInput" class="mt-3">
      <div class="flex gap-2">
        <input
          v-model="urlInput"
          type="url"
          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
          :placeholder="placeholder"
          @keyup.enter="applyUrl"
        />
        <button
          type="button"
          @click="applyUrl"
          class="px-3 py-2 bg-ti-blue text-white rounded-lg hover:bg-ti-blue-600 transition-colors cursor-pointer"
        >
          <font-awesome-icon icon="check" />
        </button>
        <button
          type="button"
          @click="showUrlInput = false"
          class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
        >
          <font-awesome-icon icon="xmark" />
        </button>
      </div>
    </div>

    <!-- Bouton pour entrer URL manuellement -->
    <button
      v-if="!showUrlInput"
      type="button"
      @click="toggleUrlInput"
      class="mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-ti-blue dark:hover:text-ti-blue-400 transition-colors cursor-pointer"
    >
      <font-awesome-icon icon="link" class="mr-1" />
      Ou entrer une URL
    </button>
  </div>
</template>
