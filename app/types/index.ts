/**
 * Types globaux de l'application
 */

// ============================================================================
// TYPES DE BASE
// ============================================================================

export interface BaseEntity {
  id: string
  created_at: string
  updated_at?: string
}

// ============================================================================
// GÉOGRAPHIE
// ============================================================================

export interface Region extends BaseEntity {
  nom: string
  code?: string
  province_id?: string
  nombre_districts?: number
  nombre_communes?: number
}

export interface District extends BaseEntity {
  nom: string
  code?: string
  region_id: string
  region?: Region
  nombre_communes?: number
}

export interface Commune extends BaseEntity {
  nom: string
  code?: string
  district_id: string
  district?: District
  region_id?: string
  region?: Region
  population?: number
  superficie?: number
  type?: 'urbaine' | 'rurale'
}

// ============================================================================
// COMPTES ADMINISTRATIFS
// ============================================================================

export interface CompteAdministratif extends BaseEntity {
  commune_id: string
  commune?: Commune
  exercice: number
  statut: 'brouillon' | 'en_revision' | 'valide' | 'publie'
  total_recettes?: number
  total_depenses?: number
  solde?: number
  date_validation?: string
  valide_par?: string
  notes?: string
}

export interface LigneCompte extends BaseEntity {
  compte_administratif_id: string
  rubrique_id: string
  rubrique?: Rubrique
  prevision?: number
  realisation?: number
  ecart?: number
  taux_execution?: number
}

export interface Rubrique extends BaseEntity {
  code: string
  libelle: string
  type: 'recette' | 'depense'
  categorie_id?: string
  categorie?: CategorieRubrique
  parent_id?: string
  niveau?: number
  ordre?: number
}

export interface CategorieRubrique extends BaseEntity {
  code: string
  libelle: string
  type: 'recette' | 'depense'
  ordre?: number
}

export interface ColonneCompte extends BaseEntity {
  code: string
  libelle: string
  type: 'montant' | 'pourcentage' | 'texte'
  ordre: number
  visible?: boolean
  editable?: boolean
}

// ============================================================================
// PROJETS MINIERS
// ============================================================================

export interface SocieteMiniere extends BaseEntity {
  nom: string
  sigle?: string
  pays_origine?: string
  adresse?: string
  email?: string
  telephone?: string
  site_web?: string
  logo_url?: string
  actif?: boolean
}

export interface ProjetMinier extends BaseEntity {
  nom: string
  code?: string
  societe_id: string
  societe?: SocieteMiniere
  commune_id: string
  commune?: Commune
  type_minerai?: string
  statut: 'exploration' | 'exploitation' | 'suspendu' | 'ferme'
  date_debut?: string
  date_fin?: string
  superficie_ha?: number
  description?: string
  coordonnees?: {
    latitude: number
    longitude: number
  }
}

export interface RevenuMinier extends BaseEntity {
  projet_id: string
  projet?: ProjetMinier
  commune_id: string
  commune?: Commune
  exercice: number
  montant: number
  type: 'redevance' | 'ristourne' | 'taxe' | 'autre'
  date_paiement?: string
  reference?: string
  notes?: string
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export interface Document extends BaseEntity {
  titre: string
  description?: string
  type: 'rapport' | 'compte_administratif' | 'deliberation' | 'carte' | 'autre'
  fichier_url: string
  fichier_nom: string
  fichier_taille?: number
  fichier_type?: string
  commune_id?: string
  commune?: Commune
  exercice?: number
  public?: boolean
  telechargements?: number
  uploaded_by?: string
}

// ============================================================================
// UTILISATEURS
// ============================================================================

export type RoleUtilisateur = 'admin' | 'editeur' | 'lecteur' | 'super_admin'

export interface Utilisateur extends BaseEntity {
  email: string
  nom: string
  prenom?: string
  role: RoleUtilisateur
  actif: boolean
  avatar_url?: string
  derniere_connexion?: string
  communes_autorisees?: string[]
  regions_autorisees?: string[]
}

export interface SessionUtilisateur extends BaseEntity {
  user_id: string
  ip_address?: string
  user_agent?: string
  expires_at: string
  active: boolean
}

// ============================================================================
// NEWSLETTER
// ============================================================================

export interface AbonneNewsletter extends BaseEntity {
  email: string
  nom?: string
  actif: boolean
  source?: string
  date_inscription: string
  date_desinscription?: string
  preferences?: {
    frequence?: 'quotidien' | 'hebdomadaire' | 'mensuel'
    categories?: string[]
  }
}

// ============================================================================
// STATISTIQUES ET DASHBOARD
// ============================================================================

export interface DashboardStats {
  communes_avec_donnees: number
  communes_total: number
  total_recettes: number
  total_depenses: number
  projets_miniers_actifs: number
  evolution_recettes: number
  evolution_depenses: number
  evolution_projets: number
  // Propriétés alternatives du backend
  total_collectivites?: number
  total_projets_miniers?: number
  total_comptes_administratifs?: number
  total_utilisateurs?: number
  comptes_par_statut?: Record<string, number>
  revenus_par_annee?: Array<{ annee: number; total: number }>
  projets_actifs?: number
}

export interface ActivityLog extends BaseEntity {
  action: 'create' | 'update' | 'delete' | 'import' | 'export' | 'login' | 'logout' | 'view'
  table_name?: string
  record_id?: string
  description?: string
  user_id?: string
  user_name?: string
  user_nom?: string  // @deprecated - use user_name
  user_email?: string
  ip_address?: string
  user_agent?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  metadata?: Record<string, any>
}

export interface AnalyticsVisite extends BaseEntity {
  page_url: string
  page_titre?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  pays?: string
  region?: string
  ville?: string
  duree_secondes?: number
  user_id?: string
}

// ============================================================================
// CMS
// ============================================================================

export type TypeSection =
  | 'texte'
  | 'hero'
  | 'editorjs'
  | 'grille_cartes'
  | 'banniere'
  | 'galerie_photos'
  | 'timeline'
  | 'accordion'
  | 'onglets'
  | 'temoignages'

export interface PageCMS extends BaseEntity {
  slug: string
  titre: string
  description?: string
  meta_title?: string
  meta_description?: string
  og_image?: string
  publie: boolean
  ordre?: number
  sections?: SectionCMS[]
}

export interface SectionCMS extends BaseEntity {
  page_id: string
  type: TypeSection
  titre?: string
  sous_titre?: string
  contenu: Record<string, any>
  ordre: number
  visible: boolean
  classes_css?: string
}

// ============================================================================
// IMPORT / EXPORT
// ============================================================================

export interface ImportHistorique extends BaseEntity {
  fichier_nom: string
  fichier_type: 'xlsx' | 'csv'
  type_donnees: 'comptes_administratifs' | 'communes' | 'projets' | 'revenus'
  statut: 'en_cours' | 'termine' | 'erreur' | 'annule'
  lignes_total?: number
  lignes_importees?: number
  lignes_erreur?: number
  erreurs?: Array<{
    ligne: number
    message: string
    details?: string
  }>
  user_id: string
  user_nom?: string
  duree_ms?: number
}

export interface ExportRequest {
  type_donnees: string
  format: 'xlsx' | 'csv' | 'pdf' | 'docx'
  filtres?: Record<string, any>
  colonnes?: string[]
}

// ============================================================================
// RÉPONSES API
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface ApiError {
  status: number
  message: string
  detail?: string
  errors?: Record<string, string[]>
}

// ============================================================================
// TABLEAUX FINANCIERS (Comptes Administratifs)
// ============================================================================

export * from './tableaux'
