<template>
  <div class="space-y-4">
    <p class="text-sm text-[var(--text-muted)]">
      Tableau de données financières du compte administratif.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Table type -->
      <div>
        <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Type de tableau
        </label>
        <div class="space-y-2">
          <label
            v-for="option in typeOptions"
            :key="option.value"
            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
            :class="[
              localValue.type === option.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
            ]"
          >
            <input
              type="radio"
              v-model="localValue.type"
              :value="option.value"
              class="sr-only"
            />
            <font-awesome-icon :icon="option.icon" :class="option.colorClass" />
            <div>
              <p class="font-medium text-[var(--text-primary)]">{{ option.label }}</p>
              <p class="text-sm text-[var(--text-muted)]">{{ option.description }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Display options -->
      <div class="space-y-4">
        <!-- Show totals -->
        <div class="flex items-center gap-3">
          <UiFormSwitch
            v-model="localValue.afficher_totaux"
            label="Afficher les totaux"
          />
        </div>

        <!-- Show percentages -->
        <div class="flex items-center gap-3">
          <UiFormSwitch
            v-model="localValue.afficher_pourcentages"
            label="Afficher les pourcentages"
          />
        </div>

        <!-- Show evolution -->
        <div class="flex items-center gap-3">
          <UiFormSwitch
            v-model="localValue.afficher_evolution"
            label="Afficher l'évolution"
          />
        </div>
      </div>
    </div>

    <!-- Columns selection -->
    <div>
      <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
        Colonnes à afficher
      </label>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="col in availableColumns"
          :key="col.value"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
          :class="[
            isColumnSelected(col.value)
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
              : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
          ]"
        >
          <input
            type="checkbox"
            :checked="isColumnSelected(col.value)"
            @change="toggleColumn(col.value)"
            class="sr-only"
          />
          <font-awesome-icon
            :icon="isColumnSelected(col.value) ? ['fas', 'check-square'] : ['far', 'square']"
            :class="isColumnSelected(col.value) ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'"
          />
          <span class="text-sm text-[var(--text-primary)]">{{ col.label }}</span>
        </label>
      </div>
    </div>

    <!-- Preview -->
    <div class="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <p class="text-sm font-medium text-[var(--text-muted)] mb-3">Aperçu :</p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--border-default)]">
              <th class="text-left p-2 font-medium text-[var(--text-primary)]">Rubrique</th>
              <th v-if="isColumnSelected('prevision')" class="text-right p-2 font-medium text-[var(--text-primary)]">Prévision</th>
              <th v-if="isColumnSelected('realisation')" class="text-right p-2 font-medium text-[var(--text-primary)]">Réalisation</th>
              <th v-if="isColumnSelected('taux') && localValue.afficher_pourcentages" class="text-right p-2 font-medium text-[var(--text-primary)]">Taux</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 3" :key="i" class="border-b border-[var(--border-default)]/50">
              <td class="p-2 text-[var(--text-secondary)]">Rubrique exemple {{ i }}</td>
              <td v-if="isColumnSelected('prevision')" class="text-right p-2 font-mono text-[var(--text-primary)]">{{ formatMoney(1000000 * i) }}</td>
              <td v-if="isColumnSelected('realisation')" class="text-right p-2 font-mono text-[var(--text-primary)]">{{ formatMoney(800000 * i) }}</td>
              <td v-if="isColumnSelected('taux') && localValue.afficher_pourcentages" class="text-right p-2 text-[var(--text-muted)]">80%</td>
            </tr>
            <tr v-if="localValue.afficher_totaux" class="font-semibold">
              <td class="p-2 text-[var(--text-primary)]">Total</td>
              <td v-if="isColumnSelected('prevision')" class="text-right p-2 font-mono text-[var(--text-primary)]">{{ formatMoney(6000000) }}</td>
              <td v-if="isColumnSelected('realisation')" class="text-right p-2 font-mono text-[var(--text-primary)]">{{ formatMoney(4800000) }}</td>
              <td v-if="isColumnSelected('taux') && localValue.afficher_pourcentages" class="text-right p-2 text-[var(--text-muted)]">80%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TableauFinancierContent {
  tableau_id?: string
  type: 'recettes' | 'depenses' | 'equilibre'
  colonnes_visibles: string[]
  afficher_totaux?: boolean
  afficher_pourcentages?: boolean
  afficher_evolution?: boolean
}

const props = defineProps<{
  modelValue: TableauFinancierContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TableauFinancierContent]
}>()

const localValue = ref<TableauFinancierContent>({
  type: props.modelValue?.type || 'recettes',
  colonnes_visibles: props.modelValue?.colonnes_visibles || ['prevision', 'realisation', 'taux'],
  afficher_totaux: props.modelValue?.afficher_totaux ?? true,
  afficher_pourcentages: props.modelValue?.afficher_pourcentages ?? true,
  afficher_evolution: props.modelValue?.afficher_evolution ?? false,
})

const typeOptions = [
  {
    value: 'recettes' as const,
    label: 'Recettes',
    description: 'Tableau des recettes budgétaires',
    icon: ['fas', 'arrow-down'],
    colorClass: 'text-emerald-500',
  },
  {
    value: 'depenses' as const,
    label: 'Dépenses',
    description: 'Tableau des dépenses budgétaires',
    icon: ['fas', 'arrow-up'],
    colorClass: 'text-red-500',
  },
  {
    value: 'equilibre' as const,
    label: 'Équilibre',
    description: 'Tableau comparatif recettes/dépenses',
    icon: ['fas', 'balance-scale'],
    colorClass: 'text-blue-500',
  },
]

const availableColumns = [
  { value: 'prevision', label: 'Prévision' },
  { value: 'realisation', label: 'Réalisation' },
  { value: 'taux', label: 'Taux d\'exécution' },
  { value: 'reste', label: 'Reste à réaliser' },
]

const isColumnSelected = (col: string) => {
  return localValue.value.colonnes_visibles?.includes(col) ?? false
}

const toggleColumn = (col: string) => {
  if (!localValue.value.colonnes_visibles) {
    localValue.value.colonnes_visibles = []
  }

  const index = localValue.value.colonnes_visibles.indexOf(col)
  if (index >= 0) {
    localValue.value.colonnes_visibles.splice(index, 1)
  } else {
    localValue.value.colonnes_visibles.push(col)
  }
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(amount)
}

watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>
