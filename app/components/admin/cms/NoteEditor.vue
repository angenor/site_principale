<template>
  <div class="space-y-4">
    <p class="text-sm text-[var(--text-muted)]">
      Encadré d'information avec style personnalisable.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Type selection -->
      <div>
        <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Type de note
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="option in typeOptions"
            :key="option.value"
            type="button"
            @click="localValue.type = option.value"
            :class="[
              'p-3 rounded-lg border-2 transition-colors text-left',
              localValue.type === option.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
            ]"
          >
            <div class="flex items-center gap-2">
              <font-awesome-icon
                :icon="option.icon"
                :class="option.colorClass"
              />
              <span class="font-medium text-[var(--text-primary)]">{{ option.label }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Title -->
      <UiFormInput
        v-model="localValue.titre"
        label="Titre (optionnel)"
        placeholder="Titre de la note"
      />
    </div>

    <!-- Content -->
    <UiFormTextarea
      v-model="localValue.contenu"
      label="Contenu"
      placeholder="Contenu de la note informative..."
      :rows="4"
    />

    <!-- Preview -->
    <div class="mt-6">
      <p class="text-sm font-medium text-[var(--text-muted)] mb-3">Aperçu :</p>
      <div
        :class="[
          'p-4 rounded-lg border-l-4',
          getPreviewClasses(localValue.type)
        ]"
      >
        <div v-if="localValue.titre" class="flex items-center gap-2 mb-2">
          <font-awesome-icon
            :icon="getTypeIcon(localValue.type)"
            :class="getTypeColorClass(localValue.type)"
          />
          <h4 class="font-semibold text-[var(--text-primary)]">
            {{ localValue.titre }}
          </h4>
        </div>
        <p class="text-[var(--text-secondary)] whitespace-pre-wrap">
          {{ localValue.contenu || 'Contenu de la note...' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NoteInformativeContent {
  type: 'info' | 'warning' | 'success' | 'error'
  titre?: string
  contenu: string
}

const props = defineProps<{
  modelValue: NoteInformativeContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: NoteInformativeContent]
}>()

const localValue = ref<NoteInformativeContent>({
  type: props.modelValue?.type || 'info',
  titre: props.modelValue?.titre || '',
  contenu: props.modelValue?.contenu || '',
})

const typeOptions = [
  { value: 'info' as const, label: 'Information', icon: ['fas', 'info-circle'], colorClass: 'text-blue-500' },
  { value: 'success' as const, label: 'Succès', icon: ['fas', 'check-circle'], colorClass: 'text-emerald-500' },
  { value: 'warning' as const, label: 'Attention', icon: ['fas', 'exclamation-triangle'], colorClass: 'text-amber-500' },
  { value: 'error' as const, label: 'Erreur', icon: ['fas', 'times-circle'], colorClass: 'text-red-500' },
]

const getTypeIcon = (type: string) => {
  const option = typeOptions.find(o => o.value === type)
  return option?.icon || ['fas', 'info-circle']
}

const getTypeColorClass = (type: string) => {
  const option = typeOptions.find(o => o.value === type)
  return option?.colorClass || 'text-blue-500'
}

const getPreviewClasses = (type: string) => {
  switch (type) {
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
    case 'success':
      return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border-red-500'
    default:
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
  }
}

watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>
