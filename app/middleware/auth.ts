export default defineNuxtRouteMiddleware(async (to) => {
  // Ne pas vérifier l'auth pour la page de login
  if (to.path === '/admin/login') {
    return
  }

  const { isAuthenticated, init, isInitialized } = useAuth()

  // Initialiser l'auth si nécessaire
  if (!isInitialized.value) {
    await init()
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated.value) {
    return navigateTo('/admin/login')
  }
})
