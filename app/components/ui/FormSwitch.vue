<template>
  <label
    :class="[
      'inline-flex items-center gap-3 cursor-pointer group',
      disabled ? 'cursor-not-allowed opacity-60' : '',
      reverse ? 'flex-row-reverse' : '',
      wrapperClass
    ]"
  >
    <!-- Switch toggle -->
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      @click="toggle"
      :class="[
        'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]/50',
        sizeClasses.track,
        modelValue
          ? 'bg-[var(--color-primary)]'
          : 'bg-[var(--text-muted)]/30'
      ]"
    >
      <span
        :class="[
          'pointer-events-none inline-block rounded-full bg-white shadow-sm transform transition duration-200 ease-in-out',
          sizeClasses.thumb,
          modelValue ? sizeClasses.thumbTranslate : 'translate-x-0.5'
        ]"
      />
    </button>

    <!-- Label and description -->
    <div v-if="label || description || $slots.default" class="flex-1">
      <span
        v-if="label"
        :class="[
          'text-sm font-medium',
          disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
        ]"
      >
        {{ label }}
      </span>
      <slot />
      <p
        v-if="description"
        :class="[
          'text-xs mt-0.5',
          disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'
        ]"
      >
        {{ description }}
      </p>
    </div>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  reverse?: boolean
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  disabled: false,
  reverse: false,
  wrapperClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Size classes for track and thumb
const sizeClasses = computed(() => {
  const sizes = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-4 w-4',
      thumbTranslate: 'translate-x-4',
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-5 w-5',
      thumbTranslate: 'translate-x-5',
    },
    lg: {
      track: 'h-7 w-14',
      thumb: 'h-6 w-6',
      thumbTranslate: 'translate-x-7',
    },
  }
  return sizes[props.size]
})

// Toggle value
const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>
