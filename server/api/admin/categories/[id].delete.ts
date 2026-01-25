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

  const existing = await prisma.category.findUnique({
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
      statusMessage: 'Catégorie non trouvée'
    })
  }

  // Check if category is used
  if (existing._count.caseStudies > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Impossible de supprimer : cette catégorie est utilisée par ${existing._count.caseStudies} étude(s) de cas`
    })
  }

  await prisma.category.delete({
    where: { id }
  })

  return {
    success: true,
    message: 'Catégorie supprimée'
  }
})
