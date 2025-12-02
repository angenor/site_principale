<template>
  <label
    :class="[
      'inline-flex items-start gap-3 cursor-pointer group',
      disabled ? 'cursor-not-allowed opacity-60' : '',
      wrapperClass
    ]"
  >
    <!-- Checkbox input -->
    <div class="relative flex-shrink-0 mt-0.5">
      <input
        ref="inputRef"
        type="checkbox"
        :checked="isChecked"
        :value="value"
        :disabled="disabled"
        :required="required"
        :indeterminate="indeterminate"
        @change="handleChange"
        class="peer sr-only"
      />
      <div
        :class="[
          'w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--color-primary)]/50',
          isChecked || indeterminate
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--bg-input)] border-[var(--border-default)] group-hover:border-[var(--color-primary)]',
          error
            ? 'border-[var(--color-error)]'
            : ''
        ]"
      >
        <font-awesome-icon
          v-if="indeterminate"
          :icon="['fas', 'minus']"
          class="w-3 h-3 text-white"
        />
        <font-awesome-icon
          v-else-if="isChecked"
          :icon="['fas', 'check']"
          class="w-3 h-3 text-white"
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
  modelValue: boolean | (string | number)[]
  value?: string | number
  label?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  indeterminate?: boolean
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  indeterminate: false,
  wrapperClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | (string | number)[]]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

// Check if checked (handles both boolean and array models)
const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.value !== undefined && props.modelValue.includes(props.value)
  }
  return props.modelValue
})

// Handle change
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (Array.isArray(props.modelValue) && props.value !== undefined) {
    const newValue = [...props.modelValue]
    if (target.checked) {
      newValue.push(props.value)
    } else {
      const index = newValue.indexOf(props.value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', target.checked)
  }
}

// Expose input ref for external focus
const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus, inputRef })
</script>
