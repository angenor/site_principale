import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const existing = await prisma.reportCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { reports: true }
      }
    }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catégorie de signalement non trouvée'
    })
  }

  if (existing._count.reports > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Impossible de supprimer : cette catégorie est utilisée par ${existing._count.reports} signalement(s)`
    })
  }

  await prisma.reportCategory.delete({
    where: { id }
  })

  return {
    success: true,
    message: 'Catégorie de signalement supprimée'
  }
})
