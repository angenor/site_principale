interface Keyword {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  createdAt: string
  updatedAt: string
  caseStudiesCount?: number
}

interface KeywordPayload {
  name: string
  slug?: string
  description: string | null
  icon: string | null
  color: string | null
}

export function useKeywords() {
  // Shared state across all components
  const keywords = useState<Keyword[]>('admin-keywords', () => [])
  const isLoading = useState<boolean>('admin-keywords-loading', () => false)
  const isLoaded = useState<boolean>('admin-keywords-loaded', () => false)

  // Fetch all keywords (admin)
  async function fetchKeywords(force = false) {
    // Don't refetch if already loaded (unless forced)
    if (isLoaded.value && !force) return

    isLoading.value = true
    try {
      const data = await $fetch<Keyword[]>('/api/admin/keywords')
      keywords.value = data || []
      isLoaded.value = true
    } catch (error) {
      console.error('Error fetching keywords:', error)
      keywords.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Fetch public keywords (for non-admin pages)
  async function fetchPublicKeywords(force = false) {
    if (isLoaded.value && !force) return

    isLoading.value = true
    try {
      const data = await $fetch<Keyword[]>('/api/keywords')
      keywords.value = data || []
      isLoaded.value = true
    } catch (error) {
      console.error('Error fetching keywords:', error)
      keywords.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Create a new keyword
  async function createKeyword(payload: KeywordPayload): Promise<void> {
    await $fetch('/api/admin/keywords', {
      method: 'POST',
      body: payload
    })
    // Force refresh to sync state
    await fetchKeywords(true)
  }

  // Update an existing keyword
  async function updateKeyword(id: string, payload: KeywordPayload): Promise<void> {
    await $fetch(`/api/admin/keywords/${id}`, {
      method: 'PUT',
      body: payload
    })
    // Force refresh to sync state
    await fetchKeywords(true)
  }

  // Delete a keyword
  async function deleteKeyword(id: string): Promise<void> {
    await $fetch(`/api/admin/keywords/${id}`, {
      method: 'DELETE'
    })
    // Force refresh to sync state
    await fetchKeywords(true)
  }

  // Ensure data is loaded (call this on page mount)
  async function ensureLoaded() {
    if (!isLoaded.value) {
      await fetchKeywords()
    }
  }

  return {
    keywords,
    isLoading,
    isLoaded,
    fetchKeywords,
    fetchPublicKeywords,
    createKeyword,
    updateKeyword,
    deleteKeyword,
    ensureLoaded
  }
}
