<template>
  <div
    class="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden"
    :class="{ 'opacity-50': disabled }"
  >
    <div class="flex items-start gap-3 p-3">
      <!-- File icon -->
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        :class="fileTypeClass"
      >
        <font-awesome-icon :icon="fileIcon" class="text-lg" />
      </div>

      <!-- File info -->
      <div class="flex-1 min-w-0">
        <p class="font-medium text-[var(--text-primary)] truncate" :title="file.name">
          {{ displayName }}
        </p>
        <div class="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{{ formattedSize }}</span>
          <span v-if="fileExtension" class="uppercase">{{ fileExtension }}</span>
        </div>

        <!-- Progress bar -->
        <div v-if="showProgress && progress !== undefined" class="mt-2">
          <div class="flex items-center justify-between text-xs mb-1">
            <span :class="statusClass">{{ statusText }}</span>
            <span v-if="status === 'uploading'" class="text-[var(--text-muted)]">
              {{ Math.round(progress) }}%
            </span>
          </div>
          <div class="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-300"
              :class="progressBarClass"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <!-- Error message -->
        <p v-if="error" class="text-xs text-red-500 mt-1">
          {{ error }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1 shrink-0">
        <button
          v-if="showPreview && canPreview"
          type="button"
          @click="$emit('preview', file)"
          class="p-1.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Aperçu"
        >
          <font-awesome-icon :icon="['fas', 'eye']" class="text-sm" />
        </button>
        <button
          v-if="removable && status !== 'uploading'"
          type="button"
          @click="$emit('remove', file)"
          class="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
          title="Supprimer"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="text-sm" />
        </button>
      </div>
    </div>

    <!-- Image preview (if applicable) -->
    <div v-if="showPreview && isImage && previewUrl" class="border-t border-[var(--border-default)]">
      <img
        :src="previewUrl"
        :alt="file.name"
        class="w-full h-32 object-cover"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  file: File
  status?: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
  removable?: boolean
  showProgress?: boolean
  showPreview?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'pending',
  progress: 0,
  removable: true,
  showProgress: true,
  showPreview: false,
  disabled: false,
})

defineEmits<{
  remove: [file: File]
  preview: [file: File]
}>()

const previewUrl = ref<string>()

const fileExtension = computed(() => {
  return props.file.name.split('.').pop()?.toLowerCase()
})

const displayName = computed(() => {
  const name = props.file.name
  if (name.length > 40) {
    const ext = fileExtension.value
    const baseName = name.substring(0, name.length - (ext?.length || 0) - 1)
    return `${baseName.substring(0, 30)}...${ext ? `.${ext}` : ''}`
  }
  return name
})

const formattedSize = computed(() => {
  const bytes = props.file.size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

const fileType = computed(() => {
  const ext = fileExtension.value
  if (ext === 'pdf') return 'pdf'
  if (['xls', 'xlsx'].includes(ext || '')) return 'excel'
  if (['doc', 'docx'].includes(ext || '')) return 'word'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image'
  return 'other'
})

const isImage = computed(() => fileType.value === 'image')

const canPreview = computed(() => isImage.value)

const fileIcon = computed(() => {
  switch (fileType.value) {
    case 'pdf':
      return ['fas', 'file-pdf']
    case 'excel':
      return ['fas', 'file-excel']
    case 'word':
      return ['fas', 'file-word']
    case 'image':
      return ['fas', 'file-image']
    default:
      return ['fas', 'file']
  }
})

const fileTypeClass = computed(() => {
  switch (fileType.value) {
    case 'pdf':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    case 'excel':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'word':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    case 'image':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
  }
})

const statusClass = computed(() => {
  switch (props.status) {
    case 'uploading':
      return 'text-[var(--color-primary)]'
    case 'success':
      return 'text-emerald-500'
    case 'error':
      return 'text-red-500'
    default:
      return 'text-[var(--text-muted)]'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'uploading':
      return 'Téléversement...'
    case 'success':
      return 'Terminé'
    case 'error':
      return 'Erreur'
    default:
      return 'En attente'
  }
})

const progressBarClass = computed(() => {
  switch (props.status) {
    case 'success':
      return 'bg-emerald-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-[var(--color-primary)]'
  }
})

// Generate preview URL for images
onMounted(() => {
  if (props.showPreview && isImage.value) {
    previewUrl.value = URL.createObjectURL(props.file)
  }
})

onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>
