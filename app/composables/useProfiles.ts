import type { Profile, ProfileFormData, ActivityLog } from '~/types/autres-modules'

export const useProfiles = () => {
  const supabase = useSupabaseClient()

  const fetchProfiles = async (filters?: { role?: string; est_actif?: boolean }): Promise<Profile[]> => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

    if (filters?.role) query = query.eq('role', filters.role)
    if (filters?.est_actif !== undefined) query = query.eq('est_actif', filters.est_actif)

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  const updateProfile = async (id: string, profileData: Partial<ProfileFormData>): Promise<Profile> => {
    const { data, error } = await supabase.from('profiles').update(profileData).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  const deleteProfile = async (id: string): Promise<void> => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) throw error
  }

  const fetchActivityLogs = async (filters?: { user_id?: string; table_name?: string }): Promise<ActivityLog[]> => {
    let query = supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100)

    if (filters?.user_id) query = query.eq('user_id', filters.user_id)
    if (filters?.table_name) query = query.eq('table_name', filters.table_name)

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  return { fetchProfiles, updateProfile, deleteProfile, fetchActivityLogs }
}
