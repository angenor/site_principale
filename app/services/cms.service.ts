/**
 * Service pour la gestion du CMS
 * Pages et Sections de comptes administratifs
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'

const BASE_PATH = '/api/v1/admin/cms'

// ============================================================================
// TYPES
// ============================================================================

export interface PageCMS {
  id: string
  compte_administratif_id: string
  titre: string
  slug: string
  description?: string
  statut: 'brouillon' | 'publie' | 'archive'
  date_publication?: string
  meta_title?: string
  meta_description?: string
  ordre: number
  created_at: string
  updated_at: string
  created_by?: string
  // Relations
  compte_administratif?: {
    id: string
    annee: number
    commune?: { id: string; nom: string }
  }
  sections?: SectionCMS[]
}

export interface PageCMSFormData {
  compte_administratif_id: string
  titre: string
  slug?: string
  description?: string
  statut?: 'brouillon' | 'publie' | 'archive'
  meta_title?: string
  meta_description?: string
  ordre?: number
}

export type SectionType =
  | 'editorjs'
  | 'bloc_image_gauche'
  | 'bloc_image_droite'
  | 'carte_fond_image'
  | 'grille_cartes'
  | 'galerie_photos'
  | 'liens_utiles'
  | 'note_informative'
  | 'tableau_financier'
  | 'graphiques_analytiques'

export interface SectionCMS {
  id: string
  page_id: string
  type: SectionType
  titre?: string
  contenu: Record<string, any>
  ordre: number
  est_visible: boolean
  created_at: string
  updated_at: string
}

export interface SectionCMSFormData {
  page_id: string
  type: SectionType
  titre?: string
  contenu: Record<string, any>
  ordre?: number
  est_visible?: boolean
}

// Contenu spécifique par type de section
export interface EditorJSContent {
  blocks: any[]
  version?: string
}

export interface ImageTextContent {
  image_url: string
  image_alt?: string
  titre?: string
  texte: string
}

export interface CardContent {
  titre: string
  description?: string
  icone?: string
  lien?: string
  image_url?: string
}

export interface GrilleCartesContent {
  cartes: CardContent[]
  colonnes?: number
}

export interface GaleriePhotosContent {
  images: Array<{
    url: string
    alt?: string
    legende?: string
  }>
}

export interface LiensUtilesContent {
  liens: Array<{
    titre: string
    url: string
    description?: string
    icone?: string
  }>
}

export interface NoteInformativeContent {
  type: 'info' | 'warning' | 'success' | 'error'
  titre?: string
  contenu: string
}

export interface TableauFinancierContent {
  tableau_id?: string
  type: 'recettes' | 'depenses' | 'equilibre'
  colonnes_visibles?: string[]
}

export interface GraphiquesContent {
  type: 'bar' | 'line' | 'pie' | 'donut'
  titre?: string
  donnees_source: 'recettes' | 'depenses' | 'revenus_miniers'
  options?: Record<string, any>
}

export const useCMSService = () => {
  const api = useApi()

  // ============================================================================
  // PAGES
  // ============================================================================

  const getPages = async (
    params?: PaginationParams & {
      compte_administratif_id?: string
      statut?: 'brouillon' | 'publie' | 'archive'
      search?: string
    }
  ): Promise<PaginatedResponse<PageCMS>> => {
    return api.get<PaginatedResponse<PageCMS>>(`${BASE_PATH}/pages`, params)
  }

  const getPage = async (id: string): Promise<PageCMS> => {
    return api.get<PageCMS>(`${BASE_PATH}/pages/${id}`)
  }

  const getPageBySlug = async (slug: string): Promise<PageCMS> => {
    return api.get<PageCMS>(`${BASE_PATH}/pages/slug/${slug}`)
  }

  const createPage = async (data: PageCMSFormData): Promise<PageCMS> => {
    return api.post<PageCMS>(`${BASE_PATH}/pages`, data)
  }

  const updatePage = async (id: string, data: Partial<PageCMSFormData>): Promise<PageCMS> => {
    return api.put<PageCMS>(`${BASE_PATH}/pages/${id}`, data)
  }

  const deletePage = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/pages/${id}`)
  }

  const publierPage = async (id: string): Promise<PageCMS> => {
    return api.post<PageCMS>(`${BASE_PATH}/pages/${id}/publier`)
  }

  const archiverPage = async (id: string): Promise<PageCMS> => {
    return api.post<PageCMS>(`${BASE_PATH}/pages/${id}/archiver`)
  }

  const dupliquerPage = async (id: string): Promise<PageCMS> => {
    return api.post<PageCMS>(`${BASE_PATH}/pages/${id}/dupliquer`)
  }

  const previewPage = async (id: string): Promise<string> => {
    const response = await api.get<{ preview_url: string }>(`${BASE_PATH}/pages/${id}/preview`)
    return response.preview_url
  }

  // ============================================================================
  // SECTIONS
  // ============================================================================

  const getSections = async (pageId: string): Promise<SectionCMS[]> => {
    return api.get<SectionCMS[]>(`${BASE_PATH}/pages/${pageId}/sections`)
  }

  const getSection = async (pageId: string, sectionId: string): Promise<SectionCMS> => {
    return api.get<SectionCMS>(`${BASE_PATH}/pages/${pageId}/sections/${sectionId}`)
  }

  const createSection = async (pageId: string, data: Omit<SectionCMSFormData, 'page_id'>): Promise<SectionCMS> => {
    return api.post<SectionCMS>(`${BASE_PATH}/pages/${pageId}/sections`, { ...data, page_id: pageId })
  }

  const updateSection = async (
    pageId: string,
    sectionId: string,
    data: Partial<SectionCMSFormData>
  ): Promise<SectionCMS> => {
    return api.put<SectionCMS>(`${BASE_PATH}/pages/${pageId}/sections/${sectionId}`, data)
  }

  const deleteSection = async (pageId: string, sectionId: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/pages/${pageId}/sections/${sectionId}`)
  }

  const reorderSections = async (
    pageId: string,
    ordres: Array<{ id: string; ordre: number }>
  ): Promise<void> => {
    return api.put<void>(`${BASE_PATH}/pages/${pageId}/sections/reorder`, { ordres })
  }

  const toggleSectionVisibility = async (pageId: string, sectionId: string): Promise<SectionCMS> => {
    return api.post<SectionCMS>(`${BASE_PATH}/pages/${pageId}/sections/${sectionId}/toggle-visibility`)
  }

  const dupliquerSection = async (pageId: string, sectionId: string): Promise<SectionCMS> => {
    return api.post<SectionCMS>(`${BASE_PATH}/pages/${pageId}/sections/${sectionId}/dupliquer`)
  }

  // ============================================================================
  // TYPES DE SECTIONS
  // ============================================================================

  const getSectionTypes = (): Array<{ value: SectionType; label: string; description: string }> => {
    return [
      { value: 'editorjs', label: 'Éditeur de texte', description: 'Contenu texte riche avec blocs' },
      { value: 'bloc_image_gauche', label: 'Image à gauche', description: 'Image avec texte à droite' },
      { value: 'bloc_image_droite', label: 'Image à droite', description: 'Image avec texte à gauche' },
      { value: 'carte_fond_image', label: 'Carte avec fond', description: 'Carte avec image de fond' },
      { value: 'grille_cartes', label: 'Grille de cartes', description: 'Collection de cartes informatives' },
      { value: 'galerie_photos', label: 'Galerie photos', description: 'Galerie d\'images' },
      { value: 'liens_utiles', label: 'Liens utiles', description: 'Liste de liens' },
      { value: 'note_informative', label: 'Note informative', description: 'Encadré d\'information' },
      { value: 'tableau_financier', label: 'Tableau financier', description: 'Tableau de données budgétaires' },
      { value: 'graphiques_analytiques', label: 'Graphiques', description: 'Visualisations de données' },
    ]
  }

  return {
    // Pages
    getPages,
    getPage,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    publierPage,
    archiverPage,
    dupliquerPage,
    previewPage,

    // Sections
    getSections,
    getSection,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    toggleSectionVisibility,
    dupliquerSection,

    // Types
    getSectionTypes,
  }
}
