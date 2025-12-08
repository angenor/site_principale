// ============================================================================
// Types pour le Plan Comptable
// Structure hiérarchique des rubriques budgétaires
// ============================================================================

export type TypeMouvement = 'recette' | 'depense'
export type SectionBudgetaire = 'fonctionnement' | 'investissement'

export interface PlanComptable {
  id: number
  code: string
  intitule: string
  niveau: 1 | 2 | 3
  type_mouvement: TypeMouvement
  section: SectionBudgetaire
  parent_code: string | null
  est_sommable: boolean
  ordre_affichage: number | null
  actif: boolean
}

export interface PlanComptableCreate {
  code: string
  intitule: string
  niveau: 1 | 2 | 3
  type_mouvement: TypeMouvement
  section: SectionBudgetaire
  parent_code?: string | null
  est_sommable?: boolean
  ordre_affichage?: number | null
  actif?: boolean
}

export interface PlanComptableUpdate {
  intitule?: string
  parent_code?: string | null
  est_sommable?: boolean
  ordre_affichage?: number | null
  actif?: boolean
}

export interface PlanComptableTreeNode extends PlanComptable {
  children: PlanComptableTreeNode[]
}
