<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Projets Miniers
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gérer les projets d'extraction de minerais critiques
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Ajouter un projet
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
              placeholder="Rechercher un projet..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filter by Statut -->
        <div>
          <select
            v-model="selectedStatut"
            @change="loadProjets"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="en_cours">En cours</option>
            <option value="suspendu">Suspendu</option>
            <option value="termine">Terminé</option>
            <option value="planifie">Planifié</option>
          </select>
        </div>

        <!-- Filter by Type de minerai -->
        <div>
          <select
            v-model="selectedTypeMinerai"
            @change="loadProjets"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les minerais</option>
            <option v-for="type in typesMinerais" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
      </div>

      <!-- Results count -->
      <div class="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
        <span class="font-medium">{{ filteredProjets.length }}</span>
        <span class="ml-1">projet(s) trouvé(s)</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des projets miniers...</p>
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
                Nom du projet
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type de minerai
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Société exploitante
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Localisation
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="projet in filteredProjets"
              :key="projet.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ projet.code }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ projet.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ projet.type_minerai }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ projet.societe_exploitante }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ projet.commune?.nom || projet.district?.nom || projet.region?.nom || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatutClass(projet.statut)
                ]">
                  {{ getStatutLabel(projet.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editProjet(projet)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Modifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="handleDeleteProjet(projet)"
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
        <div v-if="filteredProjets.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun projet trouvé</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commencez par créer un nouveau projet minier.
          </p>
        </div>
      </div>
    </div>

    <!-- Projet Minier Modal -->
    <AdminProjetMinierModal
      :is-open="isModalOpen"
      :projet="selectedProjet"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProjetMinier } from '~/types/projets-miniers'

definePageMeta({
  layout: 'admin'
})

const { fetchProjetsMiniers, deleteProjetMinier, fetchTypesMinerais } = useProjetsMiniers()

// State
const searchQuery = ref('')
const selectedStatut = ref('')
const selectedTypeMinerai = ref('')
const projets = ref<ProjetMinier[]>([])
const typesMinerais = ref<string[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref(false)

// Modal state
const isModalOpen = ref(false)
const selectedProjet = ref<ProjetMinier | null>(null)

// Load data on mount
onMounted(async () => {
  await Promise.all([loadTypesMinerais(), loadProjets()])
})

// Methods
async function loadTypesMinerais() {
  try {
    typesMinerais.value = await fetchTypesMinerais()
  } catch (err: any) {
    console.error('Erreur lors du chargement des types de minerais:', err)
  }
}

async function loadProjets() {
  try {
    loading.value = true
    error.value = null

    const filters: any = {}
    if (selectedStatut.value) filters.statut = selectedStatut.value
    if (selectedTypeMinerai.value) filters.type_minerai = selectedTypeMinerai.value

    projets.value = await fetchProjetsMiniers(filters)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des projets miniers'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

// Computed - Filtered projets
const filteredProjets = computed(() => {
  if (!searchQuery.value) return projets.value

  const query = searchQuery.value.toLowerCase()
  return projets.value.filter(projet =>
    projet.nom.toLowerCase().includes(query) ||
    projet.code.toLowerCase().includes(query) ||
    projet.societe_exploitante.toLowerCase().includes(query) ||
    projet.type_minerai.toLowerCase().includes(query)
  )
})

// Helper functions
function getStatutLabel(statut: string): string {
  const labels: Record<string, string> = {
    en_cours: 'En cours',
    suspendu: 'Suspendu',
    termine: 'Terminé',
    planifie: 'Planifié'
  }
  return labels[statut] || statut
}

function getStatutClass(statut: string): string {
  const classes: Record<string, string> = {
    en_cours: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    suspendu: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    termine: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    planifie: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

function openCreateModal() {
  selectedProjet.value = null
  isModalOpen.value = true
}

function editProjet(projet: ProjetMinier) {
  selectedProjet.value = projet
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedProjet.value = null
}

async function handleSaved() {
  await loadProjets()
}

async function handleDeleteProjet(projet: ProjetMinier) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet ${projet.nom} ?`)) {
    return
  }

  try {
    deleting.value = true
    await deleteProjetMinier(projet.id)
    await loadProjets()
    alert(`Le projet ${projet.nom} a été supprimé avec succès`)
  } catch (err: any) {
    alert(`Erreur lors de la suppression : ${err.message}`)
    console.error('Erreur:', err)
  } finally {
    deleting.value = false
  }
}
</script>
