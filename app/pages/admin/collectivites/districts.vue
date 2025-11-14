<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Districts
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gérer les districts de Madagascar
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Ajouter un district
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-200">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un district..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filter by Region -->
        <div class="w-full md:w-64">
          <select
            v-model="selectedRegionId"
            @change="loadDistricts"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les régions</option>
            <option v-for="region in allRegions" :key="region.id" :value="region.id">
              {{ region.nom }}
            </option>
          </select>
        </div>

        <!-- Results count -->
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span class="font-medium">{{ filteredDistricts.length }}</span>
          <span class="ml-1">district(s) trouvé(s)</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des districts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4 transition-colors duration-200">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Erreur de chargement</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-400">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Code
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nom du district
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Région
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Chef-lieu
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nb. Communes
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="district in filteredDistricts"
              :key="district.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ district.code }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ district.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ district.region?.nom || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ district.chef_lieu || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ district.nb_communes || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editDistrict(district)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Modifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="handleDeleteDistrict(district)"
                    :disabled="deleting"
                    class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty state -->
        <div v-if="filteredDistricts.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun district trouvé</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commencez par créer un nouveau district.
          </p>
        </div>
      </div>
    </div>

    <!-- District Modal -->
    <AdminDistrictModal
      :is-open="isModalOpen"
      :district="selectedDistrict"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { DistrictWithStats, District } from '~/types/collectivites'
import type { Region } from '~/types/collectivites'

definePageMeta({
  layout: 'admin'
})

const { fetchDistricts, deleteDistrict } = useDistricts()
const { fetchRegions } = useRegions()

// State
const searchQuery = ref('')
const selectedRegionId = ref('')
const districts = ref<DistrictWithStats[]>([])
const allRegions = ref<Region[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref(false)

// Modal state
const isModalOpen = ref(false)
const selectedDistrict = ref<District | null>(null)

// Load data on mount
onMounted(async () => {
  await Promise.all([loadRegions(), loadDistricts()])
})

// Methods
async function loadRegions() {
  try {
    allRegions.value = await fetchRegions()
  } catch (err: any) {
    console.error('Erreur lors du chargement des régions:', err)
  }
}

async function loadDistricts() {
  try {
    loading.value = true
    error.value = null
    districts.value = await fetchDistricts(selectedRegionId.value || undefined)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des districts'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

// Computed - Filtered districts
const filteredDistricts = computed(() => {
  if (!searchQuery.value) return districts.value

  const query = searchQuery.value.toLowerCase()
  return districts.value.filter(district =>
    district.nom.toLowerCase().includes(query) ||
    district.code.toLowerCase().includes(query) ||
    (district.chef_lieu && district.chef_lieu.toLowerCase().includes(query)) ||
    (district.region?.nom && district.region.nom.toLowerCase().includes(query))
  )
})

function openCreateModal() {
  selectedDistrict.value = null
  isModalOpen.value = true
}

function editDistrict(district: DistrictWithStats) {
  selectedDistrict.value = district as District
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedDistrict.value = null
}

async function handleSaved() {
  await loadDistricts()
}

async function handleDeleteDistrict(district: DistrictWithStats) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le district ${district.nom} ?`)) {
    return
  }

  try {
    deleting.value = true
    await deleteDistrict(district.id)
    // Recharger la liste après suppression
    await loadDistricts()
    alert(`Le district ${district.nom} a été supprimé avec succès`)
  } catch (err: any) {
    alert(`Erreur lors de la suppression : ${err.message}`)
    console.error('Erreur:', err)
  } finally {
    deleting.value = false
  }
}
</script>
