// ============================================================================
// Types pour les Comptes Administratifs
// Basés sur le schéma SQL dans bank/modele_de_donnees/schema.sql
// ============================================================================

export interface CompteAdministratif {
  id: string
  commune_id?: string | null
  district_id?: string | null
  region_id?: string | null
  annee: number
  statut: 'brouillon' | 'valide' | 'publie' | 'archive'
  date_validation?: string | null
  date_publication?: string | null
  validateur_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  created_by?: string | null
  // Relations
  commune?: {
    id: string
    code: string
    nom: string
  }
  district?: {
    id: string
    code: string
    nom: string
  }
  region?: {
    id: string
    code: string
    nom: string
  }
}

export interface CategorieRubrique {
  id: string
  code: string
  nom: string
  type: 'recette' | 'depense' | 'equilibre'
  section?: 'fonctionnement' | 'investissement' | 'ordre' | 'equilibre' | null
  parent_id?: string | null
  ordre: number
  description?: string | null
  created_at: string
  // Relations
  parent?: CategorieRubrique
  children?: CategorieRubrique[]
}

export interface RubriqueBudgetaire {
  id: string
  code: string
  intitule: string
  categorie_id?: string | null
  type: 'recette' | 'depense' | 'equilibre'
  section?: 'fonctionnement' | 'investissement' | 'ordre' | 'equilibre' | null
  parent_id?: string | null
  niveau: number
  ordre: number
  est_calculee: boolean
  formule_calcul?: string | null
  est_active: boolean
  description?: string | null
  created_at: string
  updated_at: string
  // Relations
  categorie?: CategorieRubrique
  parent?: RubriqueBudgetaire
  children?: RubriqueBudgetaire[]
}

export interface ColonneDynamique {
  id: string
  code: string
  nom: string
  type_donnee: 'montant' | 'pourcentage' | 'texte' | 'date' | 'nombre'
  ordre: number
  est_calculee: boolean
  formule_calcul?: string | null
  format_affichage?: string | null
  est_active: boolean
  description?: string | null
  created_at: string
  updated_at: string
}

export interface LigneBudgetaire {
  id: string
  compte_administratif_id: string
  rubrique_id: string
  valeurs: Record<string, any> // JSON flexible
  notes?: string | null
  created_at: string
  updated_at: string
  updated_by?: string | null
  // Relations
  compte_administratif?: CompteAdministratif
  rubrique?: RubriqueBudgetaire
}

// Types pour les formulaires
export interface CompteAdministratifFormData {
  commune_id?: string | null
  district_id?: string | null
  region_id?: string | null
  annee: number
  statut: 'brouillon' | 'valide' | 'publie' | 'archive'
  notes?: string | null
}

export interface CategorieRubriqueFormData {
  code: string
  nom: string
  type: 'recette' | 'depense' | 'equilibre'
  section?: 'fonctionnement' | 'investissement' | 'ordre' | 'equilibre' | null
  parent_id?: string | null
  ordre: number
  description?: string | null
}

export interface RubriqueBudgetaireFormData {
  code: string
  intitule: string
  categorie_id?: string | null
  type: 'recette' | 'depense' | 'equilibre'
  section?: 'fonctionnement' | 'investissement' | 'ordre' | 'equilibre' | null
  parent_id?: string | null
  niveau: number
  ordre: number
  est_calculee: boolean
  formule_calcul?: string | null
  est_active: boolean
  description?: string | null
}

export interface ColonneDynamiqueFormData {
  code: string
  nom: string
  type_donnee: 'montant' | 'pourcentage' | 'texte' | 'date' | 'nombre'
  ordre: number
  est_calculee: boolean
  formule_calcul?: string | null
  format_affichage?: string | null
  est_active: boolean
  description?: string | null
}

export interface LigneBudgetaireFormData {
  compte_administratif_id: string
  rubrique_id: string
  valeurs: Record<string, any>
  notes?: string | null
}

// Types pour les statistiques et vues
export interface CompteAdministratifWithStats extends CompteAdministratif {
  nombre_lignes?: number
  collectivite_nom?: string
  collectivite_type?: 'commune' | 'district' | 'region'
}

export interface RubriqueBudgetaireHierarchique extends RubriqueBudgetaire {
  children: RubriqueBudgetaireHierarchique[]
  depth: number
}
