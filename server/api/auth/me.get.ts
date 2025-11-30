import prisma from '../../utils/prisma'
import { getAuthUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const authUser = await getAuthUser(event)

  if (!authUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
    })
  }

  // Récupérer les infos complètes de l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLoginAt: true
    }
  })

  if (!user || !user.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Utilisateur non trouvé ou désactivé'
    })
  }

  return user
})
