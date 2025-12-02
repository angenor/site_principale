<template>
  <div :class="['space-y-1.5', wrapperClass]">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      :class="[
        'block text-sm font-medium',
        disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'
      ]"
    >
      {{ label }}
      <span v-if="required" class="text-[var(--color-error)]">*</span>
    </label>

    <!-- Input slot -->
    <div class="relative">
      <slot />
    </div>

    <!-- Help text or error -->
    <p
      v-if="error || hint"
      :class="[
        'text-xs',
        error ? 'text-[var(--color-error)]' : 'text-[var(--text-muted)]'
      ]"
    >
      {{ error || hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  wrapperClass?: string
}

withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  wrapperClass: '',
})
</script>
