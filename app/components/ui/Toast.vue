<template>
  <div
    :class="[
      'flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-sm w-full',
      'transform transition-all duration-300 ease-out',
      variantClasses
    ]"
    role="alert"
    :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
  >
    <!-- Icon -->
    <div :class="['flex-shrink-0 w-5 h-5 mt-0.5', iconColorClass]">
      <font-awesome-icon :icon="icon" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p v-if="toast.title" :class="['font-semibold text-sm', titleColorClass]">
        {{ toast.title }}
      </p>
      <p :class="['text-sm', messageColorClass, toast.title ? 'mt-0.5' : '']">
        {{ toast.message }}
      </p>

      <!-- Action button -->
      <button
        v-if="toast.action"
        @click="handleAction"
        :class="['mt-2 text-sm font-medium underline underline-offset-2 hover:no-underline', actionColorClass]"
      >
        {{ toast.action.label }}
      </button>
    </div>

    <!-- Close button -->
    <button
      v-if="toast.dismissible"
      @click="$emit('dismiss')"
      :class="['flex-shrink-0 p-1 rounded-md transition-colors cursor-pointer', closeButtonClass]"
      aria-label="Fermer"
    >
      <font-awesome-icon :icon="['fas', 'xmark']" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Toast } from '~/composables/useToast'

interface Props {
  toast: Toast
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'dismiss': []
}>()

// Icon based on type
const icon = computed(() => {
  const icons = {
    success: ['fas', 'circle-check'],
    error: ['fas', 'circle-exclamation'],
    warning: ['fas', 'triangle-exclamation'],
    info: ['fas', 'circle-info'],
  }
  return icons[props.toast.type]
})

// Variant classes for the container
const variantClasses = computed(() => {
  const classes = {
    success: 'bg-[var(--color-success-light)] border-[var(--color-success)]',
    error: 'bg-[var(--color-error-light)] border-[var(--color-error)]',
    warning: 'bg-[var(--color-warning-light)] border-[var(--color-warning)]',
    info: 'bg-[var(--color-info-light)] border-[var(--color-info)]',
  }
  return classes[props.toast.type]
})

// Icon color
const iconColorClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success)]',
    error: 'text-[var(--color-error)]',
    warning: 'text-[var(--color-warning)]',
    info: 'text-[var(--color-info)]',
  }
  return classes[props.toast.type]
})

// Title color
const titleColorClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success-dark)]',
    error: 'text-[var(--color-error-dark)]',
    warning: 'text-[var(--color-warning-dark)]',
    info: 'text-[var(--color-info-dark)]',
  }
  return classes[props.toast.type]
})

// Message color
const messageColorClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success-dark)]/80',
    error: 'text-[var(--color-error-dark)]/80',
    warning: 'text-[var(--color-warning-dark)]/80',
    info: 'text-[var(--color-info-dark)]/80',
  }
  return classes[props.toast.type]
})

// Action button color
const actionColorClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success-dark)]',
    error: 'text-[var(--color-error-dark)]',
    warning: 'text-[var(--color-warning-dark)]',
    info: 'text-[var(--color-info-dark)]',
  }
  return classes[props.toast.type]
})

// Close button classes
const closeButtonClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success)] hover:bg-[var(--color-success)]/20',
    error: 'text-[var(--color-error)] hover:bg-[var(--color-error)]/20',
    warning: 'text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20',
    info: 'text-[var(--color-info)] hover:bg-[var(--color-info)]/20',
  }
  return classes[props.toast.type]
})

// Handle action click
const handleAction = () => {
  props.toast.action?.onClick()
  emit('dismiss')
}
</script>
