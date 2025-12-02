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

      <!-- Input -->
      <input
        :id="id"
        ref="inputRef"
        :type="computedType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :minlength="minlength"
        :maxlength="maxlength"
        :pattern="pattern"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        :class="[
          'block w-full rounded-lg border transition-colors duration-200',
          'text-[var(--text-primary)] bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          sizeClasses,
          prefixIcon ? 'pl-10' : '',
          suffixIcon || type === 'password' ? 'pr-10' : '',
          error
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
            : 'border-[var(--border-default)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20',
          disabled
            ? 'bg-[var(--bg-disabled)] cursor-not-allowed opacity-60'
            : '',
          inputClass
        ]"
      />

      <!-- Suffix icon or password toggle -->
      <div
        v-if="suffixIcon || type === 'password'"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <button
          v-if="type === 'password'"
          type="button"
          @click="togglePasswordVisibility"
          class="text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer"
          :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        >
          <font-awesome-icon
            :icon="['fas', showPassword ? 'eye-slash' : 'eye']"
            class="w-4 h-4"
          />
        </button>
        <font-awesome-icon
          v-else-if="suffixIcon"
          :icon="suffixIcon"
          :class="[
            'w-4 h-4',
            error ? 'text-[var(--color-error)]' : 'text-[var(--text-muted)]'
          ]"
        />
      </div>
    </div>
  </UiFormField>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  id?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'time'
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  autocomplete?: string
  size?: 'sm' | 'md' | 'lg'
  prefixIcon?: string[]
  suffixIcon?: string[]
  min?: string | number
  max?: string | number
  step?: string | number
  minlength?: number
  maxlength?: number
  pattern?: string
  wrapperClass?: string
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  required: false,
  disabled: false,
  readonly: false,
  wrapperClass: '',
  inputClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const showPassword = ref(false)

// Generate unique ID if not provided
const id = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

// Compute actual type (for password visibility toggle)
const computedType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
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

// Handle input
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? (target.value ? Number(target.value) : '') : target.value
  emit('update:modelValue', value)
}

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Expose input ref for external focus
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

defineExpose({ focus, blur, inputRef })
</script>
