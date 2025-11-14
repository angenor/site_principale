import type { NewsletterSubscriber, NewsletterSubscriberFormData } from '~/types/autres-modules'

export const useNewsletter = () => {
  const supabase = useSupabaseClient()

  const fetchSubscribers = async (filters?: { statut?: string }): Promise<NewsletterSubscriber[]> => {
    let query = supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })

    if (filters?.statut) query = query.eq('statut', filters.statut)

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  const updateSubscriber = async (id: string, subscriberData: Partial<NewsletterSubscriberFormData>): Promise<NewsletterSubscriber> => {
    const { data, error } = await supabase.from('newsletter_subscribers').update(subscriberData).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  const deleteSubscriber = async (id: string): Promise<void> => {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
    if (error) throw error
  }

  return { fetchSubscribers, updateSubscriber, deleteSubscriber }
}
