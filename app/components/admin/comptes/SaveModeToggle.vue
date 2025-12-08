<template>
  <div class="flex items-center gap-3">
    <span
      :class="[
        'text-sm font-medium transition-colors',
        !modelValue ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'
      ]"
    >
      Manuel
    </span>

    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :class="[
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
        modelValue ? 'bg-[var(--color-success)]' : 'bg-gray-300 dark:bg-gray-600'
      ]"
      @click="toggle"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          modelValue ? 'translate-x-5' : 'translate-x-0'
        ]"
      />
    </button>

    <span
      :class="[
        'text-sm font-medium transition-colors',
        modelValue ? 'text-[var(--color-success)]' : 'text-[var(--text-muted)]'
      ]"
    >
      Auto
    </span>

    <div
      class="ml-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]"
      :title="modelValue ? 'Les modifications sont sauvegardées automatiquement' : 'Cliquez sur Enregistrer pour sauvegarder vos modifications'"
    >
      <font-awesome-icon
        :icon="['fas', modelValue ? 'bolt' : 'hand-pointer']"
        class="w-3 h-3"
      />
      <span class="hidden sm:inline">
        {{ modelValue ? 'Sauvegarde automatique' : 'Sauvegarde manuelle' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>
