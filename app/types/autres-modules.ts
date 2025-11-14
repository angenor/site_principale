// ============================================================================
// Types pour les autres modules (Documents, Newsletter, Utilisateurs, etc.)
// Basés sur le schéma SQL dans bank/modele_de_donnees/schema.sql
// ============================================================================

// ============================================================================
// DOCUMENTS
// ============================================================================
export interface Document {
  id: string
  compte_administratif_id?: string | null
  titre: string
  description?: string | null
  type_fichier: 'excel' | 'word' | 'pdf' | 'autre'
  fichier_url: string
  fichier_nom: string
  taille_fichier?: number | null
  nombre_telechargements: number
  est_public: boolean
  tags?: string[] | null
  uploaded_by?: string | null
  created_at: string
  updated_at: string
}

export interface DocumentFormData {
  compte_administratif_id?: string | null
  titre: string
  description?: string | null
  type_fichier: 'excel' | 'word' | 'pdf' | 'autre'
  fichier_url: string
  fichier_nom: string
  taille_fichier?: number | null
  est_public: boolean
  tags?: string[]
}

// ============================================================================
// NEWSLETTER
// ============================================================================
export interface NewsletterSubscriber {
  id: string
  email: string
  nom?: string | null
  prenom?: string | null
  organisation?: string | null
  statut: 'actif' | 'inactif' | 'desabonne'
  preferences?: Record<string, any> | null
  token_confirmation?: string | null
  date_confirmation?: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriberFormData {
  email: string
  nom?: string | null
  prenom?: string | null
  organisation?: string | null
  statut: 'actif' | 'inactif' | 'desabonne'
}

// ============================================================================
// UTILISATEURS
// ============================================================================
export interface Profile {
  id: string
  email: string
  nom?: string | null
  prenom?: string | null
  role: 'administrateur' | 'editeur' | 'lecteur'
  organisation?: string | null
  telephone?: string | null
  avatar_url?: string | null
  bio?: string | null
  permissions?: Record<string, any> | null
  est_actif: boolean
  derniere_connexion?: string | null
  created_at: string
  updated_at: string
}

export interface ProfileFormData {
  email: string
  nom?: string | null
  prenom?: string | null
  role: 'administrateur' | 'editeur' | 'lecteur'
  organisation?: string | null
  telephone?: string | null
  bio?: string | null
  est_actif: boolean
}

export interface ActivityLog {
  id: string
  user_id?: string | null
  action: string
  table_name?: string | null
  record_id?: string | null
  old_values?: Record<string, any> | null
  new_values?: Record<string, any> | null
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
}

// ============================================================================
// MESSAGERIE
// ============================================================================
export interface MessageSecurise {
  id: string
  expediteur_id?: string | null
  destinataire_id?: string | null
  sujet?: string | null
  contenu: string
  est_chiffre: boolean
  est_lu: boolean
  date_lecture?: string | null
  fichiers_joints?: string[] | null
  expiration_date?: string | null
  created_at: string
  // Relations
  expediteur?: Profile
  destinataire?: Profile
}

export interface MessageSecuriseFormData {
  destinataire_id: string
  sujet?: string | null
  contenu: string
  fichiers_joints?: string[]
}

// ============================================================================
// ANALYTICS
// ============================================================================
export interface AnalyticsVisite {
  id: string
  session_id?: string | null
  page_url: string
  commune_id?: string | null
  district_id?: string | null
  region_id?: string | null
  user_agent?: string | null
  ip_address?: string | null
  referrer?: string | null
  pays?: string | null
  ville?: string | null
  duree_visite?: number | null
  created_at: string
}

export interface AnalyticsTelechargement {
  id: string
  document_id: string
  session_id?: string | null
  user_id?: string | null
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
  // Relations
  document?: Document
}

// ============================================================================
// STATISTIQUES
// ============================================================================
export interface DashboardStats {
  total_collectivites: number
  total_projets_miniers: number
  total_comptes_administratifs: number
  total_utilisateurs: number
  comptes_par_statut: Record<string, number>
  revenus_par_annee: Array<{ annee: number; total: number }>
  projets_actifs: number
}
