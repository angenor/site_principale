import type { CompteAdministratif, CompteAdministratifFormData, CompteAdministratifWithStats } from '~/types/comptes-administratifs'

export const useComptesAdministratifs = () => {
  const supabase = useSupabaseClient()

  /**
   * Récupérer tous les comptes administratifs
   */
  const fetchComptesAdministratifs = async (filters?: {
    commune_id?: string
    district_id?: string
    region_id?: string
    annee?: number
    statut?: string
  }): Promise<CompteAdministratifWithStats[]> => {
    let query = supabase
      .from('comptes_administratifs')
      .select(`
        *,
        commune:communes(id, code, nom),
        district:districts(id, code, nom),
        region:regions(id, code, nom)
      `)
      .order('annee', { ascending: false })
      .order('created_at', { ascending: false })

    // Appliquer les filtres
    if (filters?.commune_id) {
      query = query.eq('commune_id', filters.commune_id)
    }
    if (filters?.district_id) {
      query = query.eq('district_id', filters.district_id)
    }
    if (filters?.region_id) {
      query = query.eq('region_id', filters.region_id)
    }
    if (filters?.annee) {
      query = query.eq('annee', filters.annee)
    }
    if (filters?.statut) {
      query = query.eq('statut', filters.statut)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des comptes administratifs:', error)
      throw error
    }

    // Enrichir les données
    return (data || []).map(compte => ({
      ...compte,
      collectivite_nom: compte.commune?.nom || compte.district?.nom || compte.region?.nom || 'N/A',
      collectivite_type: compte.commune_id ? 'commune' : compte.district_id ? 'district' : 'region'
    }))
  }

  /**
   * Récupérer un compte administratif par ID
   */
  const fetchCompteAdministratifById = async (id: string): Promise<CompteAdministratif | null> => {
    const { data, error } = await supabase
      .from('comptes_administratifs')
      .select(`
        *,
        commune:communes(id, code, nom),
        district:districts(id, code, nom),
        region:regions(id, code, nom)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération du compte administratif:', error)
      throw error
    }

    return data
  }

  /**
   * Créer un nouveau compte administratif
   */
  const createCompteAdministratif = async (compteData: CompteAdministratifFormData): Promise<CompteAdministratif> => {
    const { data, error } = await supabase
      .from('comptes_administratifs')
      .insert(compteData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du compte administratif:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour un compte administratif
   */
  const updateCompteAdministratif = async (id: string, compteData: Partial<CompteAdministratifFormData>): Promise<CompteAdministratif> => {
    const { data, error } = await supabase
      .from('comptes_administratifs')
      .update(compteData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour du compte administratif:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer un compte administratif
   */
  const deleteCompteAdministratif = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('comptes_administratifs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression du compte administratif:', error)
      throw error
    }
  }

  /**
   * Changer le statut d'un compte
   */
  const changerStatutCompte = async (id: string, nouveauStatut: 'brouillon' | 'valide' | 'publie' | 'archive'): Promise<CompteAdministratif> => {
    const updateData: any = { statut: nouveauStatut }

    if (nouveauStatut === 'valide') {
      updateData.date_validation = new Date().toISOString()
    } else if (nouveauStatut === 'publie') {
      updateData.date_publication = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('comptes_administratifs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors du changement de statut:', error)
      throw error
    }

    return data
  }

  /**
   * Récupérer les années disponibles
   */
  const fetchAnneesDisponibles = async (): Promise<number[]> => {
    const { data, error } = await supabase
      .from('comptes_administratifs')
      .select('annee')
      .order('annee', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des années:', error)
      throw error
    }

    const uniqueYears = [...new Set(data?.map(item => item.annee) || [])]
    return uniqueYears.sort((a, b) => b - a)
  }

  return {
    fetchComptesAdministratifs,
    fetchCompteAdministratifById,
    createCompteAdministratif,
    updateCompteAdministratif,
    deleteCompteAdministratif,
    changerStatutCompte,
    fetchAnneesDisponibles
  }
}
