<template>
  <div
    :class="[
      'inline-flex items-center justify-center',
      wrapperClass
    ]"
    role="status"
    :aria-label="label"
  >
    <!-- Spinner -->
    <svg
      :class="[sizeClasses, colorClass, 'animate-spin']"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Optional text -->
    <span
      v-if="showText"
      :class="['ml-2', textSizeClass, colorClass]"
    >
      {{ text }}
    </span>

    <!-- Screen reader only text -->
    <span v-if="!showText" class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  showText?: boolean
  label?: string
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  text: 'Chargement...',
  showText: false,
  label: 'Chargement en cours',
  wrapperClass: '',
})

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }
  return sizes[props.size]
})

// Text size classes
const textSizeClass = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }
  return sizes[props.size]
})

// Color classes
const colorClass = computed(() => {
  const colors = {
    primary: 'text-[var(--color-primary)]',
    white: 'text-white',
    gray: 'text-[var(--text-muted)]',
  }
  return colors[props.color]
})
</script>
