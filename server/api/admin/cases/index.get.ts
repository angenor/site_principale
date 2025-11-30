import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string || ''
  const status = query.status as string || 'all'

  const where: Record<string, unknown> = {}

  // Filtre de recherche
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Filtre par statut
  if (status === 'published') {
    where.isPublished = true
  } else if (status === 'draft') {
    where.isPublished = false
  }

  // Compter le total
  const total = await prisma.caseStudy.count({ where })

  // Récupérer les cas
  const cases = await prisma.caseStudy.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { firstName: true, lastName: true }
      },
      region: {
        select: { name: true }
      },
      categories: {
        include: {
          category: {
            select: { name: true, color: true }
          }
        }
      }
    }
  })

  return {
    data: cases.map(c => ({
      ...c,
      author: c.author ? `${c.author.firstName} ${c.author.lastName}` : null,
      region: c.region?.name || null,
      categories: c.categories.map(cc => cc.category)
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
