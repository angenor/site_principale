<template>
  <div :class="wrapperClass">
    <!-- Tab list -->
    <div
      role="tablist"
      :class="[
        'flex',
        variant === 'underline' ? 'border-b border-[var(--border-default)]' : '',
        variant === 'pills' ? 'gap-2' : '',
        variant === 'boxed' ? 'bg-[var(--bg-page)] rounded-lg p-1' : '',
        tabListClass
      ]"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        role="tab"
        :aria-selected="modelValue === tab.value"
        :aria-controls="`tabpanel-${tab.value}`"
        :disabled="tab.disabled"
        @click="selectTab(tab.value)"
        :class="[
          'flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50',
          sizeClasses,
          getTabClasses(tab.value, tab.disabled),
          tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <font-awesome-icon v-if="tab.icon" :icon="tab.icon" :class="iconSizeClass" />
        <span>{{ tab.label }}</span>
        <UiBadge
          v-if="tab.badge !== undefined"
          :label="String(tab.badge)"
          :variant="modelValue === tab.value ? 'primary' : 'gray'"
          size="sm"
        />
      </button>
    </div>

    <!-- Tab panels -->
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  value: string
  label: string
  icon?: string[]
  badge?: number | string
  disabled?: boolean
}

interface Props {
  modelValue: string
  tabs: Tab[]
  variant?: 'underline' | 'pills' | 'boxed'
  size?: 'sm' | 'md' | 'lg'
  wrapperClass?: string
  tabListClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'underline',
  size: 'md',
  wrapperClass: '',
  tabListClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }
  return sizes[props.size]
})

// Icon size class
const iconSizeClass = computed(() => {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }
  return sizes[props.size]
})

// Get tab-specific classes based on variant and active state
const getTabClasses = (value: string, disabled?: boolean) => {
  const isActive = props.modelValue === value

  if (props.variant === 'underline') {
    return [
      'border-b-2 -mb-px',
      isActive
        ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]',
    ].join(' ')
  }

  if (props.variant === 'pills') {
    return [
      'rounded-lg',
      isActive
        ? 'bg-[var(--color-primary)] text-white'
        : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)] hover:text-[var(--text-primary)]',
    ].join(' ')
  }

  if (props.variant === 'boxed') {
    return [
      'rounded-md flex-1 justify-center',
      isActive
        ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    ].join(' ')
  }

  return ''
}

// Select tab
const selectTab = (value: string) => {
  const tab = props.tabs.find(t => t.value === value)
  if (tab && !tab.disabled) {
    emit('update:modelValue', value)
  }
}
</script>
