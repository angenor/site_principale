/**
 * Barrel export pour tous les services
 */

// API de base
export * from './api'

// Services par domaine
export { useGeoService } from './geo.service'
export { useComptesAdministratifsService } from './comptes-administratifs.service'
export { useProjetsService } from './projets.service'
export { useDocumentsService } from './documents.service'
export { useUtilisateursService } from './utilisateurs.service'
export { useNewsletterService } from './newsletter.service'
export { useStatistiquesService } from './statistiques.service'
export { useCMSService } from './cms.service'
export { useImportService } from './import.service'
export { useExportService } from './export.service'
export { useTableauxService } from './tableaux.service'
export { usePlanComptableService } from './plan-comptable.service'

// Types réexportés
export type { Societe, SocieteFormData } from './projets.service'
export type { UploadResponse } from './documents.service'
export type { UserFormData, UserWithStats } from './utilisateurs.service'
export type { NewsletterStats } from './newsletter.service'
export type { VisiteStats, PageStats, AuditFilters } from './statistiques.service'
export type {
  PageCMS,
  PageCMSFormData,
  SectionCMS,
  SectionCMSFormData,
  SectionType,
} from './cms.service'
export type {
  ImportResult,
  ImportError,
  ImportWarning,
  ImportPreview,
  ImportOptions,
} from './import.service'
export type { ExportOptions } from './export.service'
