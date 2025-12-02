/**
 * Configuration centrale de l'API
 * Fournit une instance $fetch configurée avec authentification et gestion d'erreurs
 */

// Types pour les réponses paginées
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

// Types pour les paramètres de requête
export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined
}

// Type pour les erreurs API
export interface ApiError {
  status: number
  message: string
  detail?: string
  errors?: Record<string, string[]>
}

// Options de requête API
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, any>
  skipAuth?: boolean
}

/**
 * Composable pour accéder à l'API
 * Utilise le token d'authentification de useAuth
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl as string
  const { getAuthHeaders, refreshAccessToken, logout } = useAuth()
  const toast = useToast()

  /**
   * Construit l'URL avec les paramètres de requête
   */
  const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  /**
   * Effectue une requête API avec gestion des erreurs et refresh token
   */
  const request = async <T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> => {
    const { params, skipAuth = false, ...fetchOptions } = options

    const url = buildUrl(endpoint, params)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    // Ajouter le token d'authentification si nécessaire
    if (!skipAuth) {
      Object.assign(headers, getAuthHeaders())
    }

    try {
      return await $fetch<T>(url, {
        ...fetchOptions,
        headers,
      })
    } catch (error: any) {
      // Gérer l'erreur 401 (non autorisé)
      if (error?.status === 401 && !skipAuth) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          // Réessayer avec le nouveau token
          Object.assign(headers, getAuthHeaders())
          return await $fetch<T>(url, {
            ...fetchOptions,
            headers,
          })
        } else {
          // Déconnexion si le refresh échoue
          await logout()
          throw createApiError(401, 'Session expirée. Veuillez vous reconnecter.')
        }
      }

      // Transformer l'erreur en format standardisé
      throw handleApiError(error)
    }
  }

  /**
   * Méthodes HTTP simplifiées
   */
  const get = <T>(endpoint: string, params?: Record<string, any>, options?: ApiRequestOptions): Promise<T> => {
    return request<T>(endpoint, { ...options, method: 'GET', params })
  }

  const post = <T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> => {
    return request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) })
  }

  const put = <T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> => {
    return request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) })
  }

  const patch = <T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> => {
    return request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) })
  }

  const del = <T>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
    return request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Upload de fichier
   */
  const upload = async <T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    options?: ApiRequestOptions
  ): Promise<T> => {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
        }
      })
    }

    const { params, skipAuth = false, ...fetchOptions } = options || {}
    const url = buildUrl(endpoint, params)

    const headers: Record<string, string> = {}
    if (!skipAuth) {
      Object.assign(headers, getAuthHeaders())
    }

    try {
      return await $fetch<T>(url, {
        ...fetchOptions,
        method: 'POST',
        headers,
        body: formData,
      })
    } catch (error: any) {
      throw handleApiError(error)
    }
  }

  /**
   * Téléchargement de fichier (retourne un Blob)
   */
  const download = async (
    endpoint: string,
    params?: Record<string, any>,
    options?: ApiRequestOptions
  ): Promise<Blob> => {
    const { skipAuth = false, ...fetchOptions } = options || {}
    const url = buildUrl(endpoint, params)

    const headers: Record<string, string> = {}
    if (!skipAuth) {
      Object.assign(headers, getAuthHeaders())
    }

    try {
      return await $fetch<Blob>(url, {
        ...fetchOptions,
        method: 'GET',
        headers,
        responseType: 'blob',
      })
    } catch (error: any) {
      throw handleApiError(error)
    }
  }

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    download,
    baseUrl,
  }
}

/**
 * Crée une erreur API standardisée
 */
export const createApiError = (status: number, message: string, detail?: string): ApiError => ({
  status,
  message,
  detail,
})

/**
 * Transforme une erreur brute en ApiError
 */
export const handleApiError = (error: any): ApiError => {
  // Erreur $fetch de Nuxt
  if (error?.data) {
    return {
      status: error.status || 500,
      message: error.data?.detail || error.data?.message || 'Une erreur est survenue',
      detail: error.data?.detail,
      errors: error.data?.errors,
    }
  }

  // Erreur réseau
  if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
    return {
      status: 0,
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
    }
  }

  // Erreur générique
  return {
    status: error?.status || 500,
    message: error?.message || 'Une erreur inattendue est survenue',
  }
}

/**
 * Formate les paramètres de pagination pour l'API
 */
export const formatPaginationParams = (params: PaginationParams): Record<string, any> => {
  const result: Record<string, any> = {}

  if (params.page !== undefined) result.page = params.page
  if (params.limit !== undefined) result.limit = params.limit
  if (params.sort_by) result.sort_by = params.sort_by
  if (params.sort_order) result.sort_order = params.sort_order

  return result
}
