/**
 * Service pour l'import de données
 */

import { useApi } from './api'

const BASE_PATH = '/api/v1/admin/import'

export interface ImportResult {
  success: boolean
  imported: number
  updated: number
  errors: ImportError[]
  warnings: ImportWarning[]
  duration_ms: number
}

export interface ImportError {
  ligne: number
  colonne?: string
  message: string
  valeur?: string
}

export interface ImportWarning {
  ligne: number
  colonne?: string
  message: string
}

export interface ImportPreview {
  colonnes: string[]
  lignes: Array<Record<string, any>>
  total_lignes: number
  erreurs_validation: ImportError[]
}

export interface ImportOptions {
  commune_id?: string
  annee?: number
  remplacer_existant?: boolean
  ignorer_erreurs?: boolean
}

export const useImportService = () => {
  const api = useApi()

  // ============================================================================
  // IMPORT EXCEL
  // ============================================================================

  /**
   * Prévisualise un fichier Excel avant import
   */
  const previewExcel = async (file: File): Promise<ImportPreview> => {
    return api.upload<ImportPreview>(`${BASE_PATH}/excel/preview`, file)
  }

  /**
   * Importe les données d'un fichier Excel
   */
  const importExcel = async (
    file: File,
    options: ImportOptions
  ): Promise<ImportResult> => {
    return api.upload<ImportResult>(`${BASE_PATH}/excel`, file, options)
  }

  /**
   * Importe les recettes depuis Excel
   */
  const importRecettes = async (
    file: File,
    options: ImportOptions
  ): Promise<ImportResult> => {
    return api.upload<ImportResult>(`${BASE_PATH}/excel/recettes`, file, options)
  }

  /**
   * Importe les dépenses depuis Excel
   */
  const importDepenses = async (
    file: File,
    options: ImportOptions
  ): Promise<ImportResult> => {
    return api.upload<ImportResult>(`${BASE_PATH}/excel/depenses`, file, options)
  }

  /**
   * Importe les revenus miniers depuis Excel
   */
  const importRevenusMiniers = async (
    file: File,
    options: ImportOptions
  ): Promise<ImportResult> => {
    return api.upload<ImportResult>(`${BASE_PATH}/excel/revenus-miniers`, file, options)
  }

  // ============================================================================
  // IMPORT CSV
  // ============================================================================

  /**
   * Prévisualise un fichier CSV
   */
  const previewCSV = async (
    file: File,
    options?: { delimiter?: string; encoding?: string }
  ): Promise<ImportPreview> => {
    return api.upload<ImportPreview>(`${BASE_PATH}/csv/preview`, file, options)
  }

  /**
   * Importe les données d'un fichier CSV
   */
  const importCSV = async (
    file: File,
    options: ImportOptions & { delimiter?: string; encoding?: string }
  ): Promise<ImportResult> => {
    return api.upload<ImportResult>(`${BASE_PATH}/csv`, file, options)
  }

  // ============================================================================
  // TEMPLATES
  // ============================================================================

  /**
   * Télécharge le template Excel pour l'import
   */
  const downloadTemplate = async (
    type: 'recettes' | 'depenses' | 'revenus-miniers' | 'complet'
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/templates/${type}`)
  }

  /**
   * Liste les templates disponibles
   */
  const getTemplates = async (): Promise<Array<{
    type: string
    nom: string
    description: string
    derniere_mise_a_jour: string
  }>> => {
    return api.get<Array<{
      type: string
      nom: string
      description: string
      derniere_mise_a_jour: string
    }>>(`${BASE_PATH}/templates`)
  }

  // ============================================================================
  // HISTORIQUE
  // ============================================================================

  /**
   * Récupère l'historique des imports
   */
  const getHistorique = async (
    params?: { limite?: number; type?: string }
  ): Promise<Array<{
    id: string
    type: string
    fichier_nom: string
    statut: 'succes' | 'partiel' | 'echec'
    imported: number
    errors: number
    date: string
    utilisateur: string
  }>> => {
    return api.get<Array<{
      id: string
      type: string
      fichier_nom: string
      statut: 'succes' | 'partiel' | 'echec'
      imported: number
      errors: number
      date: string
      utilisateur: string
    }>>(`${BASE_PATH}/historique`, params)
  }

  /**
   * Récupère les détails d'un import
   */
  const getImportDetails = async (id: string): Promise<ImportResult & {
    fichier_nom: string
    date: string
    utilisateur: string
  }> => {
    return api.get<ImportResult & {
      fichier_nom: string
      date: string
      utilisateur: string
    }>(`${BASE_PATH}/historique/${id}`)
  }

  return {
    // Excel
    previewExcel,
    importExcel,
    importRecettes,
    importDepenses,
    importRevenusMiniers,

    // CSV
    previewCSV,
    importCSV,

    // Templates
    downloadTemplate,
    getTemplates,

    // Historique
    getHistorique,
    getImportDetails,
  }
}
