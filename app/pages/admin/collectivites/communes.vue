<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Communes
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gérer les communes de Madagascar
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Ajouter une commune
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-200">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- Search -->
        <div class="lg:col-span-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une commune..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filter by Type -->
        <div>
          <select
            v-model="selectedType"
            @change="loadCommunes"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value="urbaine">Urbaine</option>
            <option value="rurale">Rurale</option>
          </select>
        </div>

        <!-- Filter by Region -->
        <div>
          <select
            v-model="selectedRegionId"
            @change="onRegionChange"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les régions</option>
            <option v-for="region in allRegions" :key="region.id" :value="region.id">
              {{ region.nom }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filter by District (secondary row) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <select
            v-model="selectedDistrictId"
            @change="loadCommunes"
            :disabled="!selectedRegionId"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Tous les districts</option>
            <option v-for="district in availableDistricts" :key="district.id" :value="district.id">
              {{ district.nom }}
            </option>
          </select>
        </div>

        <!-- Results count -->
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span class="font-medium">{{ filteredCommunes.length }}</span>
          <span class="ml-1">commune(s) trouvée(s)</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des communes...</p>
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
                Nom de la commune
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                District
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Région
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Population
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="commune in paginatedCommunes"
              :key="commune.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ commune.code }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ commune.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  commune.type === 'urbaine'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                ]">
                  {{ commune.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ commune.district?.nom || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ commune.district?.region?.nom || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ commune.population?.toLocaleString() || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editCommune(commune)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Modifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="handleDeleteCommune(commune)"
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
        <div v-if="filteredCommunes.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune commune trouvée</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commencez par créer une nouvelle commune.
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredCommunes.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Affichage de {{ startIndex + 1 }} à {{ Math.min(endIndex, filteredCommunes.length) }} sur {{ filteredCommunes.length }} résultats
        </div>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Commune Modal -->
    <AdminCommuneModal
      :is-open="isModalOpen"
      :commune="selectedCommune"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { Commune } from '~/types/collectivites'
import type { Region, District } from '~/types/collectivites'

definePageMeta({
  layout: 'admin'
})

const { fetchCommunes, deleteCommune } = useCommunes()
const { fetchRegions } = useRegions()
const { fetchDistricts } = useDistricts()

// State
const searchQuery = ref('')
const selectedType = ref<'' | 'urbaine' | 'rurale'>('')
const selectedRegionId = ref('')
const selectedDistrictId = ref('')
const communes = ref<Commune[]>([])
const allRegions = ref<Region[]>([])
const allDistricts = ref<District[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref(false)

// Modal state
const isModalOpen = ref(false)
const selectedCommune = ref<Commune | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Load data on mount
onMounted(async () => {
  await Promise.all([loadRegions(), loadCommunes()])
})

// Methods
async function loadRegions() {
  try {
    allRegions.value = await fetchRegions()
  } catch (err: any) {
    console.error('Erreur lors du chargement des régions:', err)
  }
}

async function loadDistrictsByRegion() {
  if (!selectedRegionId.value) {
    allDistricts.value = []
    return
  }

  try {
    allDistricts.value = await fetchDistricts(selectedRegionId.value)
  } catch (err: any) {
    console.error('Erreur lors du chargement des districts:', err)
  }
}

async function onRegionChange() {
  selectedDistrictId.value = ''
  await loadDistrictsByRegion()
  await loadCommunes()
}

async function loadCommunes() {
  try {
    loading.value = true
    error.value = null

    const filters: any = {}
    if (selectedType.value) filters.type = selectedType.value
    if (selectedDistrictId.value) filters.districtId = selectedDistrictId.value
    if (selectedRegionId.value && !selectedDistrictId.value) filters.regionId = selectedRegionId.value

    communes.value = await fetchCommunes(filters)
    currentPage.value = 1 // Reset pagination
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des communes'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

// Computed
const availableDistricts = computed(() => {
  if (!selectedRegionId.value) return []
  return allDistricts.value
})

// Computed - Filtered communes
const filteredCommunes = computed(() => {
  if (!searchQuery.value) return communes.value

  const query = searchQuery.value.toLowerCase()
  return communes.value.filter(commune =>
    commune.nom.toLowerCase().includes(query) ||
    commune.code.toLowerCase().includes(query) ||
    (commune.maire && commune.maire.toLowerCase().includes(query)) ||
    (commune.district?.nom && commune.district.nom.toLowerCase().includes(query))
  )
})

// Pagination computed
const totalPages = computed(() => Math.ceil(filteredCommunes.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)
const paginatedCommunes = computed(() => filteredCommunes.value.slice(startIndex.value, endIndex.value))

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function openCreateModal() {
  selectedCommune.value = null
  isModalOpen.value = true
}

function editCommune(commune: Commune) {
  selectedCommune.value = commune
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedCommune.value = null
}

async function handleSaved() {
  await loadCommunes()
}

async function handleDeleteCommune(commune: Commune) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer la commune ${commune.nom} ?`)) {
    return
  }

  try {
    deleting.value = true
    await deleteCommune(commune.id)
    // Recharger la liste après suppression
    await loadCommunes()
    alert(`La commune ${commune.nom} a été supprimée avec succès`)
  } catch (err: any) {
    alert(`Erreur lors de la suppression : ${err.message}`)
    console.error('Erreur:', err)
  } finally {
    deleting.value = false
  }
}

// Watch for filter changes to reset pagination
watch([searchQuery], () => {
  currentPage.value = 1
})
</script>
