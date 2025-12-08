/**
 * Service pour la gestion des données financières (recettes et dépenses)
 * CRUD operations pour l'édition interactive du tableau budgétaire
 */

import { useApi } from './api'
import type {
  DonneesRecette,
  DonneesRecetteCreate,
  DonneesRecetteUpdate,
  DonneesDepense,
  DonneesDepenseCreate,
  DonneesDepenseUpdate,
  DonneesMapping,
} from '~/types/donnees'

const BASE_PATH = '/api/v1/admin/donnees'

export const useDonneesService = () => {
  const api = useApi()

  // ============================================================================
  // RECETTES
  // ============================================================================

  /**
   * Récupère toutes les recettes d'une commune pour un exercice
   */
  const getRecettes = async (
    commune_id: number,
    exercice_id: number
  ): Promise<DonneesRecette[]> => {
    return api.get<DonneesRecette[]>(`${BASE_PATH}/recettes`, {
      commune_id,
      exercice_id,
    })
  }

  /**
   * Crée une nouvelle ligne de recette
   */
  const createRecette = async (data: DonneesRecetteCreate): Promise<DonneesRecette> => {
    return api.post<DonneesRecette>(`${BASE_PATH}/recettes`, data)
  }

  /**
   * Met à jour une ligne de recette existante
   */
  const updateRecette = async (
    id: number,
    data: DonneesRecetteUpdate
  ): Promise<DonneesRecette> => {
    return api.put<DonneesRecette>(`${BASE_PATH}/recettes/${id}`, data)
  }

  /**
   * Supprime une ligne de recette
   */
  const deleteRecette = async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`${BASE_PATH}/recettes/${id}`)
  }

  // ============================================================================
  // DEPENSES
  // ============================================================================

  /**
   * Récupère toutes les dépenses d'une commune pour un exercice
   */
  const getDepenses = async (
    commune_id: number,
    exercice_id: number
  ): Promise<DonneesDepense[]> => {
    return api.get<DonneesDepense[]>(`${BASE_PATH}/depenses`, {
      commune_id,
      exercice_id,
    })
  }

  /**
   * Crée une nouvelle ligne de dépense
   */
  const createDepense = async (data: DonneesDepenseCreate): Promise<DonneesDepense> => {
    return api.post<DonneesDepense>(`${BASE_PATH}/depenses`, data)
  }

  /**
   * Met à jour une ligne de dépense existante
   */
  const updateDepense = async (
    id: number,
    data: DonneesDepenseUpdate
  ): Promise<DonneesDepense> => {
    return api.put<DonneesDepense>(`${BASE_PATH}/depenses/${id}`, data)
  }

  /**
   * Supprime une ligne de dépense
   */
  const deleteDepense = async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`${BASE_PATH}/depenses/${id}`)
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Charge toutes les données et crée le mapping compte_code -> id
   * Nécessaire pour les opérations CRUD car le tableau affiche des codes
   * mais l'API utilise des IDs numériques
   */
  const loadDonneesMapping = async (
    commune_id: number,
    exercice_id: number
  ): Promise<DonneesMapping> => {
    const [recettes, depenses] = await Promise.all([
      getRecettes(commune_id, exercice_id),
      getDepenses(commune_id, exercice_id),
    ])

    const recettesMap = new Map<string, number>()
    recettes.forEach((r) => {
      recettesMap.set(r.compte_code, r.id)
    })

    const depensesMap = new Map<string, number>()
    depenses.forEach((d) => {
      depensesMap.set(d.compte_code, d.id)
    })

    return {
      recettes: recettesMap,
      depenses: depensesMap,
    }
  }

  /**
   * Met à jour ou crée une entrée selon que l'ID existe ou non
   */
  const upsertRecette = async (
    commune_id: number,
    exercice_id: number,
    compte_code: string,
    data: DonneesRecetteUpdate,
    existingId?: number
  ): Promise<DonneesRecette> => {
    if (existingId) {
      return updateRecette(existingId, data)
    }
    return createRecette({
      commune_id,
      exercice_id,
      compte_code,
      ...data,
    })
  }

  /**
   * Met à jour ou crée une dépense selon que l'ID existe ou non
   */
  const upsertDepense = async (
    commune_id: number,
    exercice_id: number,
    compte_code: string,
    data: DonneesDepenseUpdate,
    existingId?: number
  ): Promise<DonneesDepense> => {
    if (existingId) {
      return updateDepense(existingId, data)
    }
    return createDepense({
      commune_id,
      exercice_id,
      compte_code,
      ...data,
    })
  }

  return {
    // Recettes
    getRecettes,
    createRecette,
    updateRecette,
    deleteRecette,
    // Dépenses
    getDepenses,
    createDepense,
    updateDepense,
    deleteDepense,
    // Helpers
    loadDonneesMapping,
    upsertRecette,
    upsertDepense,
  }
}
