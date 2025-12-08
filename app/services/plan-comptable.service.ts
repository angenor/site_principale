/**
 * Service pour la gestion du plan comptable
 * CRUD operations pour les rubriques budgétaires
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'
import type {
  PlanComptable,
  PlanComptableCreate,
  PlanComptableUpdate,
  TypeMouvement,
  SectionBudgetaire,
} from '~/types/comptabilite'

const BASE_PATH = '/api/v1/admin/plan-comptable'

export interface PlanComptableFilters extends PaginationParams {
  type_mouvement?: TypeMouvement
  section?: SectionBudgetaire
  niveau?: 1 | 2 | 3
  actif?: boolean
  search?: string
}

export const usePlanComptableService = () => {
  const api = useApi()

  /**
   * Récupère la liste paginée des rubriques du plan comptable
   */
  const getRubriques = async (
    params?: PlanComptableFilters
  ): Promise<PaginatedResponse<PlanComptable>> => {
    return api.get<PaginatedResponse<PlanComptable>>(BASE_PATH, params)
  }

  /**
   * Récupère une rubrique par son code
   */
  const getRubrique = async (code: string): Promise<PlanComptable> => {
    return api.get<PlanComptable>(`${BASE_PATH}/${code}`)
  }

  /**
   * Crée une nouvelle rubrique
   */
  const createRubrique = async (data: PlanComptableCreate): Promise<PlanComptable> => {
    return api.post<PlanComptable>(BASE_PATH, data)
  }

  /**
   * Met à jour une rubrique existante
   */
  const updateRubrique = async (
    code: string,
    data: PlanComptableUpdate
  ): Promise<PlanComptable> => {
    return api.put<PlanComptable>(`${BASE_PATH}/${code}`, data)
  }

  /**
   * Supprime une rubrique
   */
  const deleteRubrique = async (code: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`${BASE_PATH}/${code}`)
  }

  /**
   * Récupère toutes les rubriques (sans pagination) pour construire l'arborescence
   */
  const getAllRubriques = async (
    params?: Omit<PlanComptableFilters, 'page' | 'limit'>
  ): Promise<PlanComptable[]> => {
    const response = await api.get<PaginatedResponse<PlanComptable>>(BASE_PATH, {
      ...params,
      page: 1,
      limit: 500, // Max allowed by API
    })
    return response.items
  }

  return {
    getRubriques,
    getRubrique,
    createRubrique,
    updateRubrique,
    deleteRubrique,
    getAllRubriques,
  }
}
