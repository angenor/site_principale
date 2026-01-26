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

  const keyword = await prisma.keyword.findUnique({
    where: { id },
    include: {
      _count: {
        select: { caseStudies: true }
      }
    }
  })

  if (!keyword) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Mot-clé non trouvé'
    })
  }

  return {
    id: keyword.id,
    name: keyword.name,
    slug: keyword.slug,
    description: keyword.description,
    icon: keyword.icon,
    color: keyword.color,
    sortOrder: keyword.sortOrder,
    createdAt: keyword.createdAt,
    caseStudiesCount: keyword._count.caseStudies
  }
})
