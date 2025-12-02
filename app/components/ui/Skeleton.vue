<template>
  <div
    :class="[
      'animate-pulse bg-[var(--text-muted)]/20 rounded',
      shapeClass,
      wrapperClass
    ]"
    :style="customStyle"
    role="status"
    aria-label="Chargement..."
  >
    <span class="sr-only">Chargement...</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  wrapperClass: '',
})

// Shape classes based on variant
const shapeClass = computed(() => {
  const shapes = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }
  return shapes[props.variant]
})

// Custom style for explicit dimensions
const customStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  // For circular, make width = height if only one is provided
  if (props.variant === 'circular') {
    if (props.width && !props.height) {
      style.height = style.width
    } else if (props.height && !props.width) {
      style.width = style.height
    }
  }

  return style
})
</script>
