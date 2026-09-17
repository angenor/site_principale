<script setup lang="ts">
// Boutons de statut de publication et d'enregistrement des formulaires d'édition
withDefaults(defineProps<{
  published: boolean
  saving: boolean
  /** Libellé du statut publié, accordé au type de contenu (Publiée / Publié) */
  publishedLabel?: string
  variant?: 'green' | 'blue'
}>(), {
  publishedLabel: 'Publiée',
  variant: 'green'
})

defineEmits<{
  (e: 'toggle'): void
  (e: 'save'): void
}>()
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      type="button"
      :disabled="saving"
      :class="[
        published
          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300',
        'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50'
      ]"
      @click="$emit('toggle')"
    >
      <font-awesome-icon :icon="published ? 'check-circle' : 'eye-slash'" class="mr-2" />
      {{ published ? publishedLabel : 'Brouillon' }}
    </button>
    <button
      type="button"
      :disabled="saving"
      :class="[
        variant === 'blue' ? 'bg-ti-blue hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700',
        'px-4 py-2 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2'
      ]"
      @click="$emit('save')"
    >
      <font-awesome-icon v-if="saving" icon="spinner" class="animate-spin" />
      <font-awesome-icon v-else icon="check" />
      {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
    </button>
  </div>
</template>
