import type { RubriqueBudgetaire, RubriqueBudgetaireFormData } from '~/types/comptes-administratifs'

export const useRubriquesBudgetaires = () => {
  const supabase = useSupabaseClient()

  /**
   * Récupérer toutes les rubriques budgétaires
   */
  const fetchRubriquesBudgetaires = async (filters?: {
    type?: string
    section?: string
    est_active?: boolean
  }): Promise<RubriqueBudgetaire[]> => {
    let query = supabase
      .from('rubriques_budgetaires')
      .select(`
        *,
        categorie:categories_rubriques(id, code, nom)
      `)
      .order('ordre', { ascending: true })

    // Appliquer les filtres
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.section) {
      query = query.eq('section', filters.section)
    }
    if (filters?.est_active !== undefined) {
      query = query.eq('est_active', filters.est_active)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des rubriques budgétaires:', error)
      throw error
    }

    return data || []
  }

  /**
   * Récupérer une rubrique par ID
   */
  const fetchRubriqueById = async (id: string): Promise<RubriqueBudgetaire | null> => {
    const { data, error } = await supabase
      .from('rubriques_budgetaires')
      .select(`
        *,
        categorie:categories_rubriques(id, code, nom)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur lors de la récupération de la rubrique:', error)
      throw error
    }

    return data
  }

  /**
   * Créer une nouvelle rubrique
   */
  const createRubrique = async (rubriqueData: RubriqueBudgetaireFormData): Promise<RubriqueBudgetaire> => {
    const { data, error } = await supabase
      .from('rubriques_budgetaires')
      .insert(rubriqueData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de la rubrique:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour une rubrique
   */
  const updateRubrique = async (id: string, rubriqueData: Partial<RubriqueBudgetaireFormData>): Promise<RubriqueBudgetaire> => {
    const { data, error } = await supabase
      .from('rubriques_budgetaires')
      .update(rubriqueData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour de la rubrique:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer une rubrique
   */
  const deleteRubrique = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('rubriques_budgetaires')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression de la rubrique:', error)
      throw error
    }
  }

  /**
   * Activer/Désactiver une rubrique
   */
  const toggleRubriqueActive = async (id: string, est_active: boolean): Promise<RubriqueBudgetaire> => {
    const { data, error } = await supabase
      .from('rubriques_budgetaires')
      .update({ est_active })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors du changement d\'état de la rubrique:', error)
      throw error
    }

    return data
  }

  return {
    fetchRubriquesBudgetaires,
    fetchRubriqueById,
    createRubrique,
    updateRubrique,
    deleteRubrique,
    toggleRubriqueActive
  }
}
