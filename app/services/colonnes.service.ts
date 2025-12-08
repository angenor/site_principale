/**
 * Service pour la gestion des colonnes dynamiques
 * CRUD operations pour les définitions de colonnes
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'

const BASE_PATH = '/api/v1/admin/colonnes'

// ============================================================================
// TYPES
// ============================================================================

export type ApplicableA = 'recette' | 'depense' | 'tous' | 'equilibre'
export type TypeDonnee = 'montant' | 'pourcentage' | 'texte' | 'date' | 'nombre'

export interface ColonneDynamique {
  id: number
  cle: string
  label: string
  applicable_a: ApplicableA
  type_donnee: TypeDonnee
  formule?: string | null
  largeur: number
  ordre: number
  est_obligatoire: boolean
  est_editable: boolean
  est_visible: boolean
  est_active: boolean
  est_systeme: boolean
  description?: string | null
}

export interface ColonneCreate {
  cle: string
  label: string
  applicable_a?: ApplicableA
  type_donnee?: TypeDonnee
  formule?: string | null
  largeur?: number
  ordre?: number
  est_obligatoire?: boolean
  est_editable?: boolean
  est_visible?: boolean
  est_active?: boolean
  description?: string | null
}

export interface ColonneUpdate {
  label?: string
  applicable_a?: ApplicableA
  type_donnee?: TypeDonnee
  formule?: string | null
  largeur?: number
  ordre?: number
  est_obligatoire?: boolean
  est_editable?: boolean
  est_visible?: boolean
  est_active?: boolean
  description?: string | null
}

export interface ColonneFilters extends PaginationParams {
  applicable_a?: ApplicableA
  est_active?: boolean
  search?: string
}

export interface ColonneReorderItem {
  id: number
  ordre: number
}

// ============================================================================
// SERVICE
// ============================================================================

export const useColonnesService = () => {
  const api = useApi()

  /**
   * Récupère la liste paginée des colonnes
   */
  const getColonnes = async (
    params?: ColonneFilters
  ): Promise<PaginatedResponse<ColonneDynamique>> => {
    return api.get<PaginatedResponse<ColonneDynamique>>(BASE_PATH, params)
  }

  /**
   * Récupère une colonne par son ID
   */
  const getColonne = async (id: number): Promise<ColonneDynamique> => {
    return api.get<ColonneDynamique>(`${BASE_PATH}/${id}`)
  }

  /**
   * Crée une nouvelle colonne
   */
  const createColonne = async (data: ColonneCreate): Promise<ColonneDynamique> => {
    return api.post<ColonneDynamique>(BASE_PATH, data)
  }

  /**
   * Met à jour une colonne existante
   */
  const updateColonne = async (
    id: number,
    data: ColonneUpdate
  ): Promise<ColonneDynamique> => {
    return api.put<ColonneDynamique>(`${BASE_PATH}/${id}`, data)
  }

  /**
   * Supprime une colonne
   */
  const deleteColonne = async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`${BASE_PATH}/${id}`)
  }

  /**
   * Réordonne plusieurs colonnes
   */
  const reorderColonnes = async (
    colonnes: ColonneReorderItem[]
  ): Promise<ColonneDynamique[]> => {
    return api.post<ColonneDynamique[]>(`${BASE_PATH}/reorder`, { colonnes })
  }

  /**
   * Récupère toutes les colonnes (sans pagination)
   */
  const getAllColonnes = async (
    params?: Omit<ColonneFilters, 'page' | 'limit'>
  ): Promise<ColonneDynamique[]> => {
    const response = await api.get<PaginatedResponse<ColonneDynamique>>(BASE_PATH, {
      ...params,
      page: 1,
      limit: 200, // Max allowed by API
    })
    return response.items
  }

  return {
    getColonnes,
    getColonne,
    createColonne,
    updateColonne,
    deleteColonne,
    reorderColonnes,
    getAllColonnes,
  }
}
