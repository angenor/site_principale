/**
 * Service pour les statistiques et l'audit
 */

import type { PaginatedResponse, PaginationParams } from './api'
import type { ActivityLog, AnalyticsVisite, DashboardStats } from '~/types'

const BASE_PATH = '/api/v1/admin/statistiques'
const AUDIT_PATH = '/api/v1/admin/audit'

export interface VisiteStats {
  total_visites: number
  visiteurs_uniques: number
  pages_vues: number
  duree_moyenne: number
  taux_rebond: number
}

export interface PageStats {
  page_url: string
  visites: number
  visiteurs_uniques: number
  duree_moyenne: number
}

export interface AuditFilters {
  user_id?: string
  action?: string
  table_name?: string
  date_debut?: string
  date_fin?: string
}

export const useStatistiquesService = () => {
  const api = useApi()

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  const getDashboardStats = async (): Promise<DashboardStats> => {
    return api.get<DashboardStats>(`${BASE_PATH}/dashboard`)
  }

  const getRevenusParAnnee = async (
    params?: { region_id?: string; annees?: number }
  ): Promise<Array<{ annee: number; total: number; evolution: number }>> => {
    return api.get<Array<{ annee: number; total: number; evolution: number }>>(
      `${BASE_PATH}/revenus-par-annee`,
      params
    )
  }

  const getComptesParStatut = async (): Promise<Record<string, number>> => {
    return api.get<Record<string, number>>(`${BASE_PATH}/comptes-par-statut`)
  }

  const getCommunesAvecDonnees = async (
    params?: { annee?: number }
  ): Promise<{ avec_donnees: number; sans_donnees: number; total: number }> => {
    return api.get<{ avec_donnees: number; sans_donnees: number; total: number }>(
      `${BASE_PATH}/communes-avec-donnees`,
      params
    )
  }

  // ============================================================================
  // VISITES
  // ============================================================================

  const getVisiteStats = async (
    params?: { periode?: '7j' | '30j' | '90j' | '1an' }
  ): Promise<VisiteStats> => {
    return api.get<VisiteStats>(`${BASE_PATH}/visites`, params)
  }

  const getVisitesParJour = async (
    params?: { jours?: number }
  ): Promise<Array<{ date: string; visites: number; visiteurs: number }>> => {
    return api.get<Array<{ date: string; visites: number; visiteurs: number }>>(
      `${BASE_PATH}/visites/par-jour`,
      params
    )
  }

  const getPagesPopulaires = async (
    params?: { limite?: number; periode?: '7j' | '30j' | '90j' }
  ): Promise<PageStats[]> => {
    return api.get<PageStats[]>(`${BASE_PATH}/visites/pages-populaires`, params)
  }

  const getVisitesParRegion = async (): Promise<Array<{ region: string; visites: number }>> => {
    return api.get<Array<{ region: string; visites: number }>>(`${BASE_PATH}/visites/par-region`)
  }

  const getVisitesParPays = async (): Promise<Array<{ pays: string; visites: number }>> => {
    return api.get<Array<{ pays: string; visites: number }>>(`${BASE_PATH}/visites/par-pays`)
  }

  // ============================================================================
  // TÉLÉCHARGEMENTS
  // ============================================================================

  const getTelechargementStats = async (
    params?: { periode?: '7j' | '30j' | '90j' | '1an' }
  ): Promise<{ total: number; documents_telecharges: number }> => {
    return api.get<{ total: number; documents_telecharges: number }>(
      `${BASE_PATH}/telechargements`,
      params
    )
  }

  const getDocumentsPopulaires = async (
    params?: { limite?: number }
  ): Promise<Array<{ document_id: string; titre: string; telechargements: number }>> => {
    return api.get<Array<{ document_id: string; titre: string; telechargements: number }>>(
      `${BASE_PATH}/telechargements/populaires`,
      params
    )
  }

  // ============================================================================
  // JOURNAL D'AUDIT
  // ============================================================================

  const getAuditLogs = async (
    params?: PaginationParams & AuditFilters
  ): Promise<PaginatedResponse<ActivityLog>> => {
    return api.get<PaginatedResponse<ActivityLog>>(AUDIT_PATH, params)
  }

  const getAuditLog = async (id: string): Promise<ActivityLog> => {
    return api.get<ActivityLog>(`${AUDIT_PATH}/${id}`)
  }

  const getAuditActions = async (): Promise<string[]> => {
    return api.get<string[]>(`${AUDIT_PATH}/actions`)
  }

  const getAuditTables = async (): Promise<string[]> => {
    return api.get<string[]>(`${AUDIT_PATH}/tables`)
  }

  const exportAuditLogs = async (
    params?: AuditFilters & { format?: 'csv' | 'xlsx' }
  ): Promise<Blob> => {
    return api.download(`${AUDIT_PATH}/export`, params)
  }

  // ============================================================================
  // ACTIVITÉ RÉCENTE
  // ============================================================================

  const getActiviteRecente = async (
    params?: { limite?: number }
  ): Promise<ActivityLog[]> => {
    return api.get<ActivityLog[]>(`${BASE_PATH}/activite-recente`, params)
  }

  const getActiviteUtilisateur = async (
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ActivityLog>> => {
    return api.get<PaginatedResponse<ActivityLog>>(`${BASE_PATH}/utilisateur/${userId}/activite`, params)
  }

  return {
    // Dashboard
    getDashboardStats,
    getRevenusParAnnee,
    getComptesParStatut,
    getCommunesAvecDonnees,

    // Visites
    getVisiteStats,
    getVisitesParJour,
    getPagesPopulaires,
    getVisitesParRegion,
    getVisitesParPays,

    // Téléchargements
    getTelechargementStats,
    getDocumentsPopulaires,

    // Audit
    getAuditLogs,
    getAuditLog,
    getAuditActions,
    getAuditTables,
    exportAuditLogs,

    // Activité
    getActiviteRecente,
    getActiviteUtilisateur,
  }
}
