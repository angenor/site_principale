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

  const region = await prisma.region.findUnique({
    where: { id },
    include: {
      _count: {
        select: { caseStudies: true }
      }
    }
  })

  if (!region) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Région non trouvée'
    })
  }

  return {
    id: region.id,
    name: region.name,
    code: region.code,
    description: region.description,
    createdAt: region.createdAt,
    caseStudiesCount: region._count.caseStudies
  }
})
