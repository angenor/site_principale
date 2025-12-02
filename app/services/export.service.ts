/**
 * Service pour l'export de données
 */

const BASE_PATH = '/api/v1/export'

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf' | 'word'
  colonnes?: string[]
  filtres?: Record<string, any>
  titre?: string
  sous_titre?: string
  inclure_logo?: boolean
}

export const useExportService = () => {
  const api = useApi()

  // ============================================================================
  // EXPORT COMPTES ADMINISTRATIFS
  // ============================================================================

  /**
   * Exporte un compte administratif complet
   */
  const exportCompteAdministratif = async (
    compteId: string,
    options?: Partial<ExportOptions>
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/compte-administratif/${compteId}`, {
      format: options?.format || 'xlsx',
      ...options,
    })
  }

  /**
   * Exporte les recettes d'un compte
   */
  const exportRecettes = async (
    compteId: string,
    options?: Partial<ExportOptions>
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/compte-administratif/${compteId}/recettes`, {
      format: options?.format || 'xlsx',
      ...options,
    })
  }

  /**
   * Exporte les dépenses d'un compte
   */
  const exportDepenses = async (
    compteId: string,
    options?: Partial<ExportOptions>
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/compte-administratif/${compteId}/depenses`, {
      format: options?.format || 'xlsx',
      ...options,
    })
  }

  // ============================================================================
  // EXPORT DONNÉES GÉOGRAPHIQUES
  // ============================================================================

  /**
   * Exporte les communes
   */
  const exportCommunes = async (
    options?: Partial<ExportOptions> & { region_id?: string; district_id?: string }
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/communes`, {
      format: options?.format || 'xlsx',
      ...options,
    })
  }

  /**
   * Exporte les données d'une commune spécifique
   */
  const exportCommuneData = async (
    communeId: string,
    options?: Partial<ExportOptions> & { annees?: number[] }
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/commune/${communeId}`, {
      format: options?.format || 'xlsx',
      ...options,
    })
  }

  // ============================================================================
  // EXPORT REVENUS MINIERS
  // ============================================================================

  /**
   * Exporte les revenus miniers
   */
  const exportRevenusMiniers = async (
    options?: Partial<ExportOptions> & {
      annee?: number
      projet_id?: string
      commune_id?: string
      type_revenu?: string
    }
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/revenus-miniers`, {
      format: options?.format || 'xlsx',
      ...options,
    })
  }

  /**
   * Exporte les projets miniers
   */
  const exportProjetsMiniers = async (
    options?: Partial<ExportOptions> & {
      statut?: string
      region_id?: string
    }
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/projets-miniers`, {
      format: options?.format || 'xlsx',
      ...options,
    })
  }

  // ============================================================================
  // EXPORT STATISTIQUES
  // ============================================================================

  /**
   * Exporte le rapport de statistiques
   */
  const exportStatistiques = async (
    options?: Partial<ExportOptions> & {
      periode?: '7j' | '30j' | '90j' | '1an'
      type?: 'visites' | 'telechargements' | 'complet'
    }
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/statistiques`, {
      format: options?.format || 'xlsx',
      ...options,
    })
  }

  // ============================================================================
  // GÉNÉRATION DE RAPPORTS
  // ============================================================================

  /**
   * Génère un rapport Word pour un compte administratif
   */
  const generateRapportWord = async (
    compteId: string,
    options?: {
      inclure_graphiques?: boolean
      inclure_analyses?: boolean
      template?: string
    }
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/rapport-word/${compteId}`, options)
  }

  /**
   * Génère un rapport PDF pour un compte administratif
   */
  const generateRapportPDF = async (
    compteId: string,
    options?: {
      inclure_graphiques?: boolean
      inclure_analyses?: boolean
      orientation?: 'portrait' | 'landscape'
    }
  ): Promise<Blob> => {
    return api.download(`${BASE_PATH}/rapport-pdf/${compteId}`, options)
  }

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  /**
   * Déclenche le téléchargement d'un Blob
   */
  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Génère un nom de fichier avec date
   */
  const generateFilename = (prefix: string, extension: string): string => {
    const date = new Date().toISOString().split('T')[0]
    return `${prefix}_${date}.${extension}`
  }

  return {
    // Comptes administratifs
    exportCompteAdministratif,
    exportRecettes,
    exportDepenses,

    // Géographie
    exportCommunes,
    exportCommuneData,

    // Revenus miniers
    exportRevenusMiniers,
    exportProjetsMiniers,

    // Statistiques
    exportStatistiques,

    // Rapports
    generateRapportWord,
    generateRapportPDF,

    // Utilitaires
    downloadBlob,
    generateFilename,
  }
}
