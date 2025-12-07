/**
 * Service pour la gestion des comptes administratifs
 * Comptes, Rubriques, Lignes budgétaires
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'
import type {
  CompteAdministratif,
  CompteAdministratifFormData,
  CompteAdministratifWithStats,
  RubriqueBudgetaire,
  RubriqueBudgetaireFormData,
  RubriqueBudgetaireHierarchique,
  CategorieRubrique,
  CategorieRubriqueFormData,
  ColonneDynamique,
  ColonneDynamiqueFormData,
  LigneBudgetaire,
  LigneBudgetaireFormData,
} from '~/types/comptes-administratifs'

const BASE_PATH = '/api/v1/admin/comptes-administratifs'
const RUBRIQUES_PATH = '/api/v1/admin/rubriques'
const CATEGORIES_PATH = '/api/v1/admin/categories'
const COLONNES_PATH = '/api/v1/admin/colonnes'

export const useComptesAdministratifsService = () => {
  const api = useApi()

  // ============================================================================
  // COMPTES ADMINISTRATIFS
  // ============================================================================

  const getComptes = async (
    params?: PaginationParams & {
      commune_id?: string
      district_id?: string
      region_id?: string
      annee?: number
      statut?: 'brouillon' | 'valide' | 'publie' | 'archive'
      search?: string
    }
  ): Promise<PaginatedResponse<CompteAdministratifWithStats>> => {
    return api.get<PaginatedResponse<CompteAdministratifWithStats>>(BASE_PATH, params)
  }

  const getCompte = async (id: string): Promise<CompteAdministratif> => {
    return api.get<CompteAdministratif>(`${BASE_PATH}/${id}`)
  }

  const createCompte = async (data: CompteAdministratifFormData): Promise<CompteAdministratif> => {
    return api.post<CompteAdministratif>(BASE_PATH, data)
  }

  const updateCompte = async (
    id: string,
    data: Partial<CompteAdministratifFormData>
  ): Promise<CompteAdministratif> => {
    return api.put<CompteAdministratif>(`${BASE_PATH}/${id}`, data)
  }

  const deleteCompte = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${id}`)
  }

  const validerCompte = async (id: string): Promise<CompteAdministratif> => {
    return api.post<CompteAdministratif>(`${BASE_PATH}/${id}/valider`)
  }

  const publierCompte = async (id: string): Promise<CompteAdministratif> => {
    return api.post<CompteAdministratif>(`${BASE_PATH}/${id}/publier`)
  }

  const archiverCompte = async (id: string): Promise<CompteAdministratif> => {
    return api.post<CompteAdministratif>(`${BASE_PATH}/${id}/archiver`)
  }

  const dupliquerCompte = async (id: string, annee: number): Promise<CompteAdministratif> => {
    return api.post<CompteAdministratif>(`${BASE_PATH}/${id}/dupliquer`, { annee })
  }

  // ============================================================================
  // LIGNES BUDGÉTAIRES
  // ============================================================================

  const getLignes = async (
    compteId: string,
    params?: { type?: 'recette' | 'depense' | 'equilibre' }
  ): Promise<LigneBudgetaire[]> => {
    return api.get<LigneBudgetaire[]>(`${BASE_PATH}/${compteId}/lignes`, params)
  }

  const getLigne = async (compteId: string, ligneId: string): Promise<LigneBudgetaire> => {
    return api.get<LigneBudgetaire>(`${BASE_PATH}/${compteId}/lignes/${ligneId}`)
  }

  const createLigne = async (compteId: string, data: LigneBudgetaireFormData): Promise<LigneBudgetaire> => {
    return api.post<LigneBudgetaire>(`${BASE_PATH}/${compteId}/lignes`, data)
  }

  const updateLigne = async (
    compteId: string,
    ligneId: string,
    data: Partial<LigneBudgetaireFormData>
  ): Promise<LigneBudgetaire> => {
    return api.put<LigneBudgetaire>(`${BASE_PATH}/${compteId}/lignes/${ligneId}`, data)
  }

  const deleteLigne = async (compteId: string, ligneId: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${compteId}/lignes/${ligneId}`)
  }

  const updateLignesEnLot = async (
    compteId: string,
    lignes: Array<{ id: string; valeurs: Record<string, any> }>
  ): Promise<LigneBudgetaire[]> => {
    return api.put<LigneBudgetaire[]>(`${BASE_PATH}/${compteId}/lignes/batch`, { lignes })
  }

  // ============================================================================
  // RUBRIQUES BUDGÉTAIRES
  // ============================================================================

  const getRubriques = async (
    params?: PaginationParams & {
      type?: 'recette' | 'depense' | 'equilibre'
      section?: 'fonctionnement' | 'investissement' | 'ordre' | 'equilibre'
      categorie_id?: string
      est_active?: boolean
    }
  ): Promise<PaginatedResponse<RubriqueBudgetaire>> => {
    return api.get<PaginatedResponse<RubriqueBudgetaire>>(RUBRIQUES_PATH, params)
  }

  const getRubriquesHierarchiques = async (
    type?: 'recette' | 'depense' | 'equilibre'
  ): Promise<RubriqueBudgetaireHierarchique[]> => {
    return api.get<RubriqueBudgetaireHierarchique[]>(`${RUBRIQUES_PATH}/hierarchie`, { type })
  }

  const getRubrique = async (id: string): Promise<RubriqueBudgetaire> => {
    return api.get<RubriqueBudgetaire>(`${RUBRIQUES_PATH}/${id}`)
  }

  const createRubrique = async (data: RubriqueBudgetaireFormData): Promise<RubriqueBudgetaire> => {
    return api.post<RubriqueBudgetaire>(RUBRIQUES_PATH, data)
  }

  const updateRubrique = async (
    id: string,
    data: Partial<RubriqueBudgetaireFormData>
  ): Promise<RubriqueBudgetaire> => {
    return api.put<RubriqueBudgetaire>(`${RUBRIQUES_PATH}/${id}`, data)
  }

  const deleteRubrique = async (id: string): Promise<void> => {
    return api.delete<void>(`${RUBRIQUES_PATH}/${id}`)
  }

  // ============================================================================
  // CATÉGORIES DE RUBRIQUES
  // ============================================================================

  const getCategories = async (
    params?: { type?: 'recette' | 'depense' | 'equilibre' }
  ): Promise<CategorieRubrique[]> => {
    return api.get<CategorieRubrique[]>(CATEGORIES_PATH, params)
  }

  const getCategorie = async (id: string): Promise<CategorieRubrique> => {
    return api.get<CategorieRubrique>(`${CATEGORIES_PATH}/${id}`)
  }

  const createCategorie = async (data: CategorieRubriqueFormData): Promise<CategorieRubrique> => {
    return api.post<CategorieRubrique>(CATEGORIES_PATH, data)
  }

  const updateCategorie = async (
    id: string,
    data: Partial<CategorieRubriqueFormData>
  ): Promise<CategorieRubrique> => {
    return api.put<CategorieRubrique>(`${CATEGORIES_PATH}/${id}`, data)
  }

  const deleteCategorie = async (id: string): Promise<void> => {
    return api.delete<void>(`${CATEGORIES_PATH}/${id}`)
  }

  // ============================================================================
  // COLONNES DYNAMIQUES
  // ============================================================================

  const getColonnes = async (
    params?: { applicable_a?: 'recette' | 'depense' | 'tous' | 'equilibre'; est_active?: boolean }
  ): Promise<ColonneDynamique[]> => {
    return api.get<ColonneDynamique[]>(COLONNES_PATH, params)
  }

  const getColonne = async (id: string): Promise<ColonneDynamique> => {
    return api.get<ColonneDynamique>(`${COLONNES_PATH}/${id}`)
  }

  const createColonne = async (data: ColonneDynamiqueFormData): Promise<ColonneDynamique> => {
    return api.post<ColonneDynamique>(COLONNES_PATH, data)
  }

  const updateColonne = async (
    id: string,
    data: Partial<ColonneDynamiqueFormData>
  ): Promise<ColonneDynamique> => {
    return api.put<ColonneDynamique>(`${COLONNES_PATH}/${id}`, data)
  }

  const deleteColonne = async (id: string): Promise<void> => {
    return api.delete<void>(`${COLONNES_PATH}/${id}`)
  }

  const reorderColonnes = async (ordres: Array<{ id: string; ordre: number }>): Promise<void> => {
    return api.put<void>(`${COLONNES_PATH}/reorder`, { ordres })
  }

  return {
    // Comptes administratifs
    getComptes,
    getCompte,
    createCompte,
    updateCompte,
    deleteCompte,
    validerCompte,
    publierCompte,
    archiverCompte,
    dupliquerCompte,

    // Lignes budgétaires
    getLignes,
    getLigne,
    createLigne,
    updateLigne,
    deleteLigne,
    updateLignesEnLot,

    // Rubriques
    getRubriques,
    getRubriquesHierarchiques,
    getRubrique,
    createRubrique,
    updateRubrique,
    deleteRubrique,

    // Catégories
    getCategories,
    getCategorie,
    createCategorie,
    updateCategorie,
    deleteCategorie,

    // Colonnes
    getColonnes,
    getColonne,
    createColonne,
    updateColonne,
    deleteColonne,
    reorderColonnes,
  }
}
