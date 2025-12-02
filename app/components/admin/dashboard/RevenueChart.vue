<template>
  <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Évolution des Revenus
      </h2>
      <div class="flex items-center gap-2">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="[
            'px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer',
            selectedPeriod === period.value
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
          ]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="h-64 flex items-center justify-center">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!data.length" class="h-64 flex items-center justify-center">
      <UiEmptyState
        :icon="['fas', 'chart-line']"
        title="Aucune donnée"
        description="Aucune donnée disponible pour cette période."
        size="sm"
      />
    </div>

    <!-- Chart -->
    <div v-else ref="chartRef" class="h-64" />

    <!-- Legend -->
    <div v-if="!loading && data.length" class="flex items-center justify-center gap-6 mt-4">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-[var(--color-success)]" />
        <span class="text-xs text-[var(--text-secondary)]">Recettes</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-[var(--color-error)]" />
        <span class="text-xs text-[var(--text-secondary)]">Dépenses</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
        <span class="text-xs text-[var(--text-secondary)]">Revenus Miniers</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChartData {
  period: string
  recettes: number
  depenses: number
  revenus_miniers?: number
}

interface Props {
  data: ChartData[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'period-change': [period: string]
}>()

const chartRef = ref<HTMLElement | null>(null)
const selectedPeriod = ref('12m')

const periods = [
  { value: '6m', label: '6 mois' },
  { value: '12m', label: '12 mois' },
  { value: '3y', label: '3 ans' },
]

// Watch period changes
watch(selectedPeriod, (value) => {
  emit('period-change', value)
})

// Initialize amCharts
let chart: any = null

const initChart = async () => {
  if (!chartRef.value || !props.data.length) return

  // Dynamically import amCharts (only on client)
  const am5 = await import('@amcharts/amcharts5')
  const am5xy = await import('@amcharts/amcharts5/xy')
  const am5themes_Animated = await import('@amcharts/amcharts5/themes/Animated')

  // Dispose existing chart
  if (chart) {
    chart.dispose()
  }

  // Create root
  const root = am5.Root.new(chartRef.value)

  // Set theme
  root.setThemes([am5themes_Animated.default.new(root)])

  // Create chart
  chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      paddingLeft: 0,
    })
  )

  // Create X axis
  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'period',
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
      }),
    })
  )
  xAxis.data.setAll(props.data)

  // Create Y axis
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      numberFormat: '#a',
    })
  )

  // Create series function
  const createSeries = (name: string, field: string, color: string) => {
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name,
        xAxis,
        yAxis,
        valueYField: field,
        categoryXField: 'period',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{name}: {valueY}',
        }),
      })
    )

    series.columns.template.setAll({
      width: am5.percent(80),
      fillOpacity: 0.8,
      fill: am5.color(color),
      stroke: am5.color(color),
    })

    series.data.setAll(props.data)

    return series
  }

  // Add series
  createSeries('Recettes', 'recettes', '#10b981')
  createSeries('Dépenses', 'depenses', '#ef4444')
  createSeries('Revenus Miniers', 'revenus_miniers', '#3695d8')

  // Add cursor
  chart.set('cursor', am5xy.XYCursor.new(root, {}))
}

// Watch for data changes
watch(() => props.data, () => {
  if (import.meta.client) {
    initChart()
  }
}, { deep: true })

// Initialize on mount
onMounted(() => {
  if (import.meta.client && props.data.length) {
    initChart()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
})
</script>
