import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const keywords = await prisma.keyword.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { caseStudies: true }
      }
    }
  })

  return keywords.map(keyword => ({
    id: keyword.id,
    name: keyword.name,
    slug: keyword.slug,
    description: keyword.description,
    icon: keyword.icon,
    color: keyword.color,
    sortOrder: keyword.sortOrder,
    createdAt: keyword.createdAt,
    updatedAt: keyword.updatedAt,
    caseStudiesCount: keyword._count.caseStudies
  }))
})
