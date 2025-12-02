/**
 * Composable pour la gestion des filtres
 * Gère l'état des filtres et la synchronisation avec l'URL
 */

export interface UseFiltersOptions<T extends Record<string, any>> {
  defaultFilters?: Partial<T>
  syncWithUrl?: boolean
  debounceMs?: number
}

export const useFilters = <T extends Record<string, any>>(
  options: UseFiltersOptions<T> = {}
) => {
  const {
    defaultFilters = {} as Partial<T>,
    syncWithUrl = true,
    debounceMs = 300,
  } = options

  const route = useRoute()
  const router = useRouter()

  // État des filtres
  const filters = reactive<T>({ ...defaultFilters } as T)

  // Filtres actifs (non vides)
  const activeFilters = computed(() => {
    const active: Partial<T> = {}
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length === 0) continue
        active[key as keyof T] = value
      }
    }
    return active
  })

  // Nombre de filtres actifs
  const activeCount = computed(() => Object.keys(activeFilters.value).length)

  // Debounce pour la synchronisation URL
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // Initialiser depuis l'URL
  const initFromUrl = () => {
    if (syncWithUrl && import.meta.client) {
      const query = route.query
      for (const key of Object.keys(defaultFilters)) {
        if (query[key] !== undefined) {
          const value = query[key]
          // Essayer de parser les valeurs
          if (value === 'true') {
            (filters as any)[key] = true
          } else if (value === 'false') {
            (filters as any)[key] = false
          } else if (!isNaN(Number(value)) && value !== '') {
            (filters as any)[key] = Number(value)
          } else if (typeof value === 'string' && value.includes(',')) {
            (filters as any)[key] = value.split(',')
          } else {
            (filters as any)[key] = value
          }
        }
      }
    }
  }

  // Synchroniser avec l'URL (debounced)
  const syncToUrl = () => {
    if (!syncWithUrl || !import.meta.client) return

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      const query: Record<string, string> = {}

      // Garder les paramètres de pagination existants
      const existingQuery = route.query
      if (existingQuery.page) query.page = existingQuery.page as string
      if (existingQuery.limit) query.limit = existingQuery.limit as string
      if (existingQuery.sort_by) query.sort_by = existingQuery.sort_by as string
      if (existingQuery.sort_order) query.sort_order = existingQuery.sort_order as string

      // Ajouter les filtres actifs
      for (const [key, value] of Object.entries(activeFilters.value)) {
        if (Array.isArray(value)) {
          query[key] = value.join(',')
        } else {
          query[key] = String(value)
        }
      }

      router.replace({ query })
    }, debounceMs)
  }

  // Définir un filtre
  const setFilter = <K extends keyof T>(key: K, value: T[K]) => {
    (filters as any)[key] = value
    syncToUrl()
  }

  // Définir plusieurs filtres
  const setFilters = (newFilters: Partial<T>) => {
    Object.assign(filters, newFilters)
    syncToUrl()
  }

  // Supprimer un filtre
  const clearFilter = <K extends keyof T>(key: K) => {
    const defaultValue = defaultFilters[key]
    if (defaultValue !== undefined) {
      (filters as any)[key] = defaultValue
    } else {
      delete (filters as any)[key]
    }
    syncToUrl()
  }

  // Réinitialiser tous les filtres
  const clearAllFilters = () => {
    for (const key of Object.keys(filters)) {
      const defaultValue = defaultFilters[key as keyof T]
      if (defaultValue !== undefined) {
        (filters as any)[key] = defaultValue
      } else {
        (filters as any)[key] = undefined
      }
    }
    syncToUrl()
  }

  // Vérifier si un filtre est actif
  const isFilterActive = <K extends keyof T>(key: K): boolean => {
    const value = filters[key]
    const defaultValue = defaultFilters[key]

    if (value === undefined || value === null || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    if (value === defaultValue) return false

    return true
  }

  // Obtenir les paramètres pour l'API
  const getParams = (): Record<string, any> => {
    return { ...activeFilters.value }
  }

  // Créer une chaîne de recherche pour les filtres
  const toQueryString = (): string => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(activeFilters.value)) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)))
      } else {
        params.append(key, String(value))
      }
    }
    return params.toString()
  }

  // Watch pour détecter les changements manuels de route
  if (syncWithUrl && import.meta.client) {
    watch(
      () => route.query,
      () => {
        initFromUrl()
      },
      { deep: true }
    )
  }

  // Initialiser
  initFromUrl()

  return {
    // État
    filters,
    activeFilters,
    activeCount,

    // Actions
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    isFilterActive,
    getParams,
    toQueryString,
  }
}
