/**
 * Composable pour la gestion d'état asynchrone
 * Gère le chargement, les erreurs et les données avec retry automatique
 */

import type { ApiError } from '~/services/api'

export interface UseAsyncStateOptions<T> {
  immediate?: boolean
  initialData?: T
  resetOnExecute?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
  retryCount?: number
  retryDelay?: number
}

export interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  isRefreshing: boolean
  error: ApiError | null
  isError: boolean
  isSuccess: boolean
  executedAt: Date | null
}

export const useAsyncState = <T, P extends any[] = []>(
  asyncFn: (...args: P) => Promise<T>,
  options: UseAsyncStateOptions<T> = {}
) => {
  const {
    immediate = false,
    initialData = null,
    resetOnExecute = false,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options

  const toast = useAppToast()

  // État
  const state = reactive<AsyncState<T>>({
    data: initialData as T | null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    isError: false,
    isSuccess: false,
    executedAt: null,
  })

  // Compteur de retry
  let currentRetry = 0

  // Exécuter la fonction asynchrone
  const execute = async (...args: P): Promise<T | null> => {
    // Reset l'état si demandé
    if (resetOnExecute) {
      state.data = initialData as T | null
      state.error = null
      state.isError = false
      state.isSuccess = false
    }

    // Définir l'état de chargement
    if (state.data) {
      state.isRefreshing = true
    } else {
      state.isLoading = true
    }

    try {
      const result = await asyncFn(...args)

      state.data = result
      state.error = null
      state.isError = false
      state.isSuccess = true
      state.executedAt = new Date()
      currentRetry = 0

      onSuccess?.(result)

      return result
    } catch (err: any) {
      const error: ApiError = {
        status: err?.status || 500,
        message: err?.message || 'Une erreur est survenue',
        detail: err?.detail,
        errors: err?.errors,
      }

      // Retry si configuré
      if (currentRetry < retryCount) {
        currentRetry++
        await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetry))
        return execute(...args)
      }

      state.error = error
      state.isError = true
      state.isSuccess = false

      onError?.(error)

      return null
    } finally {
      state.isLoading = false
      state.isRefreshing = false
    }
  }

  // Rafraîchir les données
  const refresh = async (...args: P): Promise<T | null> => {
    return execute(...args)
  }

  // Réinitialiser l'état
  const reset = () => {
    state.data = initialData as T | null
    state.isLoading = false
    state.isRefreshing = false
    state.error = null
    state.isError = false
    state.isSuccess = false
    state.executedAt = null
    currentRetry = 0
  }

  // Définir les données manuellement
  const setData = (data: T) => {
    state.data = data
    state.isSuccess = true
    state.isError = false
    state.error = null
  }

  // Exécution immédiate si demandée
  if (immediate) {
    execute(...([] as unknown as P))
  }

  return {
    // État
    ...toRefs(state),

    // Actions
    execute,
    refresh,
    reset,
    setData,
  }
}

/**
 * Composable pour la gestion de liste avec pagination et filtres intégrés
 */
export const useAsyncList = <T, F extends Record<string, any> = {}>(
  fetchFn: (params: Record<string, any>) => Promise<{ items: T[]; total: number; page: number; limit: number; pages: number }>,
  options: {
    defaultFilters?: Partial<F>
    defaultLimit?: number
    immediate?: boolean
  } = {}
) => {
  const {
    defaultFilters = {} as Partial<F>,
    defaultLimit = 20,
    immediate = true,
  } = options

  const pagination = usePagination({ defaultLimit })
  const filters = useFilters<F>({ defaultFilters })

  const items = ref<T[]>([]) as Ref<T[]>
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const error = ref<ApiError | null>(null)

  // Charger les données
  const load = async () => {
    const params = {
      ...pagination.getParams(),
      ...filters.getParams(),
    }

    if (items.value.length > 0) {
      isRefreshing.value = true
    } else {
      isLoading.value = true
    }
    error.value = null

    try {
      const response = await fetchFn(params)
      items.value = response.items
      pagination.updateFromResponse(response)
    } catch (err: any) {
      error.value = {
        status: err?.status || 500,
        message: err?.message || 'Erreur lors du chargement',
        detail: err?.detail,
      }
    } finally {
      isLoading.value = false
      isRefreshing.value = false
    }
  }

  // Rafraîchir
  const refresh = () => load()

  // Réinitialiser et recharger
  const reset = () => {
    pagination.reset()
    filters.clearAllFilters()
    load()
  }

  // Watch pagination changes
  watch(
    () => [pagination.page.value, pagination.limit.value, pagination.sortBy.value, pagination.sortOrder.value],
    () => load(),
    { deep: true }
  )

  // Watch filter changes
  watch(
    () => filters.activeFilters.value,
    () => {
      pagination.goToPage(1) // Reset to first page on filter change
      load()
    },
    { deep: true }
  )

  // Charger immédiatement si demandé
  if (immediate) {
    load()
  }

  return {
    // Données
    items,
    isLoading,
    isRefreshing,
    error,

    // Pagination
    pagination,

    // Filtres
    filters,

    // Actions
    load,
    refresh,
    reset,
  }
}
