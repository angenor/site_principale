/**
 * Composable pour la gestion de la pagination
 * Gère l'état de pagination et la synchronisation avec l'URL
 */

import type { PaginationParams, PaginatedResponse } from '~/services/api'

export interface UsePaginationOptions {
  defaultPage?: number
  defaultLimit?: number
  defaultSortBy?: string
  defaultSortOrder?: 'asc' | 'desc'
  syncWithUrl?: boolean
  limitOptions?: number[]
}

export interface PaginationState {
  page: number
  limit: number
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  total: number
  pages: number
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 20,
    defaultSortBy = null,
    defaultSortOrder = 'asc',
    syncWithUrl = true,
    limitOptions = [10, 20, 50, 100],
  } = options

  const route = useRoute()
  const router = useRouter()

  // État de pagination
  const state = reactive<PaginationState>({
    page: defaultPage,
    limit: defaultLimit,
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder,
    total: 0,
    pages: 0,
  })

  // Initialiser depuis l'URL si syncWithUrl est activé
  const initFromUrl = () => {
    if (syncWithUrl && import.meta.client) {
      const query = route.query
      if (query.page) state.page = parseInt(query.page as string) || defaultPage
      if (query.limit) state.limit = parseInt(query.limit as string) || defaultLimit
      if (query.sort_by) state.sortBy = query.sort_by as string
      if (query.sort_order) state.sortOrder = (query.sort_order as 'asc' | 'desc') || defaultSortOrder
    }
  }

  // Synchroniser avec l'URL
  const syncToUrl = () => {
    if (syncWithUrl && import.meta.client) {
      const query: Record<string, string> = { ...route.query as Record<string, string> }

      // Ne pas ajouter les valeurs par défaut
      if (state.page !== defaultPage) {
        query.page = String(state.page)
      } else {
        delete query.page
      }

      if (state.limit !== defaultLimit) {
        query.limit = String(state.limit)
      } else {
        delete query.limit
      }

      if (state.sortBy) {
        query.sort_by = state.sortBy
        query.sort_order = state.sortOrder
      } else {
        delete query.sort_by
        delete query.sort_order
      }

      router.replace({ query })
    }
  }

  // Actions de pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= state.pages) {
      state.page = page
      syncToUrl()
    }
  }

  const nextPage = () => {
    if (state.page < state.pages) {
      goToPage(state.page + 1)
    }
  }

  const prevPage = () => {
    if (state.page > 1) {
      goToPage(state.page - 1)
    }
  }

  const firstPage = () => {
    goToPage(1)
  }

  const lastPage = () => {
    goToPage(state.pages)
  }

  const setLimit = (limit: number) => {
    state.limit = limit
    state.page = 1 // Reset to first page
    syncToUrl()
  }

  const setSort = (sortBy: string, sortOrder?: 'asc' | 'desc') => {
    if (state.sortBy === sortBy && !sortOrder) {
      // Toggle sort order
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
      state.sortBy = sortBy
      state.sortOrder = sortOrder || 'asc'
    }
    state.page = 1 // Reset to first page
    syncToUrl()
  }

  const clearSort = () => {
    state.sortBy = null
    state.sortOrder = 'asc'
    syncToUrl()
  }

  // Mettre à jour depuis une réponse API
  const updateFromResponse = <T>(response: PaginatedResponse<T>) => {
    state.total = response.total
    state.pages = response.pages
    state.page = response.page
    state.limit = response.limit
  }

  // Obtenir les paramètres pour l'API
  const getParams = (): PaginationParams => {
    const params: PaginationParams = {
      page: state.page,
      limit: state.limit,
    }

    if (state.sortBy) {
      params.sort_by = state.sortBy
      params.sort_order = state.sortOrder
    }

    return params
  }

  // Computed properties
  const hasNextPage = computed(() => state.page < state.pages)
  const hasPrevPage = computed(() => state.page > 1)
  const isFirstPage = computed(() => state.page === 1)
  const isLastPage = computed(() => state.page === state.pages)

  const startItem = computed(() => {
    if (state.total === 0) return 0
    return (state.page - 1) * state.limit + 1
  })

  const endItem = computed(() => {
    return Math.min(state.page * state.limit, state.total)
  })

  const pageNumbers = computed(() => {
    const pages: number[] = []
    const maxVisible = 5
    const half = Math.floor(maxVisible / 2)

    let start = Math.max(1, state.page - half)
    let end = Math.min(state.pages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })

  // Reset pagination
  const reset = () => {
    state.page = defaultPage
    state.limit = defaultLimit
    state.sortBy = defaultSortBy
    state.sortOrder = defaultSortOrder
    state.total = 0
    state.pages = 0
    syncToUrl()
  }

  // Initialiser
  initFromUrl()

  return {
    // État
    ...toRefs(state),

    // Computed
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage,
    startItem,
    endItem,
    pageNumbers,
    limitOptions,

    // Actions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setLimit,
    setSort,
    clearSort,
    updateFromResponse,
    getParams,
    reset,
  }
}
