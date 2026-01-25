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

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { caseStudies: true }
      }
    }
  })

  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catégorie non trouvée'
    })
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    color: category.color,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    caseStudiesCount: category._count.caseStudies
  }
})
