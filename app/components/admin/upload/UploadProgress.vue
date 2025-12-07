<template>
  <div class="space-y-2">
    <!-- Header -->
    <div v-if="showLabel || showPercentage" class="flex items-center justify-between">
      <span v-if="showLabel" class="text-sm font-medium" :class="labelClass">
        {{ label || statusText }}
      </span>
      <span v-if="showPercentage && status === 'uploading'" class="text-sm text-[var(--text-muted)]">
        {{ Math.round(progress) }}%
      </span>
    </div>

    <!-- Progress bar -->
    <div
      class="overflow-hidden rounded-full"
      :class="[
        heightClass,
        'bg-[var(--bg-secondary)]'
      ]"
    >
      <div
        class="h-full transition-all duration-300 rounded-full"
        :class="progressClass"
        :style="{ width: `${effectiveProgress}%` }"
      />
    </div>

    <!-- Details -->
    <div v-if="showDetails" class="flex items-center justify-between text-xs text-[var(--text-muted)]">
      <span v-if="uploadedSize !== undefined && totalSize !== undefined">
        {{ formatSize(uploadedSize) }} / {{ formatSize(totalSize) }}
      </span>
      <span v-if="speed">{{ formatSpeed(speed) }}</span>
      <span v-if="remainingTime">{{ formatTime(remainingTime) }}</span>
    </div>

    <!-- Status icon (optional) -->
    <div v-if="showStatusIcon && status !== 'uploading'" class="flex items-center gap-2 text-sm">
      <font-awesome-icon
        v-if="status === 'success'"
        :icon="['fas', 'check-circle']"
        class="text-emerald-500"
      />
      <font-awesome-icon
        v-else-if="status === 'error'"
        :icon="['fas', 'exclamation-circle']"
        class="text-red-500"
      />
      <span :class="labelClass">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number
  status?: 'pending' | 'uploading' | 'success' | 'error'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  label?: string
  showLabel?: boolean
  showPercentage?: boolean
  showDetails?: boolean
  showStatusIcon?: boolean
  uploadedSize?: number
  totalSize?: number
  speed?: number // bytes per second
  remainingTime?: number // seconds
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'uploading',
  size: 'md',
  showLabel: true,
  showPercentage: true,
  showDetails: false,
  showStatusIcon: false,
  animated: true,
})

const heightClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-1'
    case 'sm':
      return 'h-1.5'
    case 'lg':
      return 'h-3'
    default:
      return 'h-2'
  }
})

const progressClass = computed(() => {
  const baseClasses = []

  // Color based on status
  switch (props.status) {
    case 'success':
      baseClasses.push('bg-emerald-500')
      break
    case 'error':
      baseClasses.push('bg-red-500')
      break
    default:
      baseClasses.push('bg-[var(--color-primary)]')
  }

  // Animation
  if (props.animated && props.status === 'uploading') {
    baseClasses.push('animate-pulse')
  }

  return baseClasses.join(' ')
})

const labelClass = computed(() => {
  switch (props.status) {
    case 'success':
      return 'text-emerald-500'
    case 'error':
      return 'text-red-500'
    case 'uploading':
      return 'text-[var(--color-primary)]'
    default:
      return 'text-[var(--text-muted)]'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'success':
      return 'Téléversement terminé'
    case 'error':
      return 'Erreur de téléversement'
    case 'uploading':
      return 'Téléversement en cours...'
    default:
      return 'En attente'
  }
})

const effectiveProgress = computed(() => {
  if (props.status === 'success') return 100
  if (props.status === 'error') return props.progress
  return Math.min(100, Math.max(0, props.progress))
})

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatSpeed = (bytesPerSecond: number) => {
  if (bytesPerSecond < 1024) return `${bytesPerSecond} B/s`
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
}

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s restant`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${minutes}min ${secs}s restant`
}
</script>
