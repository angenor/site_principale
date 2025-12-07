/**
 * Service pour la gestion de la newsletter
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'
import type { NewsletterSubscriber, NewsletterSubscriberFormData } from '~/types/autres-modules'

const BASE_PATH = '/api/v1/admin/newsletter'

export interface NewsletterStats {
  total_abonnes: number
  abonnes_actifs: number
  abonnes_inactifs: number
  desabonnes: number
  inscriptions_ce_mois: number
  taux_croissance: number
}

export const useNewsletterService = () => {
  const api = useApi()

  // ============================================================================
  // ABONNÉS
  // ============================================================================

  const getAbonnes = async (
    params?: PaginationParams & {
      statut?: 'actif' | 'inactif' | 'desabonne'
      search?: string
      date_debut?: string
      date_fin?: string
    }
  ): Promise<PaginatedResponse<NewsletterSubscriber>> => {
    return api.get<PaginatedResponse<NewsletterSubscriber>>(`${BASE_PATH}/abonnes`, params)
  }

  const getAbonne = async (id: string): Promise<NewsletterSubscriber> => {
    return api.get<NewsletterSubscriber>(`${BASE_PATH}/abonnes/${id}`)
  }

  const createAbonne = async (data: NewsletterSubscriberFormData): Promise<NewsletterSubscriber> => {
    return api.post<NewsletterSubscriber>(`${BASE_PATH}/abonnes`, data)
  }

  const updateAbonne = async (
    id: string,
    data: Partial<NewsletterSubscriberFormData>
  ): Promise<NewsletterSubscriber> => {
    return api.put<NewsletterSubscriber>(`${BASE_PATH}/abonnes/${id}`, data)
  }

  const deleteAbonne = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/abonnes/${id}`)
  }

  const activerAbonne = async (id: string): Promise<NewsletterSubscriber> => {
    return api.post<NewsletterSubscriber>(`${BASE_PATH}/abonnes/${id}/activer`)
  }

  const desactiverAbonne = async (id: string): Promise<NewsletterSubscriber> => {
    return api.post<NewsletterSubscriber>(`${BASE_PATH}/abonnes/${id}/desactiver`)
  }

  // ============================================================================
  // IMPORT/EXPORT
  // ============================================================================

  const exportAbonnes = async (
    params?: { statut?: 'actif' | 'inactif' | 'desabonne'; format?: 'csv' | 'xlsx' }
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/export`, params)
  }

  const importAbonnes = async (file: File): Promise<{ imported: number; errors: string[] }> => {
    return api.upload<{ imported: number; errors: string[] }>(`${BASE_PATH}/import`, file)
  }

  // ============================================================================
  // STATISTIQUES
  // ============================================================================

  const getStats = async (): Promise<NewsletterStats> => {
    return api.get<NewsletterStats>(`${BASE_PATH}/stats`)
  }

  const getEvolutionInscriptions = async (
    params?: { periode?: '7j' | '30j' | '90j' | '1an' }
  ): Promise<Array<{ date: string; inscriptions: number; desabonnements: number }>> => {
    return api.get<Array<{ date: string; inscriptions: number; desabonnements: number }>>(
      `${BASE_PATH}/stats/evolution`,
      params
    )
  }

  return {
    // Abonnés
    getAbonnes,
    getAbonne,
    createAbonne,
    updateAbonne,
    deleteAbonne,
    activerAbonne,
    desactiverAbonne,

    // Import/Export
    exportAbonnes,
    importAbonnes,

    // Statistiques
    getStats,
    getEvolutionInscriptions,
  }
}
