<template>
  <div :class="containerClasses">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div :class="iconClasses">
          <font-awesome-icon :icon="['fas', icon]" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ subtitle }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UiButton
          variant="outline"
          size="sm"
          :icon="['fas', 'plus']"
          @click="$emit('add')"
        >
          Ajouter
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          :icon="['fas', 'gear']"
          @click="$emit('manage-columns')"
        >
          Colonnes
        </UiButton>
      </div>
    </div>

    <div :class="tableContainerClasses">
      <table class="w-full border-collapse text-sm bg-white dark:bg-gray-800">
        <thead>
          <tr :class="headerRowClasses">
            <th class="text-left p-3 font-bold border-r" :class="headerBorderClass">INTITULÉ</th>
            <th
              v-for="col in colonnes"
              :key="'h-' + col.id"
              class="text-right p-3 font-bold border-r whitespace-nowrap"
              :class="[headerBorderClass, { 'bg-yellow-600/20': isHighlightedColumn(col.cle) }]"
            >
              {{ col.label.toUpperCase() }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ligne in lignes"
            :key="ligne.code"
            :class="getRowClasses(ligne)"
            class="group"
          >
            <td
              class="p-3 border border-gray-200 dark:border-gray-600 relative"
              :style="{ paddingLeft: `${ligne.niveau * 1}rem` }"
            >
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ ligne.code }}</span>
                <span :class="{ 'font-bold': ligne.niveau <= 2 }">{{ ligne.intitule }}</span>
                <!-- Delete button on hover for niveau 3 rows -->
                <button
                  v-if="ligne.niveau === 3"
                  type="button"
                  class="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all opacity-0 group-hover:opacity-100"
                  title="Supprimer cette ligne"
                  @click="$emit('delete', ligne)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
            <td
              v-for="col in colonnes"
              :key="'d-' + ligne.code + '-' + col.id"
              class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono"
              :class="getCellClasses(ligne, col)"
            >
              <template v-if="isCellEditable(col, ligne)">
                <input
                  type="text"
                  :value="formatNumber(ligne[col.cle] || 0)"
                  :class="inputClasses"
                  @blur="handleCellBlur(ligne, col.cle, $event)"
                  @keydown.enter="blurTarget"
                />
              </template>
              <template v-else>
                {{ getColonneValue(ligne, col.cle, col.type_donnee) }}
              </template>
            </td>
          </tr>
          <!-- Total row -->
          <tr :class="totalRowClasses">
            <td class="p-3 border" :class="totalBorderClass">{{ totalLabel }}</td>
            <td
              v-for="col in colonnes"
              :key="'t-' + col.id"
              class="text-right p-3 border font-mono"
              :class="totalBorderClass"
            >
              {{ getColonneValue(totaux, col.cle, col.type_donnee) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ColonneDynamique } from '~/types/comptes-administratifs'

interface LigneBudget {
  code: string
  intitule: string
  niveau: number
  [key: string]: any
}

type ColorTheme = 'green' | 'teal' | 'red' | 'orange'

interface Props {
  title: string
  subtitle: string
  icon: string
  colorTheme: ColorTheme
  lignes: LigneBudget[]
  colonnes: ColonneDynamique[]
  totaux: Record<string, any>
  totalLabel: string
  pendingChanges?: Map<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  pendingChanges: () => new Map(),
})

const emit = defineEmits<{
  add: []
  delete: [ligne: LigneBudget]
  'manage-columns': []
  'cell-change': [ligne: LigneBudget, columnKey: string, event: FocusEvent]
}>()

// Color theme mappings
const colorConfig: Record<ColorTheme, {
  container: string
  iconGradient: string
  headerGradient: string
  headerBorder: string
  tableBorder: string
  rowLevel1: string
  totalGradient: string
  totalBorder: string
  focusRing: string
}> = {
  green: {
    container: 'bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20',
    iconGradient: 'bg-gradient-to-r from-green-600 to-emerald-600',
    headerGradient: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
    headerBorder: 'border-green-500/50',
    tableBorder: 'border-2 border-green-200 dark:border-green-700',
    rowLevel1: 'bg-green-50 dark:bg-green-900/30 font-bold border-t-2 border-green-300 dark:border-green-700',
    totalGradient: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold',
    totalBorder: 'border-green-500/50',
    focusRing: 'focus:ring-green-500',
  },
  teal: {
    container: 'bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/20',
    iconGradient: 'bg-gradient-to-r from-teal-600 to-cyan-600',
    headerGradient: 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white',
    headerBorder: 'border-teal-500/50',
    tableBorder: 'border-2 border-teal-200 dark:border-teal-700',
    rowLevel1: 'bg-teal-50 dark:bg-teal-900/30 font-bold border-t-2 border-teal-300 dark:border-teal-700',
    totalGradient: 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold',
    totalBorder: 'border-teal-500/50',
    focusRing: 'focus:ring-teal-500',
  },
  red: {
    container: 'bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20',
    iconGradient: 'bg-gradient-to-r from-red-600 to-rose-600',
    headerGradient: 'bg-gradient-to-r from-red-600 to-rose-600 text-white',
    headerBorder: 'border-red-500/50',
    tableBorder: 'border-2 border-red-200 dark:border-red-700',
    rowLevel1: 'bg-red-50 dark:bg-red-900/30 font-bold border-t-2 border-red-300 dark:border-red-700',
    totalGradient: 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold',
    totalBorder: 'border-red-500/50',
    focusRing: 'focus:ring-red-500',
  },
  orange: {
    container: 'bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20',
    iconGradient: 'bg-gradient-to-r from-orange-600 to-amber-600',
    headerGradient: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white',
    headerBorder: 'border-orange-500/50',
    tableBorder: 'border-2 border-orange-200 dark:border-orange-700',
    rowLevel1: 'bg-orange-50 dark:bg-orange-900/30 font-bold border-t-2 border-orange-300 dark:border-orange-700',
    totalGradient: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold',
    totalBorder: 'border-orange-500/50',
    focusRing: 'focus:ring-orange-500',
  },
}

// Computed classes
const config = computed(() => colorConfig[props.colorTheme])

const containerClasses = computed(() => [config.value.container, 'rounded-2xl p-6'])
const iconClasses = computed(() => [config.value.iconGradient, 'p-3 rounded-xl shadow-lg'])
const tableContainerClasses = computed(() => ['overflow-x-auto rounded-xl shadow-xl', config.value.tableBorder])
const headerRowClasses = computed(() => config.value.headerGradient)
const headerBorderClass = computed(() => config.value.headerBorder)
const totalRowClasses = computed(() => config.value.totalGradient)
const totalBorderClass = computed(() => config.value.totalBorder)
const inputClasses = computed(() => [
  'w-full text-right bg-transparent border-0 focus:ring-2 focus:bg-white dark:focus:bg-gray-700 rounded px-1 py-0.5 font-mono',
  config.value.focusRing,
])

// Helper functions
const isHighlightedColumn = (cle: string): boolean => {
  return cle === 'previsions_definitives'
}

const isTauxColumn = (cle: string): boolean => {
  return cle.startsWith('taux_')
}

const isCellEditable = (colonne: ColonneDynamique, ligne: LigneBudget): boolean => {
  return colonne.est_editable && ligne.niveau === 3 && !isTauxColumn(colonne.cle)
}

const getRowClasses = (ligne: LigneBudget) => {
  if (ligne.niveau === 1) return config.value.rowLevel1
  if (ligne.niveau === 2) return 'bg-white dark:bg-gray-800'
  return 'bg-gray-50 dark:bg-gray-700/50'
}

const getCellClasses = (ligne: LigneBudget, col: ColonneDynamique) => {
  const classes: string[] = []

  // Pending change highlight
  const changeKey = `${ligne.code}-${col.cle}`
  if (props.pendingChanges.has(changeKey)) {
    classes.push('bg-amber-50 dark:bg-amber-900/30')
  }

  // Highlighted column
  if (isHighlightedColumn(col.cle) && !isCellEditable(col, ligne)) {
    classes.push('bg-yellow-50 dark:bg-yellow-900/30 font-semibold')
  }

  // Taux column coloring
  if (isTauxColumn(col.cle)) {
    classes.push('font-bold')
    const value = ligne[col.cle] || 0
    if (value >= 0.9) classes.push('text-green-600 dark:text-green-400')
    else if (value >= 0.7) classes.push('text-orange-600 dark:text-orange-400')
    else classes.push('text-red-600 dark:text-red-400')
  } else {
    classes.push('text-gray-700 dark:text-gray-300')
  }

  return classes
}

const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('fr-FR').format(value)
}

const formatPercent = (value: number): string => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1 }).format(value)
}

const getColonneValue = (ligne: Record<string, any>, cle: string, typeDonnee: string): string => {
  const value = ligne[cle]
  if (value === undefined || value === null) return '-'
  if (typeDonnee === 'pourcentage') return formatPercent(value)
  return formatNumber(value)
}

const blurTarget = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement | null
  target?.blur()
}

const handleCellBlur = (ligne: LigneBudget, columnKey: string, event: FocusEvent) => {
  emit('cell-change', ligne, columnKey, event)
}
</script>
