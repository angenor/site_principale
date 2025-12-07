<template>
  <div>
    <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
      Contenu texte
    </label>
    <p class="text-sm text-[var(--text-muted)] mb-3">
      Éditeur de texte riche pour créer du contenu structuré.
    </p>

    <!-- Editor.js container -->
    <div class="border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--bg-card)]">
      <!-- Loading state -->
      <div v-if="!isReady" class="p-8 flex items-center justify-center">
        <UiLoadingSpinner size="md" />
        <span class="ml-3 text-[var(--text-muted)]">Chargement de l'éditeur...</span>
      </div>

      <!-- Editor container -->
      <div
        :id="editorId"
        class="editorjs-container min-h-[200px] p-4"
        :class="{ 'opacity-0': !isReady }"
      />
    </div>

    <!-- Help text -->
    <p class="mt-2 text-xs text-[var(--text-muted)]">
      Utilisez <kbd class="px-1 py-0.5 bg-[var(--bg-secondary)] rounded text-xs">Tab</kbd> pour ajouter des blocs.
      Sélectionnez du texte pour afficher les options de formatage.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import { useEditorJS } from '~/composables/useEditorJS'

interface EditorContent {
  blocks: any[]
  time?: number
  version?: string
}

const props = defineProps<{
  modelValue: EditorContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EditorContent]
}>()

// Generate unique ID for editor holder
const editorId = `editorjs-${Math.random().toString(36).substring(2, 9)}`

// Use the composable
const { isReady, save } = useEditorJS({
  holder: editorId,
  data: props.modelValue as OutputData,
  placeholder: 'Commencez à écrire ou appuyez sur Tab pour ajouter un bloc...',
  onChange: (data: OutputData) => {
    emit('update:modelValue', {
      blocks: data.blocks,
      time: data.time,
      version: data.version,
    })
  },
})

// Expose save method for parent components
defineExpose({
  save,
})
</script>

<style scoped>
/* Editor.js styling */
.editorjs-container :deep(.ce-block__content) {
  max-width: 100%;
  margin: 0;
}

.editorjs-container :deep(.ce-toolbar__content) {
  max-width: 100%;
}

/* Paragraph */
.editorjs-container :deep(.ce-paragraph) {
  line-height: 1.6;
  color: var(--text-primary);
}

/* Header */
.editorjs-container :deep(.ce-header) {
  color: var(--text-primary);
  font-weight: 600;
}

.editorjs-container :deep(h1.ce-header) {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.editorjs-container :deep(h2.ce-header) {
  font-size: 1.5rem;
  line-height: 2rem;
}

.editorjs-container :deep(h3.ce-header) {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.editorjs-container :deep(h4.ce-header) {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

/* List */
.editorjs-container :deep(.cdx-list) {
  padding-left: 1.5rem;
}

.editorjs-container :deep(.cdx-list__item) {
  padding: 0.25rem 0;
  line-height: 1.6;
  color: var(--text-primary);
}

/* Quote */
.editorjs-container :deep(.cdx-quote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
}

.editorjs-container :deep(.cdx-quote__text) {
  font-style: italic;
  color: var(--text-primary);
  min-height: auto;
}

.editorjs-container :deep(.cdx-quote__caption) {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Delimiter */
.editorjs-container :deep(.ce-delimiter) {
  text-align: center;
  color: var(--text-muted);
}

/* Placeholder */
.editorjs-container :deep([data-placeholder]:empty::before) {
  color: var(--text-muted);
}

/* Inline toolbar */
.editorjs-container :deep(.ce-inline-toolbar) {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.editorjs-container :deep(.ce-inline-tool) {
  color: var(--text-secondary);
}

.editorjs-container :deep(.ce-inline-tool:hover) {
  background: var(--bg-secondary);
}

.editorjs-container :deep(.ce-inline-tool--active) {
  color: var(--color-primary);
}

/* Block toolbar */
.editorjs-container :deep(.ce-toolbar__plus),
.editorjs-container :deep(.ce-toolbar__settings-btn) {
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-default);
}

.editorjs-container :deep(.ce-toolbar__plus:hover),
.editorjs-container :deep(.ce-toolbar__settings-btn:hover) {
  background: var(--bg-secondary);
}

/* Conversion toolbar */
.editorjs-container :deep(.ce-conversion-toolbar) {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
}

.editorjs-container :deep(.ce-conversion-tool) {
  color: var(--text-primary);
}

.editorjs-container :deep(.ce-conversion-tool:hover) {
  background: var(--bg-secondary);
}

/* Settings panel */
.editorjs-container :deep(.ce-settings) {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
}

.editorjs-container :deep(.cdx-settings-button) {
  color: var(--text-secondary);
}

.editorjs-container :deep(.cdx-settings-button:hover) {
  background: var(--bg-secondary);
}

.editorjs-container :deep(.cdx-settings-button--active) {
  color: var(--color-primary);
}

/* Popover */
.editorjs-container :deep(.ce-popover) {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.editorjs-container :deep(.ce-popover-item) {
  color: var(--text-primary);
}

.editorjs-container :deep(.ce-popover-item:hover) {
  background: var(--bg-secondary);
}

.editorjs-container :deep(.ce-popover-item__icon) {
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 0.375rem;
}

.editorjs-container :deep(.ce-popover-item__title) {
  color: var(--text-primary);
}

.editorjs-container :deep(.ce-popover-item__secondary-title) {
  color: var(--text-muted);
}

/* Search in popover */
.editorjs-container :deep(.cdx-search-field) {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 0.375rem;
}

.editorjs-container :deep(.cdx-search-field__input) {
  color: var(--text-primary);
}
</style>
