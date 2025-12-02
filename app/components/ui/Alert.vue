<template>
  <div
    v-if="!dismissed"
    :class="[
      'relative rounded-lg border p-4',
      variantClasses,
      wrapperClass
    ]"
    role="alert"
  >
    <div class="flex gap-3">
      <!-- Icon -->
      <div v-if="showIcon" :class="['flex-shrink-0 mt-0.5', iconColorClass]">
        <font-awesome-icon :icon="icon" class="w-5 h-5" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4
          v-if="title"
          :class="['font-semibold text-sm mb-1', titleColorClass]"
        >
          {{ title }}
        </h4>
        <div :class="['text-sm', messageColorClass]">
          <slot>{{ message }}</slot>
        </div>

        <!-- Actions -->
        <div v-if="$slots.actions" class="mt-3">
          <slot name="actions" />
        </div>
      </div>

      <!-- Dismiss button -->
      <button
        v-if="dismissible"
        @click="dismiss"
        :class="[
          'flex-shrink-0 p-1 rounded-md transition-colors cursor-pointer -mt-1 -mr-1',
          closeButtonClass
        ]"
        aria-label="Fermer"
      >
        <font-awesome-icon :icon="['fas', 'xmark']" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message?: string
  showIcon?: boolean
  dismissible?: boolean
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  showIcon: true,
  dismissible: false,
  wrapperClass: '',
})

const emit = defineEmits<{
  'dismiss': []
}>()

const dismissed = ref(false)

// Icon based on type
const icon = computed(() => {
  const icons = {
    success: ['fas', 'circle-check'],
    error: ['fas', 'circle-exclamation'],
    warning: ['fas', 'triangle-exclamation'],
    info: ['fas', 'circle-info'],
  }
  return icons[props.type]
})

// Variant classes for container
const variantClasses = computed(() => {
  const classes = {
    success: 'bg-[var(--color-success-light)] border-[var(--color-success)]/30',
    error: 'bg-[var(--color-error-light)] border-[var(--color-error)]/30',
    warning: 'bg-[var(--color-warning-light)] border-[var(--color-warning)]/30',
    info: 'bg-[var(--color-info-light)] border-[var(--color-info)]/30',
  }
  return classes[props.type]
})

// Icon color
const iconColorClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success)]',
    error: 'text-[var(--color-error)]',
    warning: 'text-[var(--color-warning)]',
    info: 'text-[var(--color-info)]',
  }
  return classes[props.type]
})

// Title color
const titleColorClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success-dark)]',
    error: 'text-[var(--color-error-dark)]',
    warning: 'text-[var(--color-warning-dark)]',
    info: 'text-[var(--color-info-dark)]',
  }
  return classes[props.type]
})

// Message color
const messageColorClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success-dark)]/80',
    error: 'text-[var(--color-error-dark)]/80',
    warning: 'text-[var(--color-warning-dark)]/80',
    info: 'text-[var(--color-info-dark)]/80',
  }
  return classes[props.type]
})

// Close button classes
const closeButtonClass = computed(() => {
  const classes = {
    success: 'text-[var(--color-success)] hover:bg-[var(--color-success)]/20',
    error: 'text-[var(--color-error)] hover:bg-[var(--color-error)]/20',
    warning: 'text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20',
    info: 'text-[var(--color-info)] hover:bg-[var(--color-info)]/20',
  }
  return classes[props.type]
})

// Dismiss alert
const dismiss = () => {
  dismissed.value = true
  emit('dismiss')
}

// Reset dismissed state
const reset = () => {
  dismissed.value = false
}

defineExpose({ reset })
</script>
