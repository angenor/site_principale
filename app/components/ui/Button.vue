<template>
  <component
    :is="componentType"
    :to="to"
    :href="href"
    :type="componentType === 'button' ? type : undefined"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      sizeClasses,
      variantClasses,
      block ? 'w-full' : '',
      rounded ? 'rounded-full' : 'rounded-lg',
      disabled || loading ? 'opacity-60 cursor-not-allowed' : '',
      buttonClass
    ]"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <UiLoadingSpinner
      v-if="loading"
      :size="spinnerSize"
      :color="spinnerColor"
      :class="[hasContent ? 'mr-2' : '']"
    />

    <!-- Left icon -->
    <font-awesome-icon
      v-else-if="icon || leftIcon"
      :icon="icon || leftIcon"
      :class="[iconSizeClass, hasContent ? 'mr-2' : '']"
    />

    <!-- Content -->
    <slot>{{ label }}</slot>

    <!-- Right icon -->
    <font-awesome-icon
      v-if="rightIcon && !loading"
      :icon="rightIcon"
      :class="[iconSizeClass, hasContent ? 'ml-2' : '']"
    />
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  label?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  type?: 'button' | 'submit' | 'reset'
  to?: RouteLocationRaw
  href?: string
  icon?: string[] // Alias for leftIcon
  leftIcon?: string[]
  rightIcon?: string[]
  loading?: boolean
  disabled?: boolean
  block?: boolean
  rounded?: boolean
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
  rounded: false,
  buttonClass: '',
})

const emit = defineEmits<{
  'click': [event: MouseEvent]
}>()

const slots = useSlots()

// Determine component type
const componentType = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

// Check if there's content
const hasContent = computed(() => {
  return !!props.label || !!slots.default
})

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
    xl: 'px-6 py-3 text-lg gap-2.5',
  }
  return sizes[props.size]
})

// Icon size classes
const iconSizeClass = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  }
  return sizes[props.size]
})

// Spinner size
const spinnerSize = computed(() => {
  const sizes: Record<string, 'xs' | 'sm' | 'md'> = {
    xs: 'xs',
    sm: 'xs',
    md: 'sm',
    lg: 'sm',
    xl: 'md',
  }
  return sizes[props.size]
})

// Spinner color
const spinnerColor = computed(() => {
  if (props.variant === 'outline' || props.variant === 'ghost' || props.variant === 'link') {
    return 'primary'
  }
  return 'white'
})

// Variant classes
const variantClasses = computed(() => {
  const variants = {
    primary: [
      'bg-[var(--color-primary)] text-white',
      'hover:bg-[var(--color-primary-600)]',
      'focus-visible:ring-[var(--color-primary)]/50',
    ].join(' '),

    secondary: [
      'bg-[var(--color-secondary)] text-white',
      'hover:bg-[var(--color-secondary-dark)]',
      'focus-visible:ring-[var(--color-secondary)]/50',
    ].join(' '),

    outline: [
      'bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)]',
      'hover:bg-[var(--color-primary-50)]',
      'focus-visible:ring-[var(--color-primary)]/50',
    ].join(' '),

    ghost: [
      'bg-transparent text-[var(--text-secondary)]',
      'hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]',
      'focus-visible:ring-[var(--color-primary)]/50',
    ].join(' '),

    danger: [
      'bg-[var(--color-error)] text-white',
      'hover:bg-[var(--color-error-dark)]',
      'focus-visible:ring-[var(--color-error)]/50',
    ].join(' '),

    success: [
      'bg-[var(--color-success)] text-white',
      'hover:bg-[var(--color-success-dark)]',
      'focus-visible:ring-[var(--color-success)]/50',
    ].join(' '),

    link: [
      'bg-transparent text-[var(--color-primary)] underline underline-offset-2',
      'hover:text-[var(--color-primary-700)] hover:no-underline',
      'focus-visible:ring-[var(--color-primary)]/50',
      'px-0 py-0', // Reset padding for link style
    ].join(' '),
  }
  return variants[props.variant]
})

// Handle click
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>
