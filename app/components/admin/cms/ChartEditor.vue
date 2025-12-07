<template>
  <div class="space-y-4">
    <p class="text-sm text-[var(--text-muted)]">
      Graphique de visualisation des données financières.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Chart type -->
      <div>
        <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Type de graphique
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="option in chartTypeOptions"
            :key="option.value"
            type="button"
            @click="localValue.type = option.value"
            :class="[
              'p-3 rounded-lg border-2 transition-colors',
              localValue.type === option.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
            ]"
          >
            <font-awesome-icon :icon="option.icon" class="text-xl text-[var(--color-primary)] mb-1" />
            <p class="text-sm font-medium text-[var(--text-primary)]">{{ option.label }}</p>
          </button>
        </div>
      </div>

      <!-- Data source -->
      <div>
        <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Source des données
        </label>
        <div class="space-y-2">
          <label
            v-for="option in dataSourceOptions"
            :key="option.value"
            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
            :class="[
              localValue.donnees_source === option.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
            ]"
          >
            <input
              type="radio"
              v-model="localValue.donnees_source"
              :value="option.value"
              class="sr-only"
            />
            <font-awesome-icon :icon="option.icon" :class="option.colorClass" />
            <span class="font-medium text-[var(--text-primary)]">{{ option.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Chart title -->
    <UiFormInput
      v-model="localValue.titre"
      label="Titre du graphique"
      placeholder="Titre affiché au-dessus du graphique"
    />

    <!-- Display options -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex items-center gap-3">
        <UiFormSwitch
          v-model="localValue.options.show_legend"
          label="Afficher la légende"
        />
      </div>

      <div class="flex items-center gap-3">
        <UiFormSwitch
          v-model="localValue.options.show_labels"
          label="Afficher les valeurs"
        />
      </div>

      <div class="flex items-center gap-3">
        <UiFormSwitch
          v-model="localValue.options.animate"
          label="Animation"
        />
      </div>
    </div>

    <!-- Color scheme -->
    <div>
      <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
        Palette de couleurs
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="palette in colorPalettes"
          :key="palette.name"
          type="button"
          @click="localValue.options.color_palette = palette.name"
          :class="[
            'p-2 rounded-lg border-2 transition-colors',
            localValue.options.color_palette === palette.name
              ? 'border-[var(--color-primary)]'
              : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
          ]"
        >
          <div class="flex gap-1">
            <div
              v-for="(color, idx) in palette.colors.slice(0, 4)"
              :key="idx"
              class="w-4 h-4 rounded"
              :style="{ backgroundColor: color }"
            />
          </div>
          <p class="text-xs text-[var(--text-muted)] mt-1">{{ palette.label }}</p>
        </button>
      </div>
    </div>

    <!-- Preview -->
    <div class="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <p class="text-sm font-medium text-[var(--text-muted)] mb-3">Aperçu :</p>
      <div class="h-64 flex items-center justify-center">
        <!-- Bar chart preview -->
        <div v-if="localValue.type === 'bar'" class="flex items-end gap-4 h-full p-4">
          <div v-for="i in 5" :key="i" class="flex flex-col items-center">
            <div
              class="w-12 rounded-t transition-all"
              :style="{
                height: `${20 + Math.random() * 60}%`,
                backgroundColor: getPreviewColor(i - 1)
              }"
            />
            <span class="text-xs text-[var(--text-muted)] mt-2">Cat {{ i }}</span>
          </div>
        </div>

        <!-- Line chart preview -->
        <div v-else-if="localValue.type === 'line'" class="w-full h-full p-4">
          <svg viewBox="0 0 200 100" class="w-full h-full">
            <polyline
              fill="none"
              :stroke="getPreviewColor(0)"
              stroke-width="2"
              points="10,80 50,40 90,60 130,30 170,50 190,20"
            />
            <circle v-for="(point, i) in [[10,80], [50,40], [90,60], [130,30], [170,50], [190,20]]" :key="i"
              :cx="point[0]" :cy="point[1]" r="4" :fill="getPreviewColor(0)"
            />
          </svg>
        </div>

        <!-- Pie chart preview -->
        <div v-else-if="localValue.type === 'pie' || localValue.type === 'donut'" class="relative w-48 h-48">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" :stroke="getPreviewColor(0)" stroke-width="20" stroke-dasharray="75 175" transform="rotate(-90 50 50)" />
            <circle cx="50" cy="50" r="40" fill="none" :stroke="getPreviewColor(1)" stroke-width="20" stroke-dasharray="50 200" stroke-dashoffset="-75" transform="rotate(-90 50 50)" />
            <circle cx="50" cy="50" r="40" fill="none" :stroke="getPreviewColor(2)" stroke-width="20" stroke-dasharray="50 200" stroke-dashoffset="-125" transform="rotate(-90 50 50)" />
            <circle cx="50" cy="50" r="40" fill="none" :stroke="getPreviewColor(3)" stroke-width="20" stroke-dasharray="75 175" stroke-dashoffset="-175" transform="rotate(-90 50 50)" />
            <circle v-if="localValue.type === 'donut'" cx="50" cy="50" r="25" fill="var(--bg-secondary)" />
          </svg>
        </div>
      </div>

      <p v-if="localValue.titre" class="text-center font-medium text-[var(--text-primary)] mt-4">
        {{ localValue.titre }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GraphiquesContent {
  type: 'bar' | 'line' | 'pie' | 'donut'
  titre?: string
  donnees_source: 'recettes' | 'depenses' | 'revenus_miniers'
  options: {
    show_legend?: boolean
    show_labels?: boolean
    animate?: boolean
    color_palette?: string
  }
}

const props = defineProps<{
  modelValue: GraphiquesContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GraphiquesContent]
}>()

const localValue = ref<GraphiquesContent>({
  type: props.modelValue?.type || 'bar',
  titre: props.modelValue?.titre || '',
  donnees_source: props.modelValue?.donnees_source || 'recettes',
  options: {
    show_legend: props.modelValue?.options?.show_legend ?? true,
    show_labels: props.modelValue?.options?.show_labels ?? true,
    animate: props.modelValue?.options?.animate ?? true,
    color_palette: props.modelValue?.options?.color_palette || 'default',
  },
})

const chartTypeOptions = [
  { value: 'bar' as const, label: 'Barres', icon: ['fas', 'chart-bar'] },
  { value: 'line' as const, label: 'Ligne', icon: ['fas', 'chart-line'] },
  { value: 'pie' as const, label: 'Camembert', icon: ['fas', 'chart-pie'] },
  { value: 'donut' as const, label: 'Anneau', icon: ['fas', 'circle-notch'] },
]

const dataSourceOptions = [
  { value: 'recettes' as const, label: 'Recettes', icon: ['fas', 'arrow-down'], colorClass: 'text-emerald-500' },
  { value: 'depenses' as const, label: 'Dépenses', icon: ['fas', 'arrow-up'], colorClass: 'text-red-500' },
  { value: 'revenus_miniers' as const, label: 'Revenus miniers', icon: ['fas', 'gem'], colorClass: 'text-amber-500' },
]

const colorPalettes = [
  { name: 'default', label: 'Défaut', colors: ['#3695d8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] },
  { name: 'ocean', label: 'Océan', colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e'] },
  { name: 'sunset', label: 'Coucher de soleil', colors: ['#f97316', '#f59e0b', '#eab308', '#ef4444', '#ec4899'] },
  { name: 'forest', label: 'Forêt', colors: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'] },
  { name: 'pastel', label: 'Pastel', colors: ['#93c5fd', '#a5b4fc', '#c4b5fd', '#f9a8d4', '#fda4af'] },
]

const getPreviewColor = (index: number) => {
  const palette = colorPalettes.find(p => p.name === localValue.value.options.color_palette) || colorPalettes[0]
  return palette.colors[index % palette.colors.length]
}

watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>
