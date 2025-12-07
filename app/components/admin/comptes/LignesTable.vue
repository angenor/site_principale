<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <UiEmptyState
      v-else-if="!lignes.length"
      :icon="['fas', 'table']"
      title="Aucune ligne"
      description="Aucune ligne budgétaire pour cette section"
      size="sm"
    />

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-[var(--border-default)]">
            <th class="text-left py-3 px-4 font-medium text-[var(--text-secondary)] w-16">
              Code
            </th>
            <th class="text-left py-3 px-4 font-medium text-[var(--text-secondary)] min-w-[200px]">
              Intitulé
            </th>
            <th
              v-for="colonne in visibleColonnes"
              :key="colonne.id"
              class="text-right py-3 px-4 font-medium text-[var(--text-secondary)] w-32"
            >
              {{ colonne.nom }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="ligne in sortedLignes" :key="ligne.id">
            <tr
              :class="[
                'border-b border-[var(--border-light)] hover:bg-[var(--interactive-hover)] transition-colors',
                ligne.rubrique?.niveau === 0 ? 'bg-[var(--bg-page)] font-semibold' : '',
                ligne.rubrique?.niveau === 1 ? 'bg-[var(--bg-card)]' : '',
              ]"
            >
              <!-- Code -->
              <td class="py-2 px-4 font-mono text-[var(--text-muted)]">
                {{ ligne.rubrique?.code }}
              </td>

              <!-- Intitulé -->
              <td
                class="py-2 px-4"
                :style="{ paddingLeft: `${(ligne.rubrique?.niveau || 0) * 16 + 16}px` }"
              >
                <span :class="ligne.rubrique?.est_calculee ? 'italic' : ''">
                  {{ ligne.rubrique?.intitule }}
                </span>
              </td>

              <!-- Colonnes de valeurs -->
              <td
                v-for="colonne in visibleColonnes"
                :key="`${ligne.id}-${colonne.id}`"
                class="py-2 px-4 text-right"
              >
                <template v-if="editable && !ligne.rubrique?.est_calculee">
                  <input
                    :value="ligne.valeurs?.[colonne.code] || ''"
                    type="text"
                    class="w-full text-right px-2 py-1 rounded border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    @blur="handleCellBlur(ligne, colonne.code, $event)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()"
                  />
                </template>
                <template v-else>
                  <span class="font-mono">
                    {{ formatValue(ligne.valeurs?.[colonne.code], colonne.type_donnee) }}
                  </span>
                </template>
              </td>
            </tr>
          </template>
        </tbody>

        <!-- Footer with totals -->
        <tfoot v-if="showTotals">
          <tr class="bg-[var(--bg-page)] font-bold border-t-2 border-[var(--border-default)]">
            <td class="py-3 px-4" colspan="2">
              TOTAL
            </td>
            <td
              v-for="colonne in visibleColonnes"
              :key="`total-${colonne.id}`"
              class="py-3 px-4 text-right font-mono"
            >
              {{ formatValue(calculateTotal(colonne.code), colonne.type_donnee) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LigneBudgetaire, ColonneDynamique } from '~/types/comptes-administratifs'

interface Props {
  lignes: LigneBudgetaire[]
  colonnes: ColonneDynamique[]
  loading?: boolean
  editable?: boolean
  showTotals?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  editable: false,
  showTotals: true,
})

const emit = defineEmits<{
  update: [ligne: LigneBudgetaire, valeurs: Record<string, any>]
}>()

// ============================================================================
// COMPUTED
// ============================================================================

const visibleColonnes = computed(() => {
  return props.colonnes
    .filter(c => c.est_active)
    .sort((a, b) => a.ordre - b.ordre)
})

const sortedLignes = computed(() => {
  return [...props.lignes].sort((a, b) => {
    // Sort by rubrique ordre
    const orderA = a.rubrique?.ordre || 0
    const orderB = b.rubrique?.ordre || 0
    return orderA - orderB
  })
})

// ============================================================================
// METHODS
// ============================================================================

const handleCellBlur = (ligne: LigneBudgetaire, colonneCode: string, event: FocusEvent) => {
  const input = event.target as HTMLInputElement
  const newValue = parseFloat(input.value.replace(/[^\d.-]/g, '')) || 0
  const oldValue = ligne.valeurs?.[colonneCode] || 0

  if (newValue !== oldValue) {
    const newValeurs = {
      ...ligne.valeurs,
      [colonneCode]: newValue,
    }
    emit('update', ligne, newValeurs)
  }
}

const calculateTotal = (colonneCode: string): number => {
  return props.lignes
    .filter(l => l.rubrique?.niveau === 0) // Only top-level items
    .reduce((sum, l) => {
      const value = l.valeurs?.[colonneCode]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
}

const formatValue = (value: any, type: string): string => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (type === 'montant' || type === 'nombre') {
    const num = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(num)) return '-'
    return new Intl.NumberFormat('fr-MG').format(num)
  }

  if (type === 'pourcentage') {
    const num = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(num)) return '-'
    return `${num.toFixed(2)}%`
  }

  return String(value)
}
</script>
