/**
 * Types pour les données financières (recettes et dépenses)
 * Utilisés pour l'édition interactive du tableau budgétaire
 */

// ============================================================================
// RECETTES
// ============================================================================

export interface DonneesRecette {
  id: number
  commune_id: number
  exercice_id: number
  compte_code: string
  budget_primitif: number
  budget_additionnel: number
  modifications: number
  previsions_definitives: number
  or_admis: number
  recouvrement: number
  reste_a_recouvrer: number
  commentaire?: string | null
  valide: boolean
  valide_par?: number | null
  valide_le?: string | null
  taux_execution?: number | null
  created_at: string
  updated_at: string
}

export interface DonneesRecetteCreate {
  commune_id: number
  exercice_id: number
  compte_code: string
  budget_primitif?: number
  budget_additionnel?: number
  modifications?: number
  or_admis?: number
  recouvrement?: number
  commentaire?: string
}

export interface DonneesRecetteUpdate {
  budget_primitif?: number
  budget_additionnel?: number
  modifications?: number
  or_admis?: number
  recouvrement?: number
  commentaire?: string
}

// ============================================================================
// DEPENSES
// ============================================================================

export interface DonneesDepense {
  id: number
  commune_id: number
  exercice_id: number
  compte_code: string
  budget_primitif: number
  budget_additionnel: number
  modifications: number
  previsions_definitives: number
  engagement: number
  mandat_admis: number
  paiement: number
  reste_a_payer: number
  programme?: string | null
  commentaire?: string | null
  valide: boolean
  valide_par?: number | null
  valide_le?: string | null
  taux_execution?: number | null
  created_at: string
  updated_at: string
}

export interface DonneesDepenseCreate {
  commune_id: number
  exercice_id: number
  compte_code: string
  budget_primitif?: number
  budget_additionnel?: number
  modifications?: number
  engagement?: number
  mandat_admis?: number
  paiement?: number
  programme?: string
  commentaire?: string
}

export interface DonneesDepenseUpdate {
  budget_primitif?: number
  budget_additionnel?: number
  modifications?: number
  engagement?: number
  mandat_admis?: number
  paiement?: number
  programme?: string
  commentaire?: string
}

// ============================================================================
// EDITION STATE
// ============================================================================

export type DataType = 'recette' | 'depense'

export interface PendingChange {
  rowCode: string
  dataType: DataType
  columnKey: string
  newValue: number
  originalValue: number
  timestamp: number
}

export interface CellState {
  isSaving: boolean
  isDirty: boolean
  hasError: boolean
  errorMessage?: string
}

// Mapping compte_code -> donnees id pour les opérations CRUD
export interface DonneesMapping {
  recettes: Map<string, number> // compte_code -> id
  depenses: Map<string, number> // compte_code -> id
}
