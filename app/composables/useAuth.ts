interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'EDITOR'
}

interface LoginCredentials {
  email: string
  password: string
}

// État global de l'authentification
const user = ref<User | null>(null)
const isLoading = ref(false)
const isInitialized = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`
  })

  // Initialiser l'état d'authentification
  async function init() {
    if (isInitialized.value) return

    isLoading.value = true
    try {
      const { data } = await useFetch<User>('/api/auth/me', {
        key: 'auth-user'
      })
      user.value = data.value
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  // Se connecter
  async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    try {
      const response = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      user.value = response.user
      return { success: true }
    } catch (error: unknown) {
      const err = error as { data?: { statusMessage?: string } }
      return {
        success: false,
        error: err.data?.statusMessage || 'Erreur de connexion'
      }
    } finally {
      isLoading.value = false
    }
  }

  // Se déconnecter
  async function logout() {
    isLoading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      isLoading.value = false
      // Rediriger vers la page de connexion
      navigateTo('/admin/login')
    }
  }

  // Rafraîchir les informations utilisateur
  async function refresh() {
    try {
      const data = await $fetch<User>('/api/auth/me')
      user.value = data
    } catch {
      user.value = null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isAdmin,
    isLoading: readonly(isLoading),
    isInitialized: readonly(isInitialized),
    fullName,
    init,
    login,
    logout,
    refresh
  }
}
