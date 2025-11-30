export default defineEventHandler(async (event) => {
  // Supprimer le cookie d'authentification
  deleteCookie(event, 'auth_token')

  return { success: true }
})
