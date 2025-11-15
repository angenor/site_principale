<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Comptes Administratifs
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gérer les comptes administratifs annuels des collectivités
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nouveau compte
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
              placeholder="Rechercher un compte..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filter by Statut -->
        <div>
          <select
            v-model="selectedStatut"
            @change="loadComptes"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="valide">Validé</option>
            <option value="publie">Publié</option>
            <option value="archive">Archivé</option>
          </select>
        </div>

        <!-- Filter by Année -->
        <div>
          <select
            v-model="selectedAnnee"
            @change="loadComptes"
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
      <div class="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
        <span class="font-medium">{{ filteredComptes.length }}</span>
        <span class="ml-1">compte(s) trouvé(s)</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des comptes...</p>
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
                Collectivité
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Année
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date validation
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="compte in filteredComptes"
              :key="compte.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ compte.collectivite_nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {{ compte.collectivite_type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ compte.annee }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatutClass(compte.statut)
                ]">
                  {{ getStatutLabel(compte.statut) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ compte.date_validation ? formatDate(compte.date_validation) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewCompte(compte)"
                    class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                    title="Voir"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="editCompte(compte)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Modifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="compte.statut === 'brouillon'"
                    @click="changerStatut(compte, 'valide')"
                    class="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                    title="Valider"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    @click="handleDeleteCompte(compte)"
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
        <div v-if="filteredComptes.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun compte trouvé</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Commencez par créer un nouveau compte administratif.
          </p>
        </div>
      </div>
    </div>

    <!-- Compte Administratif Modal -->
    <AdminCompteAdministratifModal
      :is-open="isModalOpen"
      :compte="selectedCompte"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { CompteAdministratifWithStats, CompteAdministratif } from '~/types/comptes-administratifs'

definePageMeta({
  layout: 'admin'
})

const { fetchComptesAdministratifs, deleteCompteAdministratif, changerStatutCompte, fetchAnneesDisponibles } = useComptesAdministratifs()

// State
const searchQuery = ref('')
const selectedStatut = ref('')
const selectedAnnee = ref<number | ''>('')
const comptes = ref<CompteAdministratifWithStats[]>([])
const annees = ref<number[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref(false)

// Modal state
const isModalOpen = ref(false)
const selectedCompte = ref<CompteAdministratif | null>(null)

// Load data on mount
onMounted(async () => {
  await Promise.all([loadAnnees(), loadComptes()])
})

// Methods
async function loadAnnees() {
  try {
    annees.value = await fetchAnneesDisponibles()
  } catch (err: any) {
    console.error('Erreur lors du chargement des années:', err)
  }
}

async function loadComptes() {
  try {
    loading.value = true
    error.value = null

    const filters: any = {}
    if (selectedStatut.value) filters.statut = selectedStatut.value
    if (selectedAnnee.value) filters.annee = Number(selectedAnnee.value)

    comptes.value = await fetchComptesAdministratifs(filters)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des comptes'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

// Computed - Filtered comptes
const filteredComptes = computed(() => {
  if (!searchQuery.value) return comptes.value

  const query = searchQuery.value.toLowerCase()
  return comptes.value.filter(compte =>
    compte.collectivite_nom?.toLowerCase().includes(query) ||
    compte.annee.toString().includes(query)
  )
})

// Helper functions
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

function getStatutLabel(statut: string): string {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    valide: 'Validé',
    publie: 'Publié',
    archive: 'Archivé'
  }
  return labels[statut] || statut
}

function getStatutClass(statut: string): string {
  const classes: Record<string, string> = {
    brouillon: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    valide: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    publie: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    archive: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  }
  return classes[statut] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

function openCreateModal() {
  selectedCompte.value = null
  isModalOpen.value = true
}

function viewCompte(compte: CompteAdministratifWithStats) {
  alert(`Fonctionnalité à implémenter : Voir le compte ${compte.annee} de ${compte.collectivite_nom}`)
}

function editCompte(compte: CompteAdministratifWithStats) {
  selectedCompte.value = compte as CompteAdministratif
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedCompte.value = null
}

async function handleSaved() {
  await loadComptes()
}

async function changerStatut(compte: CompteAdministratifWithStats, nouveauStatut: 'brouillon' | 'valide' | 'publie' | 'archive') {
  if (!confirm(`Voulez-vous vraiment valider ce compte ?`)) {
    return
  }

  try {
    await changerStatutCompte(compte.id, nouveauStatut)
    await loadComptes()
    alert('Statut modifié avec succès')
  } catch (err: any) {
    alert(`Erreur : ${err.message}`)
    console.error('Erreur:', err)
  }
}

async function handleDeleteCompte(compte: CompteAdministratifWithStats) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce compte ?`)) {
    return
  }

  try {
    deleting.value = true
    await deleteCompteAdministratif(compte.id)
    await loadComptes()
    alert('Le compte a été supprimé avec succès')
  } catch (err: any) {
    alert(`Erreur lors de la suppression : ${err.message}`)
    console.error('Erreur:', err)
  } finally {
    deleting.value = false
  }
}
</script>
