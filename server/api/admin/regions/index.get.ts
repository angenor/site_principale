import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const search = query.search as string | undefined

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      }
    : {}

  const regions = await prisma.region.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { caseStudies: true }
      }
    }
  })

  return regions.map(region => ({
    id: region.id,
    name: region.name,
    code: region.code,
    description: region.description,
    createdAt: region.createdAt,
    caseStudiesCount: region._count.caseStudies
  }))
})
