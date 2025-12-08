<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadCompte"
    />

    <!-- Content -->
    <template v-else-if="compte">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
          <NuxtLink
            to="/admin/comptes-administratifs"
            class="hover:text-[var(--color-primary)] transition-colors"
          >
            Comptes administratifs
          </NuxtLink>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3" />
          <span class="text-[var(--text-secondary)]">{{ collectiviteName }}</span>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {{ collectiviteName }}
            </h1>
            <p class="mt-1 text-[var(--text-secondary)]">
              Compte administratif - Exercice {{ compte.annee }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <UiBadge :variant="getStatutVariant(compte.statut)" size="lg">
              {{ getStatutLabel(compte.statut) }}
            </UiBadge>

            <!-- Save Mode Toggle -->
            <AdminComptesSaveModeToggle v-model="editableBudget.isAutoSave.value" />

            <div class="flex items-center gap-2">
              <UiButton
                v-if="compte.statut === 'brouillon'"
                variant="success"
                size="sm"
                :icon="['fas', 'check']"
                :loading="isValidating"
                @click="handleValider"
              >
                Valider
              </UiButton>
              <UiButton
                v-if="compte.statut === 'valide'"
                variant="primary"
                size="sm"
                :icon="['fas', 'globe']"
                :loading="isPublishing"
                @click="handlePublier"
              >
                Publier
              </UiButton>
              <UiButton
                variant="outline"
                size="sm"
                :icon="['fas', 'file-excel']"
                :loading="isExporting"
                @click="handleExport"
              >
                Exporter Excel
              </UiButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary cards -->
      <AdminComptesBudgetSummaryCards
        :recettes="budgetData.totaux.value.recettes"
        :depenses="budgetData.totaux.value.depenses"
        :solde="budgetData.totaux.value.solde"
        :lignes-count="lignes.length"
      />

      <!-- Tableaux budgétaires stylisés -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
        <div class="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <!-- Sélecteur de feuille -->
          <AdminComptesSheetSelector v-model="activeSheet" />

          <!-- Tableau RECETTES -->
          <div v-if="activeSheet === 'RECETTE'" class="space-y-8">
            <!-- RECETTES DE FONCTIONNEMENT -->
            <AdminComptesBudgetSectionTable
              title="RECETTES DE FONCTIONNEMENT"
              :subtitle="`${collectiviteName} - Exercice ${compte?.annee}`"
              icon="arrow-trend-up"
              color-theme="green"
              :lignes="budgetData.previewRecettesFonctionnement.value"
              :colonnes="budgetData.colonnesRecettes.value"
              :totaux="budgetData.totauxRecettes.value.fonctionnement"
              total-label="TOTAL RECETTES FONCTIONNEMENT"
              :pending-changes="editableBudget.pendingChanges.value"
              @add="openAddRowModal('recette', 'fonctionnement')"
              @delete="(ligne) => openDeleteRowModal(ligne, 'recette')"
              @manage-columns="navigateToColonnes"
              @cell-change="(ligne, col, event) => handleCellBlur(ligne, col, event, 'recette')"
            />

            <!-- RECETTES D'INVESTISSEMENT -->
            <AdminComptesBudgetSectionTable
              title="RECETTES D'INVESTISSEMENT"
              :subtitle="`${collectiviteName} - Exercice ${compte?.annee}`"
              icon="landmark"
              color-theme="teal"
              :lignes="budgetData.previewRecettesInvestissement.value"
              :colonnes="budgetData.colonnesRecettes.value"
              :totaux="budgetData.totauxRecettes.value.investissement"
              total-label="TOTAL RECETTES INVESTISSEMENT"
              :pending-changes="editableBudget.pendingChanges.value"
              @add="openAddRowModal('recette', 'investissement')"
              @delete="(ligne) => openDeleteRowModal(ligne, 'recette')"
              @manage-columns="navigateToColonnes"
              @cell-change="(ligne, col, event) => handleCellBlur(ligne, col, event, 'recette')"
            />

            <!-- TOTAL GÉNÉRAL RECETTES -->
            <AdminComptesTotalGeneralCard
              title="TOTAL GÉNÉRAL RECETTES"
              :main-value="budgetData.totauxRecettes.value.general.recouvrement"
              color-theme="green"
              :details="[
                { label: 'Budget Primitif', value: budgetData.totauxRecettes.value.general.budget_primitif },
                { label: 'Prévisions Définitives', value: budgetData.totauxRecettes.value.general.previsions_definitives },
                { label: 'Reste à Recouvrer', value: budgetData.totauxRecettes.value.general.reste_a_recouvrer },
                { label: 'Taux d\'Exécution', value: budgetData.totauxRecettes.value.general.taux_execution_recette, isPercent: true }
              ]"
            />
          </div>

          <!-- Tableau DÉPENSES -->
          <div v-else-if="activeSheet === 'DEPENSES'" class="space-y-8">
            <!-- DÉPENSES DE FONCTIONNEMENT -->
            <AdminComptesBudgetSectionTable
              title="DÉPENSES DE FONCTIONNEMENT"
              :subtitle="`${collectiviteName} - Exercice ${compte?.annee}`"
              icon="arrow-trend-down"
              color-theme="red"
              :lignes="budgetData.previewDepensesFonctionnement.value"
              :colonnes="budgetData.colonnesDepenses.value"
              :totaux="budgetData.totauxDepenses.value.fonctionnement"
              total-label="TOTAL DÉPENSES FONCTIONNEMENT"
              :pending-changes="editableBudget.pendingChanges.value"
              @add="openAddRowModal('depense', 'fonctionnement')"
              @delete="(ligne) => openDeleteRowModal(ligne, 'depense')"
              @manage-columns="navigateToColonnes"
              @cell-change="(ligne, col, event) => handleCellBlur(ligne, col, event, 'depense')"
            />

            <!-- DÉPENSES D'INVESTISSEMENT -->
            <AdminComptesBudgetSectionTable
              title="DÉPENSES D'INVESTISSEMENT"
              :subtitle="`${collectiviteName} - Exercice ${compte?.annee}`"
              icon="building"
              color-theme="orange"
              :lignes="budgetData.previewDepensesInvestissement.value"
              :colonnes="budgetData.colonnesDepenses.value"
              :totaux="budgetData.totauxDepenses.value.investissement"
              total-label="TOTAL DÉPENSES INVESTISSEMENT"
              :pending-changes="editableBudget.pendingChanges.value"
              @add="openAddRowModal('depense', 'investissement')"
              @delete="(ligne) => openDeleteRowModal(ligne, 'depense')"
              @manage-columns="navigateToColonnes"
              @cell-change="(ligne, col, event) => handleCellBlur(ligne, col, event, 'depense')"
            />

            <!-- TOTAL GÉNÉRAL DÉPENSES -->
            <AdminComptesTotalGeneralCard
              title="TOTAL GÉNÉRAL DÉPENSES"
              :main-value="budgetData.totauxDepenses.value.general.paiement"
              color-theme="red"
              :details="[
                { label: 'Budget Primitif', value: budgetData.totauxDepenses.value.general.budget_primitif },
                { label: 'Prévisions Définitives', value: budgetData.totauxDepenses.value.general.previsions_definitives },
                { label: 'Reste à Payer', value: budgetData.totauxDepenses.value.general.reste_a_payer },
                { label: 'Taux d\'Exécution', value: budgetData.totauxDepenses.value.general.taux_execution_depense, isPercent: true }
              ]"
            />
          </div>

          <!-- Tableau ÉQUILIBRE -->
          <AdminComptesEquilibreSection
            v-else
            :collectivite-name="collectiviteName"
            :exercice-annee="compte?.annee || 0"
            :equilibre-fonctionnement="budgetData.previewEquilibreFonctionnement.value"
            :equilibre-investissement="budgetData.previewEquilibreInvestissement.value"
            :totaux="budgetData.totauxEquilibre.value"
            :get-colonne-label="budgetData.getColonneLabel"
          />

          <!-- Export Excel section -->
          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">Exporter les données</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Téléchargez le compte administratif complet au format Excel
                </p>
              </div>
              <UiButton
                variant="primary"
                :icon="['fas', 'file-excel']"
                :loading="isExporting"
                @click="handleExport"
              >
                Télécharger Excel
              </UiButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes section -->
      <div
        v-if="compte.notes"
        class="mt-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4"
      >
        <h3 class="font-medium text-[var(--text-primary)] mb-2">Notes</h3>
        <p class="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{{ compte.notes }}</p>
      </div>

      <!-- Metadata -->
      <div class="mt-6 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Créé le {{ formatDate(compte.created_at) }}</span>
        <span>Dernière modification le {{ formatDate(compte.updated_at) }}</span>
      </div>

      <!-- Manual Save Bar (sticky bottom) -->
      <AdminComptesManualSaveBar
        v-if="!editableBudget.isAutoSave.value && editableBudget.hasUnsavedChanges.value"
        :pending-count="editableBudget.pendingChanges.value.size"
        :is-saving="editableBudget.isSaving.value"
        @save="editableBudget.saveAllPending()"
        @discard="editableBudget.discardAllPending()"
      />

      <!-- Add Row Modal -->
      <AdminComptesAddRowModal
        v-model="showAddRowModal"
        :initial-data-type="addRowInitialType"
        :initial-section="addRowInitialSection"
        :existing-codes="addRowInitialType === 'recette' ? budgetData.existingRecetteCodes.value : budgetData.existingDepenseCodes.value"
        :is-loading="editableBudget.isSaving.value"
        @add="handleAddRow"
      />

      <!-- Delete Row Confirm Modal -->
      <AdminComptesDeleteRowConfirmModal
        v-model="showDeleteRowModal"
        :row="deleteRowTarget"
        :data-type="deleteRowTarget?.dataType"
        :is-loading="editableBudget.isSaving.value"
        @confirm="handleDeleteRow"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { CompteAdministratif, LigneBudgetaire, ColonneDynamique } from '~/types/comptes-administratifs'
import type { DataType } from '~/types/donnees'
import { useEditableBudgetTable } from '~/composables/useEditableBudgetTable'
import { useBudgetTableData, type TableauCompletAPI } from '~/composables/useBudgetTableData'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const toast = useAppToast()
const comptesService = useComptesAdministratifsService()
const config = useRuntimeConfig()

// Export Excel
const exportComposable = useCompteAdministratifExport()

// ============================================================================
// STATE
// ============================================================================

const compte = ref<CompteAdministratif | null>(null)
const lignes = ref<LigneBudgetaire[]>([])
const colonnes = ref<ColonneDynamique[]>([])
const isLoading = ref(true)
const isLoadingLignes = ref(false)
const isLoadingTableau = ref(false)
const error = ref<string | null>(null)
const activeSheet = ref<'RECETTE' | 'DEPENSES' | 'EQUILIBRE'>('RECETTE')

// Données des tableaux (API)
const tableauComplet = ref<TableauCompletAPI | null>(null)

// Action states
const isValidating = ref(false)
const isPublishing = ref(false)
const isExporting = ref(false)

// Editable table state
const commune_id = computed(() => compte.value?.commune_id || compte.value?.commune?.id)
const exercice_id = computed(() => compte.value?.exercice_id)

const editableBudget = useEditableBudgetTable({
  commune_id,
  exercice_id,
  onRefresh: async () => {
    await loadTableauComplet()
  },
  onSuccess: (message) => toast.success(message),
  onError: (message) => toast.error(message),
})

// Budget data composable
const budgetData = useBudgetTableData({
  tableauComplet,
  colonnes,
})

// Modal states
const showAddRowModal = ref(false)
const showDeleteRowModal = ref(false)
const addRowInitialType = ref<DataType>('recette')
const addRowInitialSection = ref<'fonctionnement' | 'investissement'>('fonctionnement')
const deleteRowTarget = ref<{ code: string; intitule: string; dataType: DataType } | null>(null)

// ============================================================================
// COMPUTED
// ============================================================================

const compteId = computed(() => route.params.id as string)

const collectiviteName = computed(() => {
  if (!compte.value) return ''
  return compte.value.commune?.nom || compte.value.district?.nom || compte.value.region?.nom || 'N/A'
})

// ============================================================================
// METHODS
// ============================================================================

const getStatutVariant = (statut: string): 'warning' | 'success' | 'info' => {
  const variants: Record<string, 'warning' | 'success' | 'info'> = {
    brouillon: 'warning',
    valide: 'success',
    publie: 'info',
  }
  return variants[statut] || 'warning'
}

const getStatutLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    valide: 'Validé',
    publie: 'Publié',
  }
  return labels[statut] || statut
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============================================================================
// DATA LOADING
// ============================================================================

const loadCompte = async () => {
  isLoading.value = true
  error.value = null

  try {
    compte.value = await comptesService.getCompte(compteId.value)
    await Promise.all([loadLignes(), loadColonnes(), loadTableauComplet()])
  } catch (err: any) {
    console.error('Erreur lors du chargement du compte:', err)
    error.value = err.message || 'Erreur lors du chargement du compte administratif'
    toast.error(error.value)
  } finally {
    isLoading.value = false
  }
}

const loadTableauComplet = async () => {
  if (!compte.value?.commune_id || !compte.value?.annee) return

  isLoadingTableau.value = true
  try {
    const apiBaseUrl = config.public.apiBaseUrl
    const response = await $fetch<TableauCompletAPI>(`${apiBaseUrl}/api/v1/tableaux`, {
      params: {
        commune_id: compte.value.commune_id,
        exercice_annee: compte.value.annee,
      },
    })
    tableauComplet.value = response

    // Initialiser le mapping des IDs pour l'édition
    await editableBudget.initialize()
  } catch (err: any) {
    console.error('Erreur lors du chargement du tableau:', err.message)
    toast.error('Erreur lors du chargement des données financières')
  } finally {
    isLoadingTableau.value = false
  }
}

const loadLignes = async () => {
  isLoadingLignes.value = true
  try {
    lignes.value = await comptesService.getLignes(compteId.value)
  } catch (err) {
    console.error('Erreur lors du chargement des lignes:', err)
    toast.error('Erreur lors du chargement des lignes budgétaires')
  } finally {
    isLoadingLignes.value = false
  }
}

const loadColonnes = async () => {
  try {
    colonnes.value = await comptesService.getColonnes()
  } catch (err) {
    console.error('Erreur lors du chargement des colonnes:', err)
    toast.error('Erreur lors du chargement des colonnes')
  }
}

// ============================================================================
// ACTIONS
// ============================================================================

const handleValider = async () => {
  if (!compte.value) return
  isValidating.value = true
  try {
    compte.value = await comptesService.validerCompte(compteId.value)
    toast.success('Compte administratif validé avec succès')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de la validation')
  } finally {
    isValidating.value = false
  }
}

const handlePublier = async () => {
  if (!compte.value) return
  isPublishing.value = true
  try {
    compte.value = await comptesService.publierCompte(compteId.value)
    toast.success('Compte administratif publié avec succès')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de la publication')
  } finally {
    isPublishing.value = false
  }
}

const handleExport = async () => {
  if (!compte.value || !tableauComplet.value) return
  isExporting.value = true
  try {
    await exportComposable.exportToExcel(compte.value, tableauComplet.value)
    toast.success('Export Excel généré avec succès')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de l\'export')
  } finally {
    isExporting.value = false
  }
}

// ============================================================================
// EDITABLE TABLE METHODS
// ============================================================================

const handleCellBlur = async (
  ligne: Record<string, any>,
  columnKey: string,
  event: FocusEvent,
  dataType: DataType
) => {
  const input = event.target as HTMLInputElement
  const newValue = parseFloat(input.value.replace(/[^\d.-]/g, '')) || 0
  const oldValue = ligne[columnKey] || 0

  if (newValue !== oldValue) {
    await editableBudget.updateCell(ligne.code, columnKey, newValue, oldValue, dataType)
  }
}

const openAddRowModal = (dataType: DataType, section: 'fonctionnement' | 'investissement') => {
  addRowInitialType.value = dataType
  addRowInitialSection.value = section
  showAddRowModal.value = true
}

const handleAddRow = async (compteCode: string, dataType: DataType) => {
  showAddRowModal.value = false
  await editableBudget.addRow(compteCode, dataType)
}

const openDeleteRowModal = (ligne: Record<string, any>, dataType: DataType) => {
  deleteRowTarget.value = {
    code: ligne.code,
    intitule: ligne.intitule,
    dataType,
  }
  showDeleteRowModal.value = true
}

const handleDeleteRow = async () => {
  if (!deleteRowTarget.value) return
  const { code, dataType } = deleteRowTarget.value
  showDeleteRowModal.value = false
  deleteRowTarget.value = null
  await editableBudget.deleteRow(code, dataType)
}

const navigateToColonnes = () => {
  navigateTo('/admin/colonnes')
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadCompte()
})
</script>
