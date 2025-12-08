<template>
  <div class="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl shadow-inner mb-6 w-fit">
    <button
      v-for="sheet in sheets"
      :key="sheet.id"
      type="button"
      :style="modelValue === sheet.id ? getActiveStyle(sheet.color) : {}"
      :class="[
        'px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer',
        modelValue === sheet.id
          ? 'text-white shadow-lg'
          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 bg-transparent'
      ]"
      @click="$emit('update:modelValue', sheet.id)"
    >
      <font-awesome-icon :icon="['fas', sheet.icon]" class="w-4 h-4" />
      <span>{{ sheet.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
type SheetId = 'RECETTE' | 'DEPENSES' | 'EQUILIBRE'

interface Sheet {
  id: SheetId
  label: string
  icon: string
  color: string
}

interface Props {
  modelValue: SheetId
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: SheetId]
}>()

const sheets: Sheet[] = [
  { id: 'RECETTE', label: 'Recettes', icon: 'arrow-trend-up', color: 'green' },
  { id: 'DEPENSES', label: 'Dépenses', icon: 'arrow-trend-down', color: 'red' },
  { id: 'EQUILIBRE', label: 'Équilibre', icon: 'scale-balanced', color: 'blue' },
]

const colorMap: Record<string, { from: string; to: string }> = {
  green: { from: '#16a34a', to: '#10b981' },
  red: { from: '#dc2626', to: '#f43f5e' },
  blue: { from: '#2563eb', to: '#3b82f6' },
}

const getActiveStyle = (color: string) => {
  const colors = colorMap[color] || colorMap.blue
  return {
    background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
  }
}
</script>
