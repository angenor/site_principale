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

  const existing = await prisma.audioVideoCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { items: true }
      }
    }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catégorie d\'audio/vidéo non trouvée'
    })
  }

  if (existing._count.items > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Impossible de supprimer : cette catégorie est utilisée par ${existing._count.items} audio(s)/vidéo(s)`
    })
  }

  await prisma.audioVideoCategory.delete({
    where: { id }
  })

  return {
    success: true,
    message: 'Catégorie d\'audio/vidéo supprimée'
  }
})
