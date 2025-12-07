<template>
  <div
    class="rounded-xl border-2 border-dashed transition-colors cursor-pointer"
    :class="[
      isDragging
        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
        : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50 bg-[var(--bg-card)]',
      sizeClasses
    ]"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="acceptTypes"
      class="hidden"
      @change="handleFileSelect"
    />

    <div class="text-center">
      <!-- Icon -->
      <div
        class="mx-auto mb-4 rounded-full flex items-center justify-center"
        :class="[
          'bg-[var(--color-primary)]/10',
          size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14'
        ]"
      >
        <font-awesome-icon
          :icon="['fas', 'cloud-arrow-up']"
          :class="[
            'text-[var(--color-primary)]',
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
          ]"
        />
      </div>

      <!-- Text -->
      <h3
        class="font-semibold text-[var(--text-primary)]"
        :class="size === 'sm' ? 'text-sm mb-1' : 'text-lg mb-2'"
      >
        {{ title || 'Déposez vos fichiers ici' }}
      </h3>
      <p class="text-[var(--text-muted)]" :class="size === 'sm' ? 'text-xs' : 'text-sm'">
        {{ subtitle || 'ou cliquez pour sélectionner' }}
      </p>

      <!-- Button (optional) -->
      <button
        v-if="showButton"
        type="button"
        @click.stop="triggerFileInput"
        class="mt-4 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors text-sm"
      >
        Parcourir les fichiers
      </button>

      <!-- Accepted formats -->
      <p v-if="showFormats" class="text-xs text-[var(--text-muted)] mt-4">
        {{ formatsText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  multiple?: boolean
  accept?: string[]
  maxSize?: number // in bytes
  size?: 'sm' | 'md' | 'lg'
  title?: string
  subtitle?: string
  showButton?: boolean
  showFormats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  accept: () => ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
  maxSize: 10 * 1024 * 1024, // 10 MB
  size: 'md',
  showButton: true,
  showFormats: true,
})

const emit = defineEmits<{
  files: [files: File[]]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'p-4'
    case 'lg':
      return 'p-12'
    default:
      return 'p-8'
  }
})

const acceptTypes = computed(() => {
  const mimeTypes: Record<string, string> = {
    pdf: '.pdf',
    doc: '.doc',
    docx: '.docx',
    xls: '.xls',
    xlsx: '.xlsx',
    jpg: '.jpg,.jpeg',
    png: '.png',
    gif: '.gif',
  }
  return props.accept.map(ext => mimeTypes[ext] || `.${ext}`).join(',')
})

const formatsText = computed(() => {
  const exts = props.accept.map(ext => ext.toUpperCase()).join(', ')
  const maxMB = (props.maxSize / (1024 * 1024)).toFixed(0)
  return `Formats : ${exts} • Max : ${maxMB} MB`
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const validateFiles = (fileList: FileList | File[]): File[] => {
  const validFiles: File[] = []
  const files = Array.from(fileList)

  for (const file of files) {
    // Check size
    if (file.size > props.maxSize) {
      emit('error', `Le fichier "${file.name}" dépasse la taille maximale autorisée`)
      continue
    }

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext && !props.accept.includes(ext)) {
      emit('error', `Le format "${ext}" n'est pas accepté pour "${file.name}"`)
      continue
    }

    validFiles.push(file)
  }

  return validFiles
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    const validFiles = validateFiles(event.dataTransfer.files)
    if (validFiles.length > 0) {
      emit('files', validFiles)
    }
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const validFiles = validateFiles(input.files)
    if (validFiles.length > 0) {
      emit('files', validFiles)
    }
    input.value = '' // Reset input
  }
}

defineExpose({
  triggerFileInput,
})
</script>
