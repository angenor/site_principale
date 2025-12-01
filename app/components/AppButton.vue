<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  to?: string
  href?: string
  icon?: string
  iconRight?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button'
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center font-heading font-semibold uppercase tracking-wide transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-ti-blue text-white hover:bg-ti-blue-600 active:bg-ti-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    outline: 'bg-transparent text-ti-blue border-2 border-ti-blue hover:bg-ti-blue hover:text-white',
    ghost: 'bg-transparent text-ti-blue hover:bg-ti-blue-50 dark:hover:bg-ti-blue-900/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl'
  }

  return [base, variants[props.variant], sizes[props.size]]
})

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="classes"
  >
    <font-awesome-icon v-if="loading" icon="spinner" class="animate-spin mr-2" />
    <font-awesome-icon v-else-if="icon" :icon="icon" class="mr-2" />
    <slot />
    <font-awesome-icon v-if="iconRight && !loading" :icon="iconRight" class="ml-2" />
  </NuxtLink>

  <a
    v-else-if="href"
    :href="href"
    :class="classes"
    target="_blank"
    rel="noopener noreferrer"
  >
    <font-awesome-icon v-if="loading" icon="spinner" class="animate-spin mr-2" />
    <font-awesome-icon v-else-if="icon" :icon="icon" class="mr-2" />
    <slot />
    <font-awesome-icon v-if="iconRight && !loading" :icon="iconRight" class="ml-2" />
  </a>

  <button
    v-else
    :type="type"
    :disabled="isDisabled"
    :class="classes"
    @click="handleClick"
  >
    <font-awesome-icon v-if="loading" icon="spinner" class="animate-spin mr-2" />
    <font-awesome-icon v-else-if="icon" :icon="icon" class="mr-2" />
    <slot />
    <font-awesome-icon v-if="iconRight && !loading" :icon="iconRight" class="ml-2" />
  </button>
</template>
