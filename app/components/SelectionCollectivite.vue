<script setup lang="ts">
import type { Region, District, Commune } from '~/composables/useMockData'

const emit = defineEmits<{
  search: [communeId: string, annee: number]
}>()

const { regions, getDistrictsByRegion, getCommunesByDistrict } = useMockData()

// États
const selectedRegion = ref<string>('')
const selectedDistrict = ref<string>('')
const selectedCommune = ref<string>('')
const selectedAnnee = ref<number>(2024)

// Listes filtrées
const districts = computed(() => {
  if (!selectedRegion.value) return []
  return getDistrictsByRegion(selectedRegion.value)
})

const communes = computed(() => {
  if (!selectedDistrict.value) return []
  return getCommunesByDistrict(selectedDistrict.value)
})

// Années disponibles
const annees = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

// Réinitialiser les sélections en cascade
watch(selectedRegion, () => {
  selectedDistrict.value = ''
  selectedCommune.value = ''
})

watch(selectedDistrict, () => {
  selectedCommune.value = ''
})

// Fonction de recherche
const handleSearch = () => {
  if (!selectedCommune.value) {
    alert('Veuillez sélectionner une commune')
    return
  }
  emit('search', selectedCommune.value, selectedAnnee.value)
}

// Réinitialiser les sélections
const handleReset = () => {
  selectedRegion.value = ''
  selectedDistrict.value = ''
  selectedCommune.value = ''
  selectedAnnee.value = 2024
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
      Rechercher un Compte Administratif
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Sélection Région -->
      <div>
        <label for="region" class="block text-sm font-medium text-gray-700 mb-2">
          Province
        </label>
        <select
          id="region"
          v-model="selectedRegion"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          :class="{ 'bg-gray-50': !selectedRegion }"
        >
          <option value="">-- Sélectionner une région --</option>
          <option v-for="region in regions" :key="region.id" :value="region.id">
            {{ region.nom }}
          </option>
        </select>
      </div>

      <!-- Sélection District -->
      <div>
        <label for="district" class="block text-sm font-medium text-gray-700 mb-2">
          District (Département)
        </label>
        <select
          id="district"
          v-model="selectedDistrict"
          :disabled="!selectedRegion"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          :class="{ 'bg-gray-50': !selectedDistrict }"
        >
          <option value="">-- Sélectionner un district --</option>
          <option v-for="district in districts" :key="district.id" :value="district.id">
            {{ district.nom }}
          </option>
        </select>
      </div>

      <!-- Sélection Commune -->
      <div>
        <label for="commune" class="block text-sm font-medium text-gray-700 mb-2">
          Commune
        </label>
        <select
          id="commune"
          v-model="selectedCommune"
          :disabled="!selectedDistrict"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          :class="{ 'bg-gray-50': !selectedCommune }"
        >
          <option value="">-- Sélectionner une commune --</option>
          <option v-for="commune in communes" :key="commune.id" :value="commune.id">
            {{ commune.nom }} ({{ commune.type }})
          </option>
        </select>
      </div>

      <!-- Sélection Année -->
      <div>
        <label for="annee" class="block text-sm font-medium text-gray-700 mb-2">
          Année
        </label>
        <select
          id="annee"
          v-model="selectedAnnee"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option v-for="annee in annees" :key="annee" :value="annee">
            {{ annee }}
          </option>
        </select>
      </div>
    </div>

    <!-- Boutons d'action -->
    <div class="flex gap-4 justify-center">
      <button
        @click="handleReset"
        type="button"
        class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
      >
        Réinitialiser
      </button>
      <button
        @click="handleSearch"
        type="button"
        :disabled="!selectedCommune"
        class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium shadow-md"
      >
        Afficher le Compte
      </button>
    </div>

    <!-- Info sélection -->
    <div v-if="selectedCommune" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p class="text-sm text-blue-800">
        <span class="font-semibold">Sélection actuelle :</span>
        {{ regions.find(r => r.id === selectedRegion)?.nom }} →
        {{ districts.find(d => d.id === selectedDistrict)?.nom }} →
        {{ communes.find(c => c.id === selectedCommune)?.nom }}
        ({{ selectedAnnee }})
      </p>
    </div>
  </div>
</template>

<style scoped>
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
