<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="pendingCount > 0"
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-card)] shadow-lg"
    >
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Info -->
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <font-awesome-icon
                :icon="['fas', 'pen']"
                class="w-4 h-4 text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-[var(--text-primary)]">
                {{ pendingCount }} modification{{ pendingCount > 1 ? 's' : '' }} en attente
              </p>
              <p class="text-xs text-[var(--text-muted)]">
                Les modifications ne seront pas perdues tant que vous ne quittez pas la page
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--interactive-hover)] rounded-lg transition-colors"
              :disabled="isSaving"
              @click="$emit('discard')"
            >
              Annuler
            </button>
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSaving"
              @click="$emit('save')"
            >
              <font-awesome-icon
                v-if="isSaving"
                :icon="['fas', 'spinner']"
                class="w-4 h-4 animate-spin"
              />
              <font-awesome-icon
                v-else
                :icon="['fas', 'check']"
                class="w-4 h-4"
              />
              <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer tout' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  pendingCount: number
  isSaving?: boolean
}

defineProps<Props>()

defineEmits<{
  save: []
  discard: []
}>()
</script>
