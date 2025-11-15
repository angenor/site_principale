<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rubriques Budgétaires</h1>
        <p class="text-gray-600 dark:text-gray-400">Gestion des rubriques du plan comptable M57</p>
      </div>
      <button @click="openCreateModal" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nouvelle rubrique
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recherche</label>
        <input v-model="searchQuery" type="text" placeholder="Code ou libellé..." class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de section</label>
        <select v-model="filterSection" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">Toutes les sections</option>
          <option value="fonctionnement">Fonctionnement</option>
          <option value="investissement">Investissement</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de rubrique</label>
        <select v-model="filterType" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">Tous les types</option>
          <option value="recette">Recettes</option>
          <option value="depense">Dépenses</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
        <select v-model="filterActif" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">Tous</option>
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Rubriques</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ filteredRubriques.length }}</p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Recettes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ rubriquesByType.recette }}</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Dépenses</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ rubriquesByType.depense }}</p>
          </div>
          <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Actives</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ rubriquesByStatus.actif }}</p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des rubriques...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Libellé</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Section</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chapitre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Niveau</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="rubrique in paginatedRubriques" :key="rubrique.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-6 py-4 text-sm font-mono font-medium text-gray-900 dark:text-white">
                {{ rubrique.code_rubrique }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                <div class="flex items-center">
                  <span v-if="rubrique.niveau > 1" class="text-gray-400 dark:text-gray-500 mr-2">
                    {{ '└─'.repeat(rubrique.niveau - 1) }}
                  </span>
                  {{ rubrique.libelle }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="rubrique.section === 'fonctionnement' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ rubrique.section }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="rubrique.type_rubrique === 'recette' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ rubrique.type_rubrique }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                {{ rubrique.chapitre || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                Niveau {{ rubrique.niveau }}
              </td>
              <td class="px-6 py-4 text-sm">
                <button @click="toggleRubrique(rubrique)" :class="rubrique.est_actif ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ rubrique.est_actif ? 'Actif' : 'Inactif' }}
                </button>
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <button @click="editRubrique(rubrique)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3">
                  Modifier
                </button>
                <button @click="deleteRubrique(rubrique.id)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredRubriques.length > itemsPerPage" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Affichage {{ startIndex + 1 }} à {{ Math.min(endIndex, filteredRubriques.length) }} sur {{ filteredRubriques.length }} rubriques
        </div>
        <div class="flex gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
            Précédent
          </button>
          <button @click="currentPage++" :disabled="endIndex >= filteredRubriques.length" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Rubrique Budgétaire Modal -->
    <AdminRubriqueBudgetaireModal
      :is-open="isModalOpen"
      :rubrique="selectedRubrique"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { useRubriquesBudgetaires } from '~/composables/useRubriquesBudgetaires'
import type { RubriqueBudgetaire } from '~/types/comptes-administratifs'

definePageMeta({ layout: 'admin' })

const {
  rubriques,
  loading,
  error,
  fetchRubriques,
  deleteRubrique: deleteRubriqueAPI,
  toggleRubriqueActive
} = useRubriquesBudgetaires()

const searchQuery = ref('')
const filterSection = ref('')
const filterType = ref('')
const filterActif = ref('')

const currentPage = ref(1)
const itemsPerPage = 20

// Modal state
const isModalOpen = ref(false)
const selectedRubrique = ref<RubriqueBudgetaire | null>(null)

onMounted(async () => {
  await fetchRubriques()
})

const filteredRubriques = computed(() => {
  let result = rubriques.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.code_rubrique.toLowerCase().includes(query) ||
      r.libelle.toLowerCase().includes(query)
    )
  }

  // Section filter
  if (filterSection.value) {
    result = result.filter(r => r.section === filterSection.value)
  }

  // Type filter
  if (filterType.value) {
    result = result.filter(r => r.type_rubrique === filterType.value)
  }

  // Actif filter
  if (filterActif.value !== '') {
    const isActif = filterActif.value === 'true'
    result = result.filter(r => r.est_actif === isActif)
  }

  return result
})

const rubriquesByType = computed(() => ({
  recette: rubriques.value.filter(r => r.type_rubrique === 'recette').length,
  depense: rubriques.value.filter(r => r.type_rubrique === 'depense').length
}))

const rubriquesByStatus = computed(() => ({
  actif: rubriques.value.filter(r => r.est_actif).length,
  inactif: rubriques.value.filter(r => !r.est_actif).length
}))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => currentPage.value * itemsPerPage)
const paginatedRubriques = computed(() =>
  filteredRubriques.value.slice(startIndex.value, endIndex.value)
)

watch([searchQuery, filterSection, filterType, filterActif], () => {
  currentPage.value = 1
})

async function toggleRubrique(rubrique: RubriqueBudgetaire) {
  await toggleRubriqueActive(rubrique.id, !rubrique.est_actif)
  await fetchRubriques()
}

async function deleteRubrique(id: string) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette rubrique ?')) {
    await deleteRubriqueAPI(id)
    await fetchRubriques()
  }
}

function openCreateModal() {
  selectedRubrique.value = null
  isModalOpen.value = true
}

function editRubrique(rubrique: RubriqueBudgetaire) {
  selectedRubrique.value = rubrique
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedRubrique.value = null
}

async function handleSaved() {
  await fetchRubriques()
}
</script>
