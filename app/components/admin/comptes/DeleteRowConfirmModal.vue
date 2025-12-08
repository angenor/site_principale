<template>
  <UiModal
    v-model="isOpen"
    title="Supprimer cette ligne ?"
    size="sm"
    confirm-text="Supprimer"
    confirm-variant="danger"
    :confirm-loading="isLoading"
    cancel-text="Annuler"
    show-default-footer
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <!-- Warning icon -->
      <div class="flex items-center justify-center">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <font-awesome-icon
            :icon="['fas', 'exclamation-triangle']"
            class="text-3xl text-red-600 dark:text-red-400"
          />
        </div>
      </div>

      <!-- Row details -->
      <div v-if="row" class="p-4 bg-[var(--bg-page)] rounded-lg">
        <div class="flex items-center gap-3">
          <span class="font-mono text-sm text-[var(--text-muted)]">
            {{ row.code }}
          </span>
          <span class="text-[var(--text-primary)]">
            {{ row.intitule }}
          </span>
        </div>
        <div class="mt-2 text-xs text-[var(--text-muted)]">
          Type: {{ dataType === 'recette' ? 'Recette' : 'Dépense' }}
        </div>
      </div>

      <!-- Warning message -->
      <p class="text-sm text-[var(--text-secondary)] text-center">
        Cette action supprimera définitivement toutes les données budgétaires
        associées à cette ligne. Cette action est irréversible.
      </p>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import type { DataType } from '~/types/donnees'

interface RowInfo {
  code: string
  intitule: string
}

interface Props {
  modelValue: boolean
  row?: RowInfo | null
  dataType?: DataType
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  row: null,
  dataType: 'recette',
  isLoading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>
