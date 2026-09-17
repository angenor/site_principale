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

  const existing = await prisma.newsCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { news: true }
      }
    }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catégorie d\'actualité non trouvée'
    })
  }

  if (existing._count.news > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Impossible de supprimer : cette catégorie est utilisée par ${existing._count.news} actualité(s)`
    })
  }

  await prisma.newsCategory.delete({
    where: { id }
  })

  return {
    success: true,
    message: 'Catégorie d\'actualité supprimée'
  }
})
