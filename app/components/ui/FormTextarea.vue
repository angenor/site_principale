<template>
  <UiFormField
    :id="id"
    :label="label"
    :hint="computedHint"
    :error="error"
    :required="required"
    :disabled="disabled"
    :wrapper-class="wrapperClass"
  >
    <textarea
      :id="id"
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :minlength="minlength"
      :maxlength="maxlength"
      @input="handleInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      :class="[
        'block w-full rounded-lg border transition-colors duration-200 resize-y',
        'text-[var(--text-primary)] bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        sizeClasses,
        error
          ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
          : 'border-[var(--border-default)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20',
        disabled
          ? 'bg-[var(--bg-disabled)] cursor-not-allowed opacity-60'
          : '',
        resize ? '' : 'resize-none',
        textareaClass
      ]"
    />
  </UiFormField>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  id?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  rows?: number
  minlength?: number
  maxlength?: number
  resize?: boolean
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
  wrapperClass?: string
  textareaClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  size: 'md',
  required: false,
  disabled: false,
  readonly: false,
  resize: true,
  showCount: false,
  wrapperClass: '',
  textareaClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Generate unique ID if not provided
const id = computed(() => props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`)

// Computed hint with character count
const computedHint = computed(() => {
  if (props.showCount && props.maxlength) {
    const count = `${props.modelValue?.length || 0}/${props.maxlength}`
    return props.hint ? `${props.hint} (${count})` : count
  }
  return props.hint
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
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

// Expose textarea ref for external focus
const focus = () => {
  textareaRef.value?.focus()
}

const blur = () => {
  textareaRef.value?.blur()
}

defineExpose({ focus, blur, textareaRef })
</script>
