import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAdmin(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID requis' })
  }

  // Prevent self-deletion
  if (id === auth.userId) {
    throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas supprimer votre propre compte' })
  }

  const existing = await prisma.user.findUnique({ where: { id } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur non trouvé' })
  }

  // Prevent deleting last admin
  if (existing.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })
    if (adminCount <= 1) {
      throw createError({ statusCode: 400, statusMessage: 'Impossible de supprimer le dernier administrateur' })
    }
  }

  await prisma.user.delete({ where: { id } })

  return { success: true }
})
