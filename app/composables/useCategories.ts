interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  caseStudiesCount?: number
}

interface CategoryPayload {
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
}

export function useCategories() {
  // Shared state across all components
  const categories = useState<Category[]>('admin-categories', () => [])
  const isLoading = useState<boolean>('admin-categories-loading', () => false)
  const isLoaded = useState<boolean>('admin-categories-loaded', () => false)

  // Fetch all categories (admin)
  async function fetchCategories(force = false) {
    // Don't refetch if already loaded (unless forced)
    if (isLoaded.value && !force) return

    isLoading.value = true
    try {
      const data = await $fetch<Category[]>('/api/admin/categories')
      categories.value = data || []
      isLoaded.value = true
    } catch (error) {
      console.error('Error fetching categories:', error)
      categories.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Fetch public categories (for non-admin pages)
  async function fetchPublicCategories(force = false) {
    if (isLoaded.value && !force) return

    isLoading.value = true
    try {
      const data = await $fetch<Category[]>('/api/categories')
      categories.value = data || []
      isLoaded.value = true
    } catch (error) {
      console.error('Error fetching categories:', error)
      categories.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Create a new category
  async function createCategory(payload: CategoryPayload): Promise<void> {
    await $fetch('/api/admin/categories', {
      method: 'POST',
      body: payload
    })
    // Force refresh to sync state
    await fetchCategories(true)
  }

  // Update an existing category
  async function updateCategory(id: string, payload: CategoryPayload): Promise<void> {
    await $fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: payload
    })
    // Force refresh to sync state
    await fetchCategories(true)
  }

  // Delete a category
  async function deleteCategory(id: string): Promise<void> {
    await $fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    })
    // Force refresh to sync state
    await fetchCategories(true)
  }

  // Ensure data is loaded (call this on page mount)
  async function ensureLoaded() {
    if (!isLoaded.value) {
      await fetchCategories()
    }
  }

  return {
    categories,
    isLoading,
    isLoaded,
    fetchCategories,
    fetchPublicCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    ensureLoaded
  }
}
