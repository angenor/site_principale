/**
 * Service pour la gestion des données géographiques
 * Structure: Province → Région → Commune
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'
import type {
  Province,
  ProvinceWithStats,
  Region,
  RegionWithStats,
  RegionFormData,
  Commune,
  CommuneWithStats,
  CommuneFormData,
} from '~/types/collectivites'

const BASE_PATH = '/api/v1/geo'

export const useGeoService = () => {
  const api = useApi()

  // ============================================================================
  // PROVINCES
  // ============================================================================

  const getProvinces = async (): Promise<ProvinceWithStats[]> => {
    return api.get<ProvinceWithStats[]>(`${BASE_PATH}/provinces`)
  }

  const getProvince = async (id: number): Promise<ProvinceWithStats> => {
    return api.get<ProvinceWithStats>(`${BASE_PATH}/provinces/${id}`)
  }

  const getProvinceRegions = async (provinceId: number): Promise<RegionWithStats[]> => {
    // Backend uses /regions?province_id=X instead of /provinces/{id}/regions
    return api.get<RegionWithStats[]>(`${BASE_PATH}/regions`, { province_id: provinceId })
  }

  // ============================================================================
  // RÉGIONS
  // ============================================================================

  const getRegions = async (
    params?: { province_id?: number; search?: string }
  ): Promise<RegionWithStats[]> => {
    // Backend returns list directly (not paginated)
    return api.get<RegionWithStats[]>(`${BASE_PATH}/regions`, params)
  }

  const getRegion = async (id: number): Promise<RegionWithStats> => {
    return api.get<RegionWithStats>(`${BASE_PATH}/regions/${id}`)
  }

  const createRegion = async (data: RegionFormData): Promise<Region> => {
    return api.post<Region>(`${BASE_PATH}/regions`, data)
  }

  const updateRegion = async (id: number, data: Partial<RegionFormData>): Promise<Region> => {
    return api.put<Region>(`${BASE_PATH}/regions/${id}`, data)
  }

  const deleteRegion = async (id: number): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/regions/${id}`)
  }

  const getAllRegions = async (): Promise<Region[]> => {
    return api.get<Region[]>(`${BASE_PATH}/regions/all`)
  }

  const getRegionCommunes = async (regionId: number): Promise<CommuneWithStats[]> => {
    // Backend uses /communes?region_id=X instead of /regions/{id}/communes
    return api.get<CommuneWithStats[]>(`${BASE_PATH}/communes`, { region_id: regionId })
  }

  // ============================================================================
  // COMMUNES
  // ============================================================================

  const getCommunes = async (
    params?: PaginationParams & {
      province_id?: number
      region_id?: number
      type_commune?: 'urbaine' | 'rurale'
      search?: string
    }
  ): Promise<PaginatedResponse<CommuneWithStats>> => {
    return api.get<PaginatedResponse<CommuneWithStats>>(`${BASE_PATH}/communes`, params)
  }

  const getCommune = async (id: number): Promise<CommuneWithStats> => {
    return api.get<CommuneWithStats>(`${BASE_PATH}/communes/${id}`)
  }

  const createCommune = async (data: CommuneFormData): Promise<Commune> => {
    return api.post<Commune>(`${BASE_PATH}/communes`, data)
  }

  const updateCommune = async (id: number, data: Partial<CommuneFormData>): Promise<Commune> => {
    return api.put<Commune>(`${BASE_PATH}/communes/${id}`, data)
  }

  const deleteCommune = async (id: number): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/communes/${id}`)
  }

  const searchCommunes = async (query: string, limit?: number): Promise<Commune[]> => {
    return api.get<Commune[]>(`${BASE_PATH}/communes/search`, { q: query, limit: limit || 20 })
  }

  return {
    // Provinces
    getProvinces,
    getProvince,
    getProvinceRegions,

    // Régions
    getRegions,
    getRegion,
    createRegion,
    updateRegion,
    deleteRegion,
    getAllRegions,
    getRegionCommunes,

    // Communes
    getCommunes,
    getCommune,
    createCommune,
    updateCommune,
    deleteCommune,
    searchCommunes,
  }
}
