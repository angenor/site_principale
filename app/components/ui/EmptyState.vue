<template>
  <div
    :class="[
      'flex flex-col items-center justify-center text-center py-12 px-6',
      wrapperClass
    ]"
  >
    <!-- Icon -->
    <div
      v-if="icon || $slots.icon"
      :class="[
        'flex items-center justify-center rounded-full mb-4',
        iconBgClass,
        iconSizeClass
      ]"
    >
      <slot name="icon">
        <font-awesome-icon
          :icon="icon"
          :class="[iconColorClass, iconFontClass]"
        />
      </slot>
    </div>

    <!-- Image (alternative to icon) -->
    <img
      v-if="image && !icon && !$slots.icon"
      :src="image"
      :alt="title || 'Empty state illustration'"
      :class="['mb-4', imageClass]"
    />

    <!-- Title -->
    <h3
      v-if="title"
      class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2"
    >
      {{ title }}
    </h3>

    <!-- Description -->
    <p
      v-if="description"
      class="text-sm text-[var(--text-secondary)] max-w-md mb-6"
    >
      {{ description }}
    </p>

    <!-- Custom content -->
    <slot />

    <!-- Action buttons -->
    <div v-if="$slots.actions" class="flex flex-wrap items-center justify-center gap-3">
      <slot name="actions" />
    </div>

    <!-- Primary action button -->
    <button
      v-if="actionLabel && !$slots.actions"
      @click="$emit('action')"
      class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-600)] transition-colors cursor-pointer"
    >
      <font-awesome-icon v-if="actionIcon" :icon="actionIcon" />
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string[]
  image?: string
  title?: string
  description?: string
  actionLabel?: string
  actionIcon?: string[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal'
  wrapperClass?: string
  imageClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  wrapperClass: '',
  imageClass: 'w-48 h-48 object-contain',
})

defineEmits<{
  'action': []
}>()

// Icon background class
const iconBgClass = computed(() => {
  if (props.variant === 'minimal') return 'bg-transparent'
  return 'bg-[var(--color-primary-50)]'
})

// Icon color class
const iconColorClass = computed(() => {
  return 'text-[var(--color-primary)]'
})

// Icon size classes
const iconSizeClass = computed(() => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }
  return sizes[props.size]
})

// Icon font size
const iconFontClass = computed(() => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }
  return sizes[props.size]
})
</script>
