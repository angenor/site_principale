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

  const existing = await prisma.keyword.findUnique({
    where: { id },
    include: {
      _count: {
        select: { caseStudies: true }
      }
    }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Mot-clé non trouvé'
    })
  }

  // Check if keyword is used
  if (existing._count.caseStudies > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Impossible de supprimer : ce mot-clé est utilisé par ${existing._count.caseStudies} étude(s) de cas`
    })
  }

  await prisma.keyword.delete({
    where: { id }
  })

  return {
    success: true,
    message: 'Mot-clé supprimé'
  }
})
