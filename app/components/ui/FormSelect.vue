<template>
  <UiFormField
    :id="id"
    :label="label"
    :hint="hint"
    :error="error"
    :required="required"
    :disabled="disabled"
    :wrapper-class="wrapperClass"
  >
    <div class="relative">
      <!-- Prefix icon -->
      <div
        v-if="prefixIcon"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <font-awesome-icon
          :icon="prefixIcon"
          :class="[
            'w-4 h-4',
            error ? 'text-[var(--color-error)]' : 'text-[var(--text-muted)]'
          ]"
        />
      </div>

      <!-- Select -->
      <select
        :id="id"
        ref="selectRef"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        :class="[
          'block w-full rounded-lg border transition-colors duration-200 appearance-none cursor-pointer',
          'text-[var(--text-primary)] bg-[var(--bg-input)]',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          sizeClasses,
          prefixIcon ? 'pl-10' : '',
          'pr-10', // Space for chevron
          error
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
            : 'border-[var(--border-default)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20',
          disabled
            ? 'bg-[var(--bg-disabled)] cursor-not-allowed opacity-60'
            : '',
          !modelValue && placeholder ? 'text-[var(--text-muted)]' : '',
          selectClass
        ]"
      >
        <option v-if="placeholder" value="" disabled :selected="!modelValue">
          {{ placeholder }}
        </option>
        <option
          v-for="option in normalizedOptions"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Chevron icon -->
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <font-awesome-icon
          :icon="['fas', 'chevron-down']"
          class="w-4 h-4 text-[var(--text-muted)]"
        />
      </div>
    </div>
  </UiFormField>
</template>

<script setup lang="ts">
interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number | null
  options: SelectOption[] | string[] | number[]
  id?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  prefixIcon?: string[]
  wrapperClass?: string
  selectClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  required: false,
  disabled: false,
  wrapperClass: '',
  selectClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const selectRef = ref<HTMLSelectElement | null>(null)

// Generate unique ID if not provided
const id = computed(() => props.id || `select-${Math.random().toString(36).substr(2, 9)}`)

// Normalize options to consistent format
const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object') {
      return opt
    }
    return { value: opt, label: String(opt) }
  })
})

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }
  return sizes[props.size]
})

// Handle change
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

// Expose select ref for external focus
const focus = () => {
  selectRef.value?.focus()
}

const blur = () => {
  selectRef.value?.blur()
}

defineExpose({ focus, blur, selectRef })
</script>
