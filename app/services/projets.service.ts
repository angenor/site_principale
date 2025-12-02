/**
 * Service pour la gestion des projets miniers
 * Projets, Sociétés, Revenus miniers
 */

import type { PaginatedResponse, PaginationParams } from './api'
import type {
  ProjetMinier,
  ProjetMinierFormData,
  ProjetMinierWithStats,
  RevenuMinier,
  RevenuMinierFormData,
  RevenuMinierStats,
} from '~/types/projets-miniers'

const BASE_PATH = '/api/v1/admin/projets'
const REVENUS_PATH = '/api/v1/admin/revenus'

// Types pour les sociétés
export interface Societe {
  id: string
  nom: string
  code?: string
  description?: string
  site_web?: string
  email?: string
  telephone?: string
  adresse?: string
  pays?: string
  created_at: string
  updated_at: string
  nombre_projets?: number
}

export interface SocieteFormData {
  nom: string
  code?: string
  description?: string
  site_web?: string
  email?: string
  telephone?: string
  adresse?: string
  pays?: string
}

export const useProjetsService = () => {
  const api = useApi()

  // ============================================================================
  // SOCIÉTÉS MINIÈRES
  // ============================================================================

  const getSocietes = async (
    params?: PaginationParams & { search?: string }
  ): Promise<PaginatedResponse<Societe>> => {
    return api.get<PaginatedResponse<Societe>>(`${BASE_PATH}/societes`, params)
  }

  const getSociete = async (id: string): Promise<Societe> => {
    return api.get<Societe>(`${BASE_PATH}/societes/${id}`)
  }

  const createSociete = async (data: SocieteFormData): Promise<Societe> => {
    return api.post<Societe>(`${BASE_PATH}/societes`, data)
  }

  const updateSociete = async (id: string, data: Partial<SocieteFormData>): Promise<Societe> => {
    return api.put<Societe>(`${BASE_PATH}/societes/${id}`, data)
  }

  const deleteSociete = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/societes/${id}`)
  }

  const getAllSocietes = async (): Promise<Societe[]> => {
    return api.get<Societe[]>(`${BASE_PATH}/societes/all`)
  }

  // ============================================================================
  // PROJETS MINIERS
  // ============================================================================

  const getProjets = async (
    params?: PaginationParams & {
      societe_id?: string
      region_id?: string
      district_id?: string
      commune_id?: string
      statut?: 'en_cours' | 'suspendu' | 'termine' | 'planifie'
      type_minerai?: string
      search?: string
    }
  ): Promise<PaginatedResponse<ProjetMinierWithStats>> => {
    return api.get<PaginatedResponse<ProjetMinierWithStats>>(BASE_PATH, params)
  }

  const getProjet = async (id: string): Promise<ProjetMinier> => {
    return api.get<ProjetMinier>(`${BASE_PATH}/${id}`)
  }

  const createProjet = async (data: ProjetMinierFormData): Promise<ProjetMinier> => {
    return api.post<ProjetMinier>(BASE_PATH, data)
  }

  const updateProjet = async (id: string, data: Partial<ProjetMinierFormData>): Promise<ProjetMinier> => {
    return api.put<ProjetMinier>(`${BASE_PATH}/${id}`, data)
  }

  const deleteProjet = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${id}`)
  }

  const getProjetsByCommune = async (communeId: string): Promise<ProjetMinier[]> => {
    return api.get<ProjetMinier[]>(`${BASE_PATH}/commune/${communeId}`)
  }

  const getTypesMinerai = async (): Promise<string[]> => {
    return api.get<string[]>(`${BASE_PATH}/types-minerai`)
  }

  // ============================================================================
  // REVENUS MINIERS
  // ============================================================================

  const getRevenus = async (
    params?: PaginationParams & {
      projet_minier_id?: string
      commune_id?: string
      district_id?: string
      region_id?: string
      annee?: number
      trimestre?: number
      type_revenu?: 'ristourne' | 'redevance' | 'autre'
    }
  ): Promise<PaginatedResponse<RevenuMinier>> => {
    return api.get<PaginatedResponse<RevenuMinier>>(REVENUS_PATH, params)
  }

  const getRevenu = async (id: string): Promise<RevenuMinier> => {
    return api.get<RevenuMinier>(`${REVENUS_PATH}/${id}`)
  }

  const createRevenu = async (data: RevenuMinierFormData): Promise<RevenuMinier> => {
    return api.post<RevenuMinier>(REVENUS_PATH, data)
  }

  const updateRevenu = async (id: string, data: Partial<RevenuMinierFormData>): Promise<RevenuMinier> => {
    return api.put<RevenuMinier>(`${REVENUS_PATH}/${id}`, data)
  }

  const deleteRevenu = async (id: string): Promise<void> => {
    return api.delete<void>(`${REVENUS_PATH}/${id}`)
  }

  const getRevenusByProjet = async (projetId: string): Promise<RevenuMinier[]> => {
    return api.get<RevenuMinier[]>(`${BASE_PATH}/${projetId}/revenus`)
  }

  const getRevenusStats = async (
    params?: { annee?: number; region_id?: string }
  ): Promise<RevenuMinierStats[]> => {
    return api.get<RevenuMinierStats[]>(`${REVENUS_PATH}/stats`, params)
  }

  return {
    // Sociétés
    getSocietes,
    getSociete,
    createSociete,
    updateSociete,
    deleteSociete,
    getAllSocietes,

    // Projets
    getProjets,
    getProjet,
    createProjet,
    updateProjet,
    deleteProjet,
    getProjetsByCommune,
    getTypesMinerai,

    // Revenus
    getRevenus,
    getRevenu,
    createRevenu,
    updateRevenu,
    deleteRevenu,
    getRevenusByProjet,
    getRevenusStats,
  }
}
