/**
 * Service pour la gestion des utilisateurs
 */

import type { PaginatedResponse, PaginationParams } from './api'
import { useApi } from './api'
import type { User, Role, Session } from '~/types/auth'

const BASE_PATH = '/api/v1/admin/utilisateurs'
const ROLES_PATH = '/api/v1/admin/roles'

export interface UserFormData {
  email: string
  nom: string
  prenom?: string
  password?: string
  role_id: string
  commune_id?: string
  actif?: boolean
}

export interface UserWithStats extends User {
  nombre_connexions?: number
  derniere_activite?: string
}

export const useUtilisateursService = () => {
  const api = useApi()

  // ============================================================================
  // UTILISATEURS
  // ============================================================================

  const getUtilisateurs = async (
    params?: PaginationParams & {
      role_id?: string
      role_code?: string
      commune_id?: string
      actif?: boolean
      search?: string
    }
  ): Promise<PaginatedResponse<UserWithStats>> => {
    return api.get<PaginatedResponse<UserWithStats>>(BASE_PATH, params)
  }

  const getUtilisateur = async (id: string): Promise<User> => {
    return api.get<User>(`${BASE_PATH}/${id}`)
  }

  const createUtilisateur = async (data: UserFormData): Promise<User> => {
    return api.post<User>(BASE_PATH, data)
  }

  const updateUtilisateur = async (id: string, data: Partial<UserFormData>): Promise<User> => {
    return api.put<User>(`${BASE_PATH}/${id}`, data)
  }

  const deleteUtilisateur = async (id: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${id}`)
  }

  const activerUtilisateur = async (id: string): Promise<User> => {
    return api.post<User>(`${BASE_PATH}/${id}/activer`)
  }

  const desactiverUtilisateur = async (id: string): Promise<User> => {
    return api.post<User>(`${BASE_PATH}/${id}/desactiver`)
  }

  const resetPassword = async (id: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`${BASE_PATH}/${id}/reset-password`)
  }

  const setPassword = async (id: string, password: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`${BASE_PATH}/${id}/set-password`, { password })
  }

  // ============================================================================
  // SESSIONS
  // ============================================================================

  const getSessions = async (userId: string): Promise<Session[]> => {
    return api.get<Session[]>(`${BASE_PATH}/${userId}/sessions`)
  }

  const revokeSession = async (userId: string, sessionId: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${userId}/sessions/${sessionId}`)
  }

  const revokeAllSessions = async (userId: string): Promise<void> => {
    return api.delete<void>(`${BASE_PATH}/${userId}/sessions`)
  }

  // ============================================================================
  // RÔLES
  // ============================================================================

  const getRoles = async (): Promise<Role[]> => {
    return api.get<Role[]>(ROLES_PATH)
  }

  const getRole = async (id: string): Promise<Role> => {
    return api.get<Role>(`${ROLES_PATH}/${id}`)
  }

  const createRole = async (data: Omit<Role, 'id'>): Promise<Role> => {
    return api.post<Role>(ROLES_PATH, data)
  }

  const updateRole = async (id: string, data: Partial<Role>): Promise<Role> => {
    return api.put<Role>(`${ROLES_PATH}/${id}`, data)
  }

  const deleteRole = async (id: string): Promise<void> => {
    return api.delete<void>(`${ROLES_PATH}/${id}`)
  }

  // ============================================================================
  // PROFIL (utilisateur connecté)
  // ============================================================================

  const getMonProfil = async (): Promise<User> => {
    return api.get<User>('/api/v1/auth/me')
  }

  const updateMonProfil = async (data: Partial<UserFormData>): Promise<User> => {
    return api.put<User>('/api/v1/auth/me', data)
  }

  const getMesSessions = async (): Promise<Session[]> => {
    return api.get<Session[]>('/api/v1/auth/sessions')
  }

  const revokerMaSession = async (sessionId: string): Promise<void> => {
    return api.delete<void>(`/api/v1/auth/sessions/${sessionId}`)
  }

  return {
    // Utilisateurs
    getUtilisateurs,
    getUtilisateur,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
    activerUtilisateur,
    desactiverUtilisateur,
    resetPassword,
    setPassword,

    // Sessions
    getSessions,
    revokeSession,
    revokeAllSessions,

    // Rôles
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,

    // Profil
    getMonProfil,
    updateMonProfil,
    getMesSessions,
    revokerMaSession,
  }
}
