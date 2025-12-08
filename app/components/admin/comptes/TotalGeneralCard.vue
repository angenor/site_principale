<template>
  <div :class="containerClasses">
    <div class="flex justify-between items-center">
      <span class="text-lg font-bold">{{ title }}</span>
      <span class="text-2xl font-bold font-mono">{{ formatNumber(mainValue) }} Ar</span>
    </div>
    <div class="grid grid-cols-4 gap-4 mt-4 text-sm">
      <div v-for="(item, index) in details" :key="index">
        <span class="opacity-75">{{ item.label }}</span>
        <p class="font-mono font-semibold">
          {{ item.isPercent ? formatPercent(item.value) : formatNumber(item.value) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type ColorTheme = 'green' | 'red' | 'blue'

interface DetailItem {
  label: string
  value: number
  isPercent?: boolean
}

interface Props {
  title: string
  mainValue: number
  details: DetailItem[]
  colorTheme: ColorTheme
}

const props = defineProps<Props>()

const colorMap: Record<ColorTheme, string> = {
  green: 'bg-gradient-to-r from-green-700 to-emerald-700',
  red: 'bg-gradient-to-r from-red-700 to-rose-700',
  blue: 'bg-gradient-to-r from-blue-700 to-indigo-700',
}

const containerClasses = computed(() => [
  colorMap[props.colorTheme],
  'rounded-xl p-4 text-white',
])

const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('fr-FR').format(value)
}

const formatPercent = (value: number): string => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1 }).format(value)
}
</script>
