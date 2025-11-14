import type { Document, DocumentFormData } from '~/types/autres-modules'

export const useDocuments = () => {
  const supabase = useSupabaseClient()

  const fetchDocuments = async (filters?: { type_fichier?: string; est_public?: boolean }): Promise<Document[]> => {
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false })

    if (filters?.type_fichier) query = query.eq('type_fichier', filters.type_fichier)
    if (filters?.est_public !== undefined) query = query.eq('est_public', filters.est_public)

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  const createDocument = async (documentData: DocumentFormData): Promise<Document> => {
    const { data, error } = await supabase.from('documents').insert(documentData).select().single()
    if (error) throw error
    return data
  }

  const updateDocument = async (id: string, documentData: Partial<DocumentFormData>): Promise<Document> => {
    const { data, error } = await supabase.from('documents').update(documentData).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  const deleteDocument = async (id: string): Promise<void> => {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (error) throw error
  }

  return { fetchDocuments, createDocument, updateDocument, deleteDocument }
}
