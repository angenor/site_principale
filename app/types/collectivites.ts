// ============================================================================
// Types pour les Collectivités Territoriales
// Basés sur le schéma SQL: Province → Région → Commune
// ============================================================================

// Province (6 provinces de Madagascar)
export interface Province {
  id: number
  code: string
  nom: string
  created_at: string
  updated_at: string
}

export interface ProvinceWithStats extends Province {
  nb_regions: number
  nb_communes: number
}

// Région (22 régions de Madagascar)
export interface Region {
  id: number
  code: string
  nom: string
  province_id: number
  created_at: string
  updated_at: string
  // Relations
  province?: Province
}

export interface RegionWithStats extends Region {
  nb_communes: number
  province_nom?: string
}

// Commune
export interface Commune {
  id: number
  code: string
  nom: string
  type_commune: 'urbaine' | 'rurale'
  region_id: number
  population?: number | null
  superficie_km2?: number | null
  created_at: string
  updated_at: string
  // Relations
  region?: Region
}

export interface CommuneWithStats extends Commune {
  region_nom?: string
  province_nom?: string
  nb_comptes_administratifs?: number
}

// Types pour les formulaires (sans les champs auto-générés)
export interface ProvinceFormData {
  code: string
  nom: string
}

export interface RegionFormData {
  code: string
  nom: string
  province_id: number
}

export interface CommuneFormData {
  code: string
  nom: string
  type_commune: 'urbaine' | 'rurale'
  region_id: number
  population?: number | null
  superficie_km2?: number | null
}

// Types legacy pour compatibilité (à supprimer progressivement)
export interface District {
  id: string
  region_id: string
  code: string
  nom: string
  description?: string | null
  population?: number | null
  superficie?: number | null
  chef_lieu?: string | null
  created_at: string
  updated_at: string
  region?: Region
}

export interface DistrictFormData {
  region_id: string
  code: string
  nom: string
  description?: string | null
  population?: number | null
  superficie?: number | null
  chef_lieu?: string | null
}

export interface DistrictWithStats extends District {
  nb_communes?: number
}
