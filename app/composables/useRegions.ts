interface Region {
  id: string
  name: string
  code: string | null
  description: string | null
  createdAt: string
  caseStudiesCount?: number
}

interface RegionPayload {
  name: string
  code: string | null
  description: string | null
}

export function useRegions() {
  // Shared state across all components
  const regions = useState<Region[]>('admin-regions', () => [])
  const isLoading = useState<boolean>('admin-regions-loading', () => false)
  const isLoaded = useState<boolean>('admin-regions-loaded', () => false)

  // Fetch all regions
  async function fetchRegions(force = false) {
    // Don't refetch if already loaded (unless forced)
    if (isLoaded.value && !force) return

    isLoading.value = true
    try {
      const data = await $fetch<Region[]>('/api/admin/regions')
      regions.value = data || []
      isLoaded.value = true
    } catch (error) {
      console.error('Error fetching regions:', error)
      regions.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Fetch public regions (for non-admin pages)
  async function fetchPublicRegions(force = false) {
    if (isLoaded.value && !force) return

    isLoading.value = true
    try {
      const data = await $fetch<Region[]>('/api/regions')
      regions.value = data || []
      isLoaded.value = true
    } catch (error) {
      console.error('Error fetching regions:', error)
      regions.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Create a new region
  async function createRegion(payload: RegionPayload): Promise<void> {
    await $fetch('/api/admin/regions', {
      method: 'POST',
      body: payload
    })
    // Force refresh to sync state
    await fetchRegions(true)
  }

  // Update an existing region
  async function updateRegion(id: string, payload: RegionPayload): Promise<void> {
    await $fetch(`/api/admin/regions/${id}`, {
      method: 'PUT',
      body: payload
    })
    // Force refresh to sync state
    await fetchRegions(true)
  }

  // Delete a region
  async function deleteRegion(id: string): Promise<void> {
    await $fetch(`/api/admin/regions/${id}`, {
      method: 'DELETE'
    })
    // Force refresh to sync state
    await fetchRegions(true)
  }

  // Ensure data is loaded (call this on page mount)
  async function ensureLoaded() {
    if (!isLoaded.value) {
      await fetchRegions()
    }
  }

  return {
    regions,
    isLoading,
    isLoaded,
    fetchRegions,
    fetchPublicRegions,
    createRegion,
    updateRegion,
    deleteRegion,
    ensureLoaded
  }
}
