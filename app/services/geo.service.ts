/**
 * Service pour la gestion des données géographiques
 * Régions, Districts, Communes
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'
import type {
  Region,
  District,
  Commune,
  RegionFormData,
  DistrictFormData,
  CommuneFormData,
  RegionWithStats,
  DistrictWithStats,
} from '~/types/collectivites'

const BASE_PATH = '/api/v1/admin/geo'

export const useGeoService = () => {
  const api = useApi()

  // ============================================================================
  // RÉGIONS
  // ============================================================================

  const getRegions = async (
    params?: PaginationParams & { search?: string }
  ): Promise<PaginatedResponse<RegionWithStats>> => {
    return api.get<PaginatedResponse<RegionWithStats>>(`${BASE_PATH}/regions`, params)
  }

  const getRegion = async (id: string): Promise<Region> => {
    return api.get<Region>(`${BASE_PATH}/regions/${id}`)
  }

  const createRegion = async (data: RegionFormData): Promise<Region> => {
    return api.post<Region>(`${BASE_PATH}/regions`, data)
  }

  const updateRegion = async (id: string, data: Partial<RegionFormData>): Promise<Region> => {
    return api.put<Region>(`${BASE_PATH}/regions/${id}`, data)
  }

  const deleteRegion = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/regions/${id}`)
  }

  const getAllRegions = async (): Promise<Region[]> => {
    return api.get<Region[]>(`${BASE_PATH}/regions/all`)
  }

  // ============================================================================
  // DISTRICTS
  // ============================================================================

  const getDistricts = async (
    params?: PaginationParams & { region_id?: string; search?: string }
  ): Promise<PaginatedResponse<DistrictWithStats>> => {
    return api.get<PaginatedResponse<DistrictWithStats>>(`${BASE_PATH}/districts`, params)
  }

  const getDistrict = async (id: string): Promise<District> => {
    return api.get<District>(`${BASE_PATH}/districts/${id}`)
  }

  const createDistrict = async (data: DistrictFormData): Promise<District> => {
    return api.post<District>(`${BASE_PATH}/districts`, data)
  }

  const updateDistrict = async (id: string, data: Partial<DistrictFormData>): Promise<District> => {
    return api.put<District>(`${BASE_PATH}/districts/${id}`, data)
  }

  const deleteDistrict = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/districts/${id}`)
  }

  const getDistrictsByRegion = async (regionId: string): Promise<District[]> => {
    return api.get<District[]>(`${BASE_PATH}/regions/${regionId}/districts`)
  }

  // ============================================================================
  // COMMUNES
  // ============================================================================

  const getCommunes = async (
    params?: PaginationParams & {
      region_id?: string
      district_id?: string
      type?: 'urbaine' | 'rurale'
      search?: string
    }
  ): Promise<PaginatedResponse<Commune>> => {
    return api.get<PaginatedResponse<Commune>>(`${BASE_PATH}/communes`, params)
  }

  const getCommune = async (id: string): Promise<Commune> => {
    return api.get<Commune>(`${BASE_PATH}/communes/${id}`)
  }

  const createCommune = async (data: CommuneFormData): Promise<Commune> => {
    return api.post<Commune>(`${BASE_PATH}/communes`, data)
  }

  const updateCommune = async (id: string, data: Partial<CommuneFormData>): Promise<Commune> => {
    return api.put<Commune>(`${BASE_PATH}/communes/${id}`, data)
  }

  const deleteCommune = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/communes/${id}`)
  }

  const getCommunesByDistrict = async (districtId: string): Promise<Commune[]> => {
    return api.get<Commune[]>(`${BASE_PATH}/districts/${districtId}/communes`)
  }

  const searchCommunes = async (query: string, limit?: number): Promise<Commune[]> => {
    return api.get<Commune[]>(`${BASE_PATH}/communes/search`, { q: query, limit: limit || 20 })
  }

  return {
    // Régions
    getRegions,
    getRegion,
    createRegion,
    updateRegion,
    deleteRegion,
    getAllRegions,

    // Districts
    getDistricts,
    getDistrict,
    createDistrict,
    updateDistrict,
    deleteDistrict,
    getDistrictsByRegion,

    // Communes
    getCommunes,
    getCommune,
    createCommune,
    updateCommune,
    deleteCommune,
    getCommunesByDistrict,
    searchCommunes,
  }
}
