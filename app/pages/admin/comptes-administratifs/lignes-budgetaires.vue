<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lignes Budgétaires</h1>
        <p class="text-gray-600 dark:text-gray-400">Saisie des données budgétaires par rubrique</p>
      </div>
    </div>

    <!-- Sélection du compte administratif -->
    <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sélectionner un compte administratif</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Année
          </label>
          <select v-model="selectedAnnee" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Sélectionner une année</option>
            <option v-for="annee in anneesDisponibles" :key="annee" :value="annee">
              {{ annee }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type de collectivité
          </label>
          <select v-model="selectedTypeCollectivite" @change="onTypeCollectiviteChange" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Sélectionner le type</option>
            <option value="commune">Commune</option>
            <option value="district">District</option>
            <option value="region">Région</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Collectivité
          </label>
          <select v-model="selectedCollectiviteId" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option :value="null">Sélectionner</option>
            <option v-for="item in collectivitesOptions" :key="item.id" :value="item.id">
              {{ item.code }} - {{ item.nom }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button @click="loadCompteAdministratif" :disabled="!canLoadCompte" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          Charger le compte administratif
        </button>
      </div>
    </div>

    <!-- Affichage du compte administratif chargé -->
    <div v-if="compteAdministratif" class="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-blue-800 dark:text-blue-400">
            Compte administratif : <strong>{{ compteAdministratifLabel }}</strong> - Année {{ compteAdministratif.annee }}
          </p>
          <p class="text-xs text-blue-600 dark:text-blue-500 mt-1">
            Statut : <span class="font-semibold capitalize">{{ compteAdministratif.statut }}</span>
          </p>
        </div>
        <div class="flex gap-2">
          <button @click="activeTab = 'recettes'" :class="activeTab === 'recettes' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'" class="px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors">
            Recettes
          </button>
          <button @click="activeTab = 'depenses'" :class="activeTab === 'depenses' ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'" class="px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors">
            Dépenses
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des lignes budgétaires -->
    <div v-if="compteAdministratif && colonnesAffichees.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ activeTab === 'recettes' ? 'Recettes' : 'Dépenses' }}
        </h2>
        <button @click="saveAllLignes" :disabled="saving" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
          {{ saving ? 'Enregistrement...' : 'Enregistrer tout' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase sticky left-0 bg-gray-50 dark:bg-gray-700/50 z-10">
                Code
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[300px]">
                Intitulé
              </th>
              <th v-for="colonne in colonnesAffichees" :key="colonne.id" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[150px]">
                {{ colonne.nom }}
                <span v-if="colonne.est_calculee" class="text-yellow-500 ml-1" title="Calculée automatiquement">⚙️</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="rubrique in rubriquesAffichees" :key="rubrique.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-4 py-3 text-sm font-mono font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                {{ rubrique.code }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                <div class="flex items-center">
                  <span v-if="rubrique.niveau > 1" class="text-gray-400 dark:text-gray-500 mr-2">
                    {{ '└─'.repeat(rubrique.niveau - 1) }}
                  </span>
                  {{ rubrique.intitule }}
                </div>
              </td>
              <td v-for="colonne in colonnesAffichees" :key="colonne.id" class="px-4 py-3 text-right">
                <input
                  v-if="!colonne.est_calculee"
                  v-model="lignesBudgetairesData[rubrique.id].valeurs[colonne.code]"
                  type="number"
                  step="0.01"
                  @change="onValueChange(rubrique.id)"
                  :placeholder="colonne.type_donnee === 'montant' ? '0.00' : '0'"
                  class="w-full px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <div v-else class="px-2 py-1 text-right font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                  {{ formatValue(lignesBudgetairesData[rubrique.id]?.valeurs[colonne.code], colonne.type_donnee) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div class="text-gray-400 dark:text-gray-600 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-gray-600 dark:text-gray-400">
        Sélectionnez un compte administratif pour commencer la saisie des lignes budgétaires
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegions } from '~/composables/useRegions'
import { useDistricts } from '~/composables/useDistricts'
import { useCommunes } from '~/composables/useCommunes'
import { useColonnesDynamiques } from '~/composables/useColonnesDynamiques'
import { useRubriquesBudgetaires } from '~/composables/useRubriquesBudgetaires'
import type { CompteAdministratif, ColonneDynamique, RubriqueBudgetaire, LigneBudgetaire } from '~/types/comptes-administratifs'

definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()
const { regions, fetchRegions } = useRegions()
const { districts, fetchDistricts } = useDistricts()
const { communes, fetchCommunes } = useCommunes()
const { fetchColonnesRecettes, fetchColonnesDepenses, fetchColonnesCommunes } = useColonnesDynamiques()
const { fetchRubriquesBudgetaires } = useRubriquesBudgetaires()

// État
const selectedAnnee = ref<number | ''>('')
const selectedTypeCollectivite = ref('')
const selectedCollectiviteId = ref<string | null>(null)
const compteAdministratif = ref<CompteAdministratif | null>(null)
const activeTab = ref<'recettes' | 'depenses'>('recettes')
const saving = ref(false)

// Données
const rubriques = ref<RubriqueBudgetaire[]>([])
const colonnesRecettes = ref<ColonneDynamique[]>([])
const colonnesDepenses = ref<ColonneDynamique[]>([])
const colonnesCommunes = ref<ColonneDynamique[]>([])
const lignesBudgetairesData = ref<Record<string, { id?: string, valeurs: Record<string, any> }>>({})

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

const canLoadCompte = computed(() => {
  return selectedAnnee.value && selectedTypeCollectivite.value && selectedCollectiviteId.value
})

const compteAdministratifLabel = computed(() => {
  if (!compteAdministratif.value) return ''
  const collectivite = collectivitesOptions.value.find(c => c.id === selectedCollectiviteId.value)
  return collectivite ? `${selectedTypeCollectivite.value === 'region' ? 'Région' : selectedTypeCollectivite.value === 'district' ? 'District' : 'Commune'} ${collectivite.nom}` : ''
})

const colonnesAffichees = computed(() => {
  const typeColonnes = activeTab.value === 'recettes' ? colonnesRecettes.value : colonnesDepenses.value
  return [...colonnesCommunes.value, ...typeColonnes].sort((a, b) => a.ordre - b.ordre)
})

const rubriquesAffichees = computed(() => {
  const type = activeTab.value === 'recettes' ? 'recette' : 'depense'
  return rubriques.value.filter(r => r.type === type && r.est_active)
})

onMounted(async () => {
  await Promise.all([
    fetchRegions(),
    fetchDistricts(),
    fetchCommunes(),
    fetchRubriquesBudgetaires()
  ])
  rubriques.value = await fetchRubriquesBudgetaires()
  colonnesRecettes.value = await fetchColonnesRecettes()
  colonnesDepenses.value = await fetchColonnesDepenses()
  colonnesCommunes.value = await fetchColonnesCommunes()
})

function onTypeCollectiviteChange() {
  selectedCollectiviteId.value = null
}

async function loadCompteAdministratif() {
  if (!canLoadCompte.value) return

  try {
    // Construire le filtre selon le type de collectivité
    const filters: any = { annee: selectedAnnee.value }
    if (selectedTypeCollectivite.value === 'region') filters.region_id = selectedCollectiviteId.value
    else if (selectedTypeCollectivite.value === 'district') filters.district_id = selectedCollectiviteId.value
    else if (selectedTypeCollectivite.value === 'commune') filters.commune_id = selectedCollectiviteId.value

    const { data, error } = await supabase
      .from('comptes_administratifs')
      .select('*')
      .match(filters)
      .single()

    if (error) throw error

    compteAdministratif.value = data
    await loadLignesBudgetaires()
  } catch (err) {
    console.error('Erreur lors du chargement du compte administratif:', err)
    alert('Aucun compte administratif trouvé pour cette sélection')
  }
}

async function loadLignesBudgetaires() {
  if (!compteAdministratif.value) return

  try {
    const { data, error } = await supabase
      .from('lignes_budgetaires')
      .select('*')
      .eq('compte_administratif_id', compteAdministratif.value.id)

    if (error) throw error

    // Initialiser lignesBudgetairesData avec les données chargées
    lignesBudgetairesData.value = {}

    data?.forEach((ligne: LigneBudgetaire) => {
      lignesBudgetairesData.value[ligne.rubrique_id] = {
        id: ligne.id,
        valeurs: ligne.valeurs || {}
      }
    })

    // Initialiser les rubriques manquantes avec des valeurs vides
    rubriques.value.forEach(rubrique => {
      if (!lignesBudgetairesData.value[rubrique.id]) {
        lignesBudgetairesData.value[rubrique.id] = {
          valeurs: {}
        }
      }
    })
  } catch (err) {
    console.error('Erreur lors du chargement des lignes budgétaires:', err)
  }
}

function onValueChange(rubriqueId: string) {
  // Les valeurs calculées seront recalculées automatiquement par le trigger SQL lors de la sauvegarde
}

async function saveAllLignes() {
  if (!compteAdministratif.value) return

  saving.value = true
  try {
    const lignesToSave: any[] = []

    Object.entries(lignesBudgetairesData.value).forEach(([rubriqueId, ligne]) => {
      // Ne sauvegarder que si des valeurs ont été saisies
      const hasValues = Object.values(ligne.valeurs).some(v => v !== null && v !== undefined && v !== '')

      if (hasValues) {
        const ligneData: any = {
          compte_administratif_id: compteAdministratif.value!.id,
          rubrique_id: rubriqueId,
          valeurs: ligne.valeurs
        }

        if (ligne.id) {
          ligneData.id = ligne.id
        }

        lignesToSave.push(ligneData)
      }
    })

    if (lignesToSave.length === 0) {
      alert('Aucune ligne à enregistrer')
      return
    }

    // Utiliser upsert pour créer ou mettre à jour
    const { error } = await supabase
      .from('lignes_budgetaires')
      .upsert(lignesToSave, {
        onConflict: 'compte_administratif_id,rubrique_id'
      })

    if (error) throw error

    alert('Lignes budgétaires enregistrées avec succès !')
    await loadLignesBudgetaires() // Recharger pour obtenir les valeurs calculées
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement des lignes budgétaires')
  } finally {
    saving.value = false
  }
}

function formatValue(value: any, type: string): string {
  if (value === null || value === undefined || value === '') return '-'

  if (type === 'montant') {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  } else if (type === 'pourcentage') {
    return `${value}%`
  }

  return String(value)
}
</script>
