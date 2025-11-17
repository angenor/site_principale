<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tableau d'Équilibre</h1>
        <p class="text-gray-600 dark:text-gray-400">Équilibre budgétaire par section (Fonctionnement et Investissement)</p>
      </div>
    </div>

    <!-- Sélection du compte administratif -->
    <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sélectionner un compte administratif</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Année</label>
          <select v-model="selectedAnnee" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Sélectionner une année</option>
            <option v-for="annee in anneesDisponibles" :key="annee" :value="annee">{{ annee }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de collectivité</label>
          <select v-model="selectedTypeCollectivite" @change="onTypeCollectiviteChange" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Sélectionner le type</option>
            <option value="commune">Commune</option>
            <option value="district">District</option>
            <option value="region">Région</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Collectivité</label>
          <select v-model="selectedCollectiviteId" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option :value="null">Sélectionner</option>
            <option v-for="item in collectivitesOptions" :key="item.id" :value="item.id">
              {{ item.code }} - {{ item.nom }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-3">
        <button @click="exporterExcel" :disabled="!equilibreData || exporting" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2">
          <svg v-if="!exporting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white" v-else></span>
          {{ exporting ? 'Export...' : 'Exporter Excel' }}
        </button>
        <button @click="loadTableauEquilibre" :disabled="!canLoad || loading" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          {{ loading ? 'Chargement...' : 'Afficher le tableau d\'équilibre' }}
        </button>
      </div>
    </div>

    <!-- Tableau d'équilibre -->
    <div v-if="equilibreData" class="space-y-6">
      <!-- En-tête du compte -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p class="text-sm text-blue-800 dark:text-blue-400">
          Compte administratif : <strong>{{ compteLabel }}</strong> - Année {{ equilibreData.annee }}
        </p>
      </div>

      <!-- Section Fonctionnement -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-4 bg-blue-600 text-white">
          <h2 class="text-lg font-semibold">Section Fonctionnement</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <!-- Dépenses de fonctionnement -->
          <div>
            <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Dépenses</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Compte</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mandat admis</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Paiement</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(ligne, index) in depensesFonctionnement" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">{{ ligne.compte }} - {{ ligne.intitule }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">{{ formatMontant(ligne.mandat_admis) }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">{{ formatMontant(ligne.paiement) }}</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-700 font-semibold">
                    <td class="px-3 py-2 text-sm">TOTAL DÉPENSES FONCTIONNEMENT</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatMontant(equilibreData.total_depenses_fonct) }}</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatMontant(totalPaiementFonct) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recettes de fonctionnement -->
          <div>
            <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Recettes</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Compte</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">OR admis</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recouvrement</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(ligne, index) in recettesFonctionnement" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">{{ ligne.compte }} - {{ ligne.intitule }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">{{ formatMontant(ligne.or_admis) }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">{{ formatMontant(ligne.recouvrement) }}</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-700 font-semibold">
                    <td class="px-3 py-2 text-sm">TOTAL RECETTES FONCTIONNEMENT</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatMontant(equilibreData.total_recettes_fonct) }}</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatMontant(totalRecouvrementFonct) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Solde Fonctionnement -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold text-gray-900 dark:text-white">Solde de Fonctionnement</span>
            <span :class="[
              'text-xl font-bold',
              equilibreData.solde_fonctionnement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ formatMontant(equilibreData.solde_fonctionnement) }} MGA
            </span>
          </div>
        </div>
      </div>

      <!-- Section Investissement -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-4 bg-purple-600 text-white">
          <h2 class="text-lg font-semibold">Section Investissement</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <!-- Dépenses d'investissement -->
          <div>
            <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Dépenses</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Compte</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mandat admis</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Paiement</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(ligne, index) in depensesInvestissement" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">{{ ligne.compte }} - {{ ligne.intitule }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">{{ formatMontant(ligne.mandat_admis) }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">{{ formatMontant(ligne.paiement) }}</td>
                  </tr>
                  <tr v-if="depensesInvestissement.length > 0" class="bg-gray-100 dark:bg-gray-700 font-semibold">
                    <td class="px-3 py-2 text-sm">TOTAL DÉPENSES INVESTISSEMENT</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatMontant(totalMandatInvest) }}</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatMontant(totalPaiementInvest) }}</td>
                  </tr>
                  <tr v-else>
                    <td colspan="3" class="px-3 py-4 text-center text-gray-500 dark:text-gray-400">Aucune dépense d'investissement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recettes d'investissement -->
          <div>
            <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Recettes</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Compte</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">OR admis</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recouvrement</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(ligne, index) in recettesInvestissement" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td class="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">{{ ligne.compte }} - {{ ligne.intitule }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">{{ formatMontant(ligne.or_admis) }}</td>
                    <td class="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">{{ formatMontant(ligne.recouvrement) }}</td>
                  </tr>
                  <tr v-if="recettesInvestissement.length > 0" class="bg-gray-100 dark:bg-gray-700 font-semibold">
                    <td class="px-3 py-2 text-sm">TOTAL RECETTES INVESTISSEMENT</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatMontant(totalORInvest) }}</td>
                    <td class="px-3 py-2 text-sm text-right">{{ formatMontant(totalRecouvrementInvest) }}</td>
                  </tr>
                  <tr v-else>
                    <td colspan="3" class="px-3 py-4 text-center text-gray-500 dark:text-gray-400">Aucune recette d'investissement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div class="text-gray-400 dark:text-gray-600 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      </div>
      <p class="text-gray-600 dark:text-gray-400">
        Sélectionnez un compte administratif pour afficher le tableau d'équilibre
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegions } from '~/composables/useRegions'
import { useDistricts } from '~/composables/useDistricts'
import { useCommunes } from '~/composables/useCommunes'

definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()
const { fetchRegions } = useRegions()
const { fetchDistricts } = useDistricts()
const { fetchCommunes } = useCommunes()

// État
const selectedAnnee = ref<number | ''>('')
const selectedTypeCollectivite = ref('')
const selectedCollectiviteId = ref<string | null>(null)
const equilibreData = ref<any>(null)
const loading = ref(false)
const exporting = ref(false)

// Données des collectivités
const regions = ref<any[]>([])
const districts = ref<any[]>([])
const communes = ref<any[]>([])

// Computed
const anneesDisponibles = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)
})

const collectivitesOptions = computed(() => {
  if (selectedTypeCollectivite.value === 'region') return regions.value
  if (selectedTypeCollectivite.value === 'district') return districts.value
  if (selectedTypeCollectivite.value === 'commune') return communes.value
  return []
})

const canLoad = computed(() => {
  return selectedAnnee.value && selectedTypeCollectivite.value && selectedCollectiviteId.value
})

const compteLabel = computed(() => {
  if (!equilibreData.value) return ''
  const collectivite = collectivitesOptions.value.find(c => c.id === selectedCollectiviteId.value)
  return collectivite ? `${selectedTypeCollectivite.value === 'region' ? 'Région' : selectedTypeCollectivite.value === 'district' ? 'District' : 'Commune'} ${collectivite.nom}` : ''
})

const depensesFonctionnement = computed(() => {
  return equilibreData.value?.depenses_fonctionnement || []
})

const recettesFonctionnement = computed(() => {
  return equilibreData.value?.recettes_fonctionnement || []
})

const depensesInvestissement = computed(() => {
  return equilibreData.value?.depenses_investissement || []
})

const recettesInvestissement = computed(() => {
  return equilibreData.value?.recettes_investissement || []
})

const totalPaiementFonct = computed(() => {
  return depensesFonctionnement.value.reduce((sum: number, ligne: any) => sum + (ligne.paiement || 0), 0)
})

const totalRecouvrementFonct = computed(() => {
  return recettesFonctionnement.value.reduce((sum: number, ligne: any) => sum + (ligne.recouvrement || 0), 0)
})

const totalMandatInvest = computed(() => {
  return depensesInvestissement.value.reduce((sum: number, ligne: any) => sum + (ligne.mandat_admis || 0), 0)
})

const totalPaiementInvest = computed(() => {
  return depensesInvestissement.value.reduce((sum: number, ligne: any) => sum + (ligne.paiement || 0), 0)
})

const totalORInvest = computed(() => {
  return recettesInvestissement.value.reduce((sum: number, ligne: any) => sum + (ligne.or_admis || 0), 0)
})

const totalRecouvrementInvest = computed(() => {
  return recettesInvestissement.value.reduce((sum: number, ligne: any) => sum + (ligne.recouvrement || 0), 0)
})

onMounted(async () => {
  // Charger les données des collectivités
  const [regionsData, districtsData, communesData] = await Promise.all([
    fetchRegions(),
    fetchDistricts(),
    fetchCommunes()
  ])

  regions.value = regionsData
  districts.value = districtsData
  communes.value = communesData
})

function onTypeCollectiviteChange() {
  selectedCollectiviteId.value = null
}

async function loadTableauEquilibre() {
  if (!canLoad.value) return

  loading.value = true
  try {
    // Construire le filtre
    const filters: any = { annee: selectedAnnee.value }
    if (selectedTypeCollectivite.value === 'region') filters.region_id = selectedCollectiviteId.value
    else if (selectedTypeCollectivite.value === 'district') filters.district_id = selectedCollectiviteId.value
    else if (selectedTypeCollectivite.value === 'commune') filters.commune_id = selectedCollectiviteId.value

    // Note: La vue v_equilibre_compte_administratif nécessite que les données des lignes budgétaires existent
    const { data, error } = await supabase
      .from('v_equilibre_compte_administratif')
      .select('*')
      .match(filters)
      .single()

    if (error) throw error

    equilibreData.value = data
  } catch (err) {
    console.error('Erreur lors du chargement du tableau d\'équilibre:', err)
    alert('Impossible de charger le tableau d\'équilibre. Vérifiez que des lignes budgétaires ont été saisies pour ce compte.')
    equilibreData.value = null
  } finally {
    loading.value = false
  }
}

async function exporterExcel() {
  if (!canLoad.value || !equilibreData.value) return

  exporting.value = true
  try {
    // Construire l'URL avec les paramètres
    const params = new URLSearchParams({
      annee: selectedAnnee.value.toString(),
      collectivite_id: selectedCollectiviteId.value!,
      collectivite_type: selectedTypeCollectivite.value
    })

    // Appeler l'API
    const response = await fetch(`/api/export/compte-administratif?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Erreur lors de l\'export')
    }

    // Télécharger le fichier
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    // Nom du fichier
    const collectivite = collectivitesOptions.value.find(c => c.id === selectedCollectiviteId.value)
    const filename = `CA_${collectivite?.code || 'export'}_${selectedAnnee.value}.xlsx`
    a.download = filename

    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    alert('Export Excel réussi!')
  } catch (err) {
    console.error('Erreur lors de l\'export:', err)
    alert('Erreur lors de l\'export Excel. Veuillez réessayer.')
  } finally {
    exporting.value = false
  }
}

function formatMontant(montant: number | null | undefined): string {
  if (montant === null || montant === undefined) return '0,00'
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(montant)
}
</script>
