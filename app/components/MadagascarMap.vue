<script setup lang="ts">
import type { RegionWithStats } from '~/types/collectivites'

// Props
const props = defineProps<{
  regions: RegionWithStats[]
  isLoading?: boolean
  selectedRegionId?: number | null
}>()

// Emits
const emit = defineEmits<{
  regionClick: [region: RegionWithStats | null]
  regionHover: [region: RegionWithStats | null]
}>()

// amCharts
const { $am5 } = useNuxtApp()
const { isDark } = useDarkMode()

// Refs
const chartRef = ref<HTMLDivElement | null>(null)
let root: any = null
let chart: any = null
let polygonSeries: any = null

// Mapping des IDs amCharts vers les noms de régions
const amchartsToRegionName: Record<string, string> = {
  'MG-TIT': 'Itasy',
  'MG-TAT': 'Analamanga',
  'MG-TVA': 'Vakinankaratra',
  'MG-TBO': 'Bongolava',
  'MG-FAM': "Amoron'i Mania",
  'MG-FHM': 'Haute Matsiatra',
  'MG-FVF': 'Vatovavy-Fitovinany',
  'MG-FVH': 'Vatovavy',
  'MG-FFT': 'Fitovinany',
  'MG-FHO': 'Ihorombe',
  'MG-FAT': 'Atsimo-Atsinanana',
  'MG-MAL': 'Alaotra-Mangoro',
  'MG-AAO': 'Alaotra-Mangoro',
  'MG-MAT': 'Atsinanana',
  'MG-MAA': 'Analanjirofo',
  'MG-MSF': 'Sofia',
  'MG-MBO': 'Boeny',
  'MG-MBT': 'Betsiboka',
  'MG-MME': 'Melaky',
  'MG-AAM': 'Atsimo-Andrefana',
  'MG-TAD': 'Androy',
  'MG-TAN': 'Anosy',
  'MG-MAM': 'Menabe',
  'MG-DSN': 'Diana',
  'MG-DSV': 'Sava',
}

// Trouver une région par son nom
const findRegionByName = (name: string): RegionWithStats | undefined => {
  return props.regions.find(r =>
    r.nom.toLowerCase() === name.toLowerCase() ||
    r.nom.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(r.nom.toLowerCase())
  )
}

// Trouver une région par son ID amCharts
const findRegionByAmchartsId = (amchartsId: string): RegionWithStats | undefined => {
  const regionName = amchartsToRegionName[amchartsId]
  if (!regionName) return undefined
  return findRegionByName(regionName)
}

// Couleur basée sur les statistiques
const getRegionColor = (region: RegionWithStats | undefined): string => {
  if (!region) return isDark.value ? '#374151' : '#e5e7eb'

  // Couleur basée sur nb_communes (plus de communes = plus foncé)
  const nbCommunes = region.nb_communes || 0
  if (nbCommunes === 0) return isDark.value ? '#374151' : '#e5e7eb'
  if (nbCommunes < 10) return isDark.value ? '#1e40af' : '#93c5fd'
  if (nbCommunes < 20) return isDark.value ? '#1d4ed8' : '#60a5fa'
  if (nbCommunes < 30) return isDark.value ? '#2563eb' : '#3b82f6'
  return isDark.value ? '#3b82f6' : '#2563eb'
}

// Initialiser le graphique
const initChart = async () => {
  if (!chartRef.value || !$am5) return

  // Importer le geodata dynamiquement
  const madagascarRegionHigh = await import('@amcharts/amcharts5-geodata/madagascarRegionHigh').then(m => m.default)

  // Créer le root
  root = $am5.core.Root.new(chartRef.value)

  // Appliquer les thèmes
  root.setThemes([
    $am5.themes.Animated.new(root),
  ])

  // Créer le chart
  chart = root.container.children.push(
    $am5.map.MapChart.new(root, {
      panX: 'rotateX',
      panY: 'translateY',
      projection: $am5.map.geoMercator(),
      homeGeoPoint: { latitude: -18.8792, longitude: 47.5079 },
      homeZoomLevel: 1,
    })
  )

  // Créer la série de polygones
  polygonSeries = chart.series.push(
    $am5.map.MapPolygonSeries.new(root, {
      geoJSON: madagascarRegionHigh,
      valueField: 'value',
      calculateAggregates: true,
    })
  )

  // Style des polygones
  polygonSeries.mapPolygons.template.setAll({
    tooltipText: '{name}',
    interactive: true,
    fill: $am5.core.color(isDark.value ? '#374151' : '#e5e7eb'),
    strokeWidth: 1,
    stroke: $am5.core.color(isDark.value ? '#1f2937' : '#ffffff'),
  })

  // États hover et active
  polygonSeries.mapPolygons.template.states.create('hover', {
    fill: $am5.core.color(isDark.value ? '#4f46e5' : '#818cf8'),
  })

  polygonSeries.mapPolygons.template.states.create('active', {
    fill: $am5.core.color(isDark.value ? '#7c3aed' : '#a78bfa'),
  })

  // Événements
  polygonSeries.mapPolygons.template.events.on('click', (ev: any) => {
    const dataItem = ev.target.dataItem
    if (dataItem) {
      const amchartsId = dataItem.get('id')
      const region = findRegionByAmchartsId(amchartsId)
      emit('regionClick', region || null)
    }
  })

  polygonSeries.mapPolygons.template.events.on('pointerover', (ev: any) => {
    const dataItem = ev.target.dataItem
    if (dataItem) {
      const amchartsId = dataItem.get('id')
      const region = findRegionByAmchartsId(amchartsId)
      emit('regionHover', region || null)
    }
  })

  polygonSeries.mapPolygons.template.events.on('pointerout', () => {
    emit('regionHover', null)
  })

  // Adapter le tooltip pour montrer les stats
  polygonSeries.mapPolygons.template.adapters.add('tooltipText', (_text: string, target: any) => {
    const dataItem = target.dataItem
    if (dataItem) {
      const amchartsId = dataItem.get('id')
      const region = findRegionByAmchartsId(amchartsId)
      if (region) {
        return `[bold]{name}[/]\nCommunes: ${region.nb_communes || 0}\nProvince: ${region.province_nom || 'N/A'}`
      }
    }
    return '{name}'
  })

  // Mettre à jour les couleurs
  updateColors()

  // Ajouter les contrôles de zoom
  chart.set('zoomControl', $am5.map.ZoomControl.new(root, {}))
}

// Mettre à jour les couleurs des régions
const updateColors = () => {
  if (!polygonSeries) return

  polygonSeries.mapPolygons.each((polygon: any) => {
    const dataItem = polygon.dataItem
    if (dataItem) {
      const amchartsId = dataItem.get('id')
      const region = findRegionByAmchartsId(amchartsId)
      const color = getRegionColor(region)
      polygon.set('fill', $am5.core.color(color))
    }
  })
}

// Watchers
watch(() => props.regions, () => {
  updateColors()
}, { deep: true })

watch(isDark, () => {
  if (polygonSeries) {
    // Mettre à jour les couleurs de stroke et fond
    polygonSeries.mapPolygons.template.setAll({
      stroke: $am5.core.color(isDark.value ? '#1f2937' : '#ffffff'),
    })
    updateColors()
  }
})

// Lifecycle
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (root) {
    root.dispose()
  }
})
</script>

<template>
  <div class="relative w-full h-full min-h-[400px]">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-xl"
    >
      <div class="flex flex-col items-center gap-3">
        <font-awesome-icon icon="spinner" class="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        <span class="text-sm text-gray-600 dark:text-gray-400">Chargement de la carte...</span>
      </div>
    </div>

    <!-- Chart container -->
    <div
      ref="chartRef"
      class="w-full h-full min-h-[400px] rounded-xl"
    />

    <!-- Légende -->
    <div class="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
      <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre de communes</h4>
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#374151]' : 'bg-[#e5e7eb]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">0</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#1e40af]' : 'bg-[#93c5fd]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">1-9</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#1d4ed8]' : 'bg-[#60a5fa]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">10-19</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#2563eb]' : 'bg-[#3b82f6]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">20-29</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" :class="isDark ? 'bg-[#3b82f6]' : 'bg-[#2563eb]'"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400">30+</span>
        </div>
      </div>
    </div>
  </div>
</template>
