<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Revenus Miniers
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gérer les ristournes et redevances versées aux collectivités
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Ajouter un revenu
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-200">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              placeholder="Rechercher un revenu..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filter by Type -->
        <div>
          <select
            v-model="selectedType"
            @change="loadRevenus"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value="ristourne">Ristourne</option>
            <option value="redevance">Redevance</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <!-- Filter by Année -->
        <div>
          <select
            v-model="selectedAnnee"
            @change="loadRevenus"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les années</option>
            <option v-for="annee in annees" :key="annee" :value="annee">
              {{ annee }}
            </option>
          </select>
        </div>
      </div>

      <!-- Results count -->
      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span class="font-medium">{{ filteredRevenus.length }}</span>
          <span class="ml-1">revenu(s) trouvé(s)</span>
        </div>
        <div v-if="totalMontant > 0" class="text-sm font-medium text-gray-900 dark:text-white">
          Total: <span class="text-blue-600 dark:text-blue-400">{{ formatMontant(totalMontant) }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des revenus miniers...</p>
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
                Année
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trimestre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Projet minier
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bénéficiaire
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="revenu in paginatedRevenus"
              :key="revenu.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ revenu.annee }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ revenu.trimestre ? `T${revenu.trimestre}` : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ revenu.projet_minier?.nom || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getTypeClass(revenu.type_revenu)
                ]">
                  {{ getTypeLabel(revenu.type_revenu) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ revenu.commune?.nom || revenu.district?.nom || revenu.region?.nom || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                {{ formatMontant(revenu.montant) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editRevenu(revenu)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Modifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="handleDeleteRevenu(revenu)"
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
        <div v-if="filteredRevenus.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun revenu trouvé</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commencez par enregistrer un nouveau revenu minier.
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredRevenus.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Affichage de {{ startIndex + 1 }} à {{ Math.min(endIndex, filteredRevenus.length) }} sur {{ filteredRevenus.length }} résultats
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

    <!-- Revenu Minier Modal -->
    <AdminRevenuMinierModal
      :is-open="isModalOpen"
      :revenu="selectedRevenu"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { RevenuMinier } from '~/types/projets-miniers'

definePageMeta({
  layout: 'admin'
})

const { fetchRevenusMiniers, deleteRevenuMinier, fetchAnneesDisponibles } = useRevenusMiniers()

// State
const searchQuery = ref('')
const selectedType = ref('')
const selectedAnnee = ref<number | ''>('')
const revenus = ref<RevenuMinier[]>([])
const annees = ref<number[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref(false)

// Modal state
const isModalOpen = ref(false)
const selectedRevenu = ref<RevenuMinier | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 15

// Load data on mount
onMounted(async () => {
  await Promise.all([loadAnnees(), loadRevenus()])
})

// Methods
async function loadAnnees() {
  try {
    annees.value = await fetchAnneesDisponibles()
  } catch (err: any) {
    console.error('Erreur lors du chargement des années:', err)
  }
}

async function loadRevenus() {
  try {
    loading.value = true
    error.value = null

    const filters: any = {}
    if (selectedType.value) filters.type_revenu = selectedType.value
    if (selectedAnnee.value) filters.annee = Number(selectedAnnee.value)

    revenus.value = await fetchRevenusMiniers(filters)
    currentPage.value = 1
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des revenus miniers'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

// Computed - Filtered revenus
const filteredRevenus = computed(() => {
  if (!searchQuery.value) return revenus.value

  const query = searchQuery.value.toLowerCase()
  return revenus.value.filter(revenu =>
    revenu.projet_minier?.nom.toLowerCase().includes(query) ||
    revenu.commune?.nom.toLowerCase().includes(query) ||
    revenu.district?.nom.toLowerCase().includes(query) ||
    revenu.region?.nom.toLowerCase().includes(query)
  )
})

// Pagination computed
const totalPages = computed(() => Math.ceil(filteredRevenus.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)
const paginatedRevenus = computed(() => filteredRevenus.value.slice(startIndex.value, endIndex.value))

// Total montant
const totalMontant = computed(() => {
  return filteredRevenus.value.reduce((sum, revenu) => sum + Number(revenu.montant), 0)
})

// Helper functions
function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0
  }).format(montant)
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ristourne: 'Ristourne',
    redevance: 'Redevance',
    autre: 'Autre'
  }
  return labels[type] || type
}

function getTypeClass(type: string): string {
  const classes: Record<string, string> = {
    ristourne: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    redevance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    autre: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

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
  selectedRevenu.value = null
  isModalOpen.value = true
}

function editRevenu(revenu: RevenuMinier) {
  selectedRevenu.value = revenu
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedRevenu.value = null
}

async function handleSaved() {
  await loadRevenus()
}

async function handleDeleteRevenu(revenu: RevenuMinier) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce revenu ?`)) {
    return
  }

  try {
    deleting.value = true
    await deleteRevenuMinier(revenu.id)
    await loadRevenus()
    alert('Le revenu a été supprimé avec succès')
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
