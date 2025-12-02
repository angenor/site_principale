<template>
  <span
    :class="[
      'inline-flex items-center font-medium',
      sizeClasses,
      variantClasses,
      rounded ? 'rounded-full' : 'rounded-md',
      wrapperClass
    ]"
  >
    <!-- Dot indicator -->
    <span
      v-if="dot"
      :class="[
        'mr-1.5 rounded-full',
        dotSizeClass,
        dotColorClass
      ]"
    />

    <!-- Icon -->
    <font-awesome-icon
      v-if="icon && !dot"
      :icon="icon"
      :class="['mr-1', iconSizeClass]"
    />

    <!-- Label -->
    <slot>{{ label }}</slot>

    <!-- Remove button -->
    <button
      v-if="removable"
      @click.stop="$emit('remove')"
      :class="[
        'ml-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer',
        removeSizeClass
      ]"
      aria-label="Supprimer"
    >
      <font-awesome-icon :icon="['fas', 'xmark']" :class="removeIconClass" />
    </button>
  </span>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  icon?: string[]
  dot?: boolean
  rounded?: boolean
  removable?: boolean
  outline?: boolean
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'gray',
  size: 'md',
  dot: false,
  rounded: false,
  removable: false,
  outline: false,
  wrapperClass: '',
})

defineEmits<{
  'remove': []
}>()

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  }
  return sizes[props.size]
})

// Variant classes
const variantClasses = computed(() => {
  if (props.outline) {
    const outlineClasses = {
      primary: 'border border-[var(--color-primary)] text-[var(--color-primary)]',
      secondary: 'border border-[var(--color-secondary)] text-[var(--color-secondary)]',
      success: 'border border-[var(--color-success)] text-[var(--color-success)]',
      warning: 'border border-[var(--color-warning)] text-[var(--color-warning)]',
      error: 'border border-[var(--color-error)] text-[var(--color-error)]',
      info: 'border border-[var(--color-info)] text-[var(--color-info)]',
      gray: 'border border-[var(--border-default)] text-[var(--text-secondary)]',
    }
    return outlineClasses[props.variant]
  }

  const solidClasses = {
    primary: 'bg-[var(--color-primary-50)] text-[var(--color-primary)]',
    secondary: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary)]',
    success: 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]',
    warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning-dark)]',
    error: 'bg-[var(--color-error-light)] text-[var(--color-error-dark)]',
    info: 'bg-[var(--color-info-light)] text-[var(--color-info-dark)]',
    gray: 'bg-[var(--text-muted)]/10 text-[var(--text-secondary)]',
  }
  return solidClasses[props.variant]
})

// Dot color class
const dotColorClass = computed(() => {
  const colors = {
    primary: 'bg-[var(--color-primary)]',
    secondary: 'bg-[var(--color-secondary)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    error: 'bg-[var(--color-error)]',
    info: 'bg-[var(--color-info)]',
    gray: 'bg-[var(--text-muted)]',
  }
  return colors[props.variant]
})

// Dot size class
const dotSizeClass = computed(() => {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }
  return sizes[props.size]
})

// Icon size class
const iconSizeClass = computed(() => {
  const sizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }
  return sizes[props.size]
})

// Remove button size class
const removeSizeClass = computed(() => {
  const sizes = {
    sm: 'p-0.5',
    md: 'p-0.5',
    lg: 'p-1',
  }
  return sizes[props.size]
})

// Remove icon class
const removeIconClass = computed(() => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }
  return sizes[props.size]
})
</script>
