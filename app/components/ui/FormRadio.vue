<template>
  <label
    :class="[
      'inline-flex items-start gap-3 cursor-pointer group',
      disabled ? 'cursor-not-allowed opacity-60' : '',
      wrapperClass
    ]"
  >
    <!-- Radio input -->
    <div class="relative flex-shrink-0 mt-0.5">
      <input
        ref="inputRef"
        type="radio"
        :checked="isChecked"
        :value="value"
        :name="name"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
        class="peer sr-only"
      />
      <div
        :class="[
          'w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--color-primary)]/50',
          isChecked
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--bg-input)] border-[var(--border-default)] group-hover:border-[var(--color-primary)]',
          error
            ? 'border-[var(--color-error)]'
            : ''
        ]"
      >
        <div
          v-if="isChecked"
          class="w-2 h-2 rounded-full bg-white"
        />
      </div>
    </div>

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
        <span v-if="required" class="text-[var(--color-error)]">*</span>
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
      <p v-if="error" class="text-xs text-[var(--color-error)] mt-0.5">
        {{ error }}
      </p>
    </div>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number | null
  value: string | number
  name: string
  label?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  wrapperClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

// Check if this radio is selected
const isChecked = computed(() => props.modelValue === props.value)

// Handle change
const handleChange = () => {
  emit('update:modelValue', props.value)
}

// Expose input ref for external focus
const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus, inputRef })
</script>
