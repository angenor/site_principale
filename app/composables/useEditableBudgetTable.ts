/**
 * Composable pour gérer l'état d'édition du tableau budgétaire
 * Gère le mode de sauvegarde (auto/manuel), les modifications en attente,
 * et les opérations CRUD sur les recettes et dépenses
 */

import type {
  DataType,
  PendingChange,
  CellState,
  DonneesMapping,
  DonneesRecetteUpdate,
  DonneesDepenseUpdate,
} from '~/types/donnees'
import { useDonneesService } from '~/services/donnees.service'

const STORAGE_KEY = 'budget-table-save-mode'

// Colonnes éditables acceptées par l'API backend
// Les autres colonnes (previsions_definitives, reste_a_recouvrer, taux_*, etc.) sont calculées
const EDITABLE_RECETTE_COLUMNS = new Set([
  'budget_primitif',
  'budget_additionnel',
  'modifications',
  'or_admis',
  'recouvrement',
])

const EDITABLE_DEPENSE_COLUMNS = new Set([
  'budget_primitif',
  'budget_additionnel',
  'modifications',
  'engagement',
  'mandat_admis',
  'paiement',
])

export interface UseEditableBudgetTableOptions {
  commune_id: Ref<number | undefined>
  exercice_id: Ref<number | undefined>
  onRefresh: () => Promise<void>
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export const useEditableBudgetTable = (options: UseEditableBudgetTableOptions) => {
  const { commune_id, exercice_id, onRefresh, onSuccess, onError } = options
  const donneesService = useDonneesService()

  // ============================================================================
  // STATE
  // ============================================================================

  // Mode de sauvegarde: true = auto, false = manuel
  const isAutoSave = ref(true)

  // Modifications en attente (mode manuel)
  // Clé: `${compte_code}:${columnKey}`
  const pendingChanges = ref<Map<string, PendingChange>>(new Map())

  // État des cellules (saving, dirty, error)
  // Clé: `${compte_code}:${columnKey}`
  const cellStates = ref<Map<string, CellState>>(new Map())

  // Mapping compte_code -> id pour les opérations CRUD
  const donneesMapping = ref<DonneesMapping>({
    recettes: new Map(),
    depenses: new Map(),
  })

  // Flag de chargement global
  const isSaving = ref(false)
  const isLoading = ref(false)

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const hasUnsavedChanges = computed(() => pendingChanges.value.size > 0)

  const pendingCount = computed(() => pendingChanges.value.size)

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialise le composable: charge le mode de sauvegarde et le mapping des données
   */
  const initialize = async () => {
    // Charger le mode de sauvegarde depuis localStorage
    if (import.meta.client) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        isAutoSave.value = saved === 'auto'
      }
    }

    // Charger le mapping des données si commune et exercice sont définis
    await loadMapping()
  }

  /**
   * Charge le mapping compte_code -> id
   */
  const loadMapping = async () => {
    if (!commune_id.value || !exercice_id.value) return

    isLoading.value = true
    try {
      donneesMapping.value = await donneesService.loadDonneesMapping(
        commune_id.value,
        exercice_id.value
      )
    } catch (error) {
      console.error('Erreur lors du chargement du mapping:', error)
      onError?.('Erreur lors du chargement des données')
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // SAVE MODE
  // ============================================================================

  /**
   * Bascule le mode de sauvegarde
   */
  const toggleSaveMode = () => {
    isAutoSave.value = !isAutoSave.value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, isAutoSave.value ? 'auto' : 'manual')
    }
  }

  /**
   * Définit le mode de sauvegarde
   */
  const setSaveMode = (auto: boolean) => {
    isAutoSave.value = auto
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, auto ? 'auto' : 'manual')
    }
  }

  // ============================================================================
  // CELL STATE MANAGEMENT
  // ============================================================================

  const getCellKey = (compteCode: string, columnKey: string): string => {
    return `${compteCode}:${columnKey}`
  }

  const getCellState = (compteCode: string, columnKey: string): CellState => {
    const key = getCellKey(compteCode, columnKey)
    return cellStates.value.get(key) || {
      isSaving: false,
      isDirty: false,
      hasError: false,
    }
  }

  const setCellState = (compteCode: string, columnKey: string, state: Partial<CellState>) => {
    const key = getCellKey(compteCode, columnKey)
    const current = getCellState(compteCode, columnKey)
    cellStates.value.set(key, { ...current, ...state })
  }

  const clearCellState = (compteCode: string, columnKey: string) => {
    const key = getCellKey(compteCode, columnKey)
    cellStates.value.delete(key)
  }

  // ============================================================================
  // CELL UPDATE
  // ============================================================================

  /**
   * Vérifie si une colonne est éditable pour un type de données
   */
  const isColumnEditable = (columnKey: string, dataType: DataType): boolean => {
    const allowedColumns = dataType === 'recette'
      ? EDITABLE_RECETTE_COLUMNS
      : EDITABLE_DEPENSE_COLUMNS
    return allowedColumns.has(columnKey)
  }

  /**
   * Gère la modification d'une cellule
   * En mode auto: sauvegarde immédiatement
   * En mode manuel: ajoute aux modifications en attente
   */
  const updateCell = async (
    compteCode: string,
    columnKey: string,
    newValue: number,
    originalValue: number,
    dataType: DataType
  ) => {
    // Ignorer si pas de changement
    if (newValue === originalValue) return

    // Vérifier que la colonne est éditable (pas un champ calculé)
    if (!isColumnEditable(columnKey, dataType)) {
      onError?.(`La colonne "${columnKey}" est calculée automatiquement et ne peut pas être modifiée directement`)
      return
    }

    if (isAutoSave.value) {
      await saveCell(compteCode, columnKey, newValue, dataType)
    } else {
      queueChange(compteCode, columnKey, newValue, originalValue, dataType)
    }
  }

  /**
   * Sauvegarde immédiate d'une cellule (mode auto)
   */
  const saveCell = async (
    compteCode: string,
    columnKey: string,
    value: number,
    dataType: DataType
  ) => {
    setCellState(compteCode, columnKey, { isSaving: true, hasError: false })

    try {
      const mapping = dataType === 'recette'
        ? donneesMapping.value.recettes
        : donneesMapping.value.depenses
      const existingId = mapping.get(compteCode)

      if (dataType === 'recette') {
        const data: DonneesRecetteUpdate = { [columnKey]: value }
        const result = await donneesService.upsertRecette(
          commune_id.value!,
          exercice_id.value!,
          compteCode,
          data,
          existingId
        )
        // Mettre à jour le mapping si c'était une création
        if (!existingId) {
          donneesMapping.value.recettes.set(compteCode, result.id)
        }
      } else {
        const data: DonneesDepenseUpdate = { [columnKey]: value }
        const result = await donneesService.upsertDepense(
          commune_id.value!,
          exercice_id.value!,
          compteCode,
          data,
          existingId
        )
        if (!existingId) {
          donneesMapping.value.depenses.set(compteCode, result.id)
        }
      }

      // Rafraîchir les données
      await onRefresh()

      setCellState(compteCode, columnKey, { isSaving: false })

      // Effacer l'état après un court délai
      setTimeout(() => clearCellState(compteCode, columnKey), 1500)

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      setCellState(compteCode, columnKey, {
        isSaving: false,
        hasError: true,
        errorMessage: error.message || 'Erreur de sauvegarde',
      })
      onError?.('Erreur lors de la sauvegarde')
    }
  }

  /**
   * Ajoute une modification à la queue (mode manuel)
   */
  const queueChange = (
    compteCode: string,
    columnKey: string,
    newValue: number,
    originalValue: number,
    dataType: DataType
  ) => {
    const key = getCellKey(compteCode, columnKey)

    pendingChanges.value.set(key, {
      rowCode: compteCode,
      dataType,
      columnKey,
      newValue,
      originalValue,
      timestamp: Date.now(),
    })

    setCellState(compteCode, columnKey, { isDirty: true })
  }

  // ============================================================================
  // BATCH OPERATIONS (MODE MANUEL)
  // ============================================================================

  /**
   * Sauvegarde toutes les modifications en attente
   */
  const saveAllPending = async () => {
    if (pendingChanges.value.size === 0) return

    isSaving.value = true
    const changes = Array.from(pendingChanges.value.values())
    const errors: string[] = []

    // Grouper les changements par ligne
    const changesByRow = new Map<string, PendingChange[]>()
    changes.forEach((change) => {
      const key = `${change.dataType}:${change.rowCode}`
      if (!changesByRow.has(key)) {
        changesByRow.set(key, [])
      }
      changesByRow.get(key)!.push(change)
    })

    // Sauvegarder chaque ligne
    for (const [key, rowChanges] of changesByRow) {
      const [dataType, compteCode] = key.split(':') as [DataType, string]

      // Marquer toutes les cellules comme en cours de sauvegarde
      rowChanges.forEach((c) => {
        setCellState(c.rowCode, c.columnKey, { isSaving: true })
      })

      try {
        // Construire l'objet de mise à jour avec toutes les colonnes modifiées
        const updateData: Record<string, number> = {}
        rowChanges.forEach((c) => {
          updateData[c.columnKey] = c.newValue
        })

        const mapping = dataType === 'recette'
          ? donneesMapping.value.recettes
          : donneesMapping.value.depenses
        const existingId = mapping.get(compteCode)

        if (dataType === 'recette') {
          const result = await donneesService.upsertRecette(
            commune_id.value!,
            exercice_id.value!,
            compteCode,
            updateData as DonneesRecetteUpdate,
            existingId
          )
          if (!existingId) {
            donneesMapping.value.recettes.set(compteCode, result.id)
          }
        } else {
          const result = await donneesService.upsertDepense(
            commune_id.value!,
            exercice_id.value!,
            compteCode,
            updateData as DonneesDepenseUpdate,
            existingId
          )
          if (!existingId) {
            donneesMapping.value.depenses.set(compteCode, result.id)
          }
        }

        // Succès: retirer de la queue et nettoyer l'état
        rowChanges.forEach((c) => {
          const cellKey = getCellKey(c.rowCode, c.columnKey)
          pendingChanges.value.delete(cellKey)
          clearCellState(c.rowCode, c.columnKey)
        })

      } catch (error: any) {
        console.error(`Erreur pour ${compteCode}:`, error)
        errors.push(`${compteCode}: ${error.message || 'Erreur'}`)

        // Marquer les cellules en erreur
        rowChanges.forEach((c) => {
          setCellState(c.rowCode, c.columnKey, {
            isSaving: false,
            hasError: true,
            errorMessage: error.message,
          })
        })
      }
    }

    // Rafraîchir les données
    await onRefresh()

    isSaving.value = false

    if (errors.length > 0) {
      onError?.(`${errors.length} erreur(s) lors de la sauvegarde`)
    } else {
      onSuccess?.('Toutes les modifications ont été enregistrées')
    }
  }

  /**
   * Annule toutes les modifications en attente
   */
  const discardAllPending = () => {
    // Nettoyer l'état des cellules
    pendingChanges.value.forEach((change) => {
      clearCellState(change.rowCode, change.columnKey)
    })

    // Vider la queue
    pendingChanges.value.clear()

    onSuccess?.('Modifications annulées')
  }

  // ============================================================================
  // ROW OPERATIONS
  // ============================================================================

  /**
   * Ajoute une nouvelle ligne (crée une entrée avec des valeurs à 0)
   */
  const addRow = async (compteCode: string, dataType: DataType) => {
    if (!commune_id.value || !exercice_id.value) return

    isSaving.value = true
    try {
      if (dataType === 'recette') {
        const result = await donneesService.createRecette({
          commune_id: commune_id.value,
          exercice_id: exercice_id.value,
          compte_code: compteCode,
        })
        donneesMapping.value.recettes.set(compteCode, result.id)
      } else {
        const result = await donneesService.createDepense({
          commune_id: commune_id.value,
          exercice_id: exercice_id.value,
          compte_code: compteCode,
        })
        donneesMapping.value.depenses.set(compteCode, result.id)
      }

      await onRefresh()
      onSuccess?.('Ligne ajoutée avec succès')
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error)
      onError?.(error.message || 'Erreur lors de l\'ajout de la ligne')
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Supprime une ligne existante
   */
  const deleteRow = async (compteCode: string, dataType: DataType) => {
    const mapping = dataType === 'recette'
      ? donneesMapping.value.recettes
      : donneesMapping.value.depenses
    const id = mapping.get(compteCode)

    if (!id) {
      onError?.('Cette ligne n\'existe pas encore dans la base de données')
      return
    }

    isSaving.value = true
    try {
      if (dataType === 'recette') {
        await donneesService.deleteRecette(id)
        donneesMapping.value.recettes.delete(compteCode)
      } else {
        await donneesService.deleteDepense(id)
        donneesMapping.value.depenses.delete(compteCode)
      }

      // Supprimer les modifications en attente pour cette ligne
      const keysToDelete: string[] = []
      pendingChanges.value.forEach((change, key) => {
        if (change.rowCode === compteCode && change.dataType === dataType) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach((key) => pendingChanges.value.delete(key))

      await onRefresh()
      onSuccess?.('Ligne supprimée avec succès')
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      onError?.(error.message || 'Erreur lors de la suppression')
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Vérifie si une ligne existe dans la base de données
   */
  const rowExists = (compteCode: string, dataType: DataType): boolean => {
    const mapping = dataType === 'recette'
      ? donneesMapping.value.recettes
      : donneesMapping.value.depenses
    return mapping.has(compteCode)
  }

  // ============================================================================
  // WATCHERS
  // ============================================================================

  // Recharger le mapping quand commune_id ou exercice_id change
  watch([commune_id, exercice_id], async () => {
    if (commune_id.value && exercice_id.value) {
      await loadMapping()
    }
  })

  // Computed writable pour isAutoSave (permet v-model)
  const isAutoSaveModel = computed({
    get: () => isAutoSave.value,
    set: (value: boolean) => setSaveMode(value),
  })

  return {
    // State
    isAutoSave: isAutoSaveModel,
    pendingChanges: readonly(pendingChanges),
    cellStates: readonly(cellStates),
    isSaving: readonly(isSaving),
    isLoading: readonly(isLoading),

    // Computed
    hasUnsavedChanges,
    pendingCount,

    // Methods
    initialize,
    loadMapping,
    toggleSaveMode,
    setSaveMode,
    getCellState,
    updateCell,
    saveAllPending,
    discardAllPending,
    addRow,
    deleteRow,
    rowExists,
    isColumnEditable,
  }
}
