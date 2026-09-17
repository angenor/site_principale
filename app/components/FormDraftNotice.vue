<script setup lang="ts">
const props = defineProps<{
  savedAt: number
}>()

defineEmits<{
  (e: 'discard'): void
}>()

const savedLabel = computed(() => new Date(props.savedAt).toLocaleString('fr-FR', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit'
}))
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm">
    <div class="flex items-center gap-2 flex-1">
      <font-awesome-icon icon="save" />
      <span>Brouillon restauré : saisie non enregistrée du {{ savedLabel }}.</span>
    </div>
    <button
      type="button"
      class="self-start sm:self-auto px-3 py-1 rounded-md font-medium bg-amber-100 hover:bg-amber-200 dark:bg-amber-800/50 dark:hover:bg-amber-800 transition-colors cursor-pointer"
      @click="$emit('discard')"
    >
      Ignorer le brouillon
    </button>
  </div>
</template>
