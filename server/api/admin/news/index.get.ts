import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = (query.search as string) || ''
  const status = (query.status as string) || 'all'

  const skip = (page - 1) * limit

  // Build where clause
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (status === 'published') {
    where.isPublished = true
  } else if (status === 'draft') {
    where.isPublished = false
  }

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { firstName: true, lastName: true }
        }
      }
    }),
    prisma.news.count({ where })
  ])

  return {
    data: news.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      coverImage: item.coverImage,
      externalUrl: item.externalUrl,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt,
      viewCount: item.viewCount,
      createdAt: item.createdAt,
      label: item.label,
      labelExpiresAt: item.labelExpiresAt,
      author: item.author ? `${item.author.firstName} ${item.author.lastName}` : null
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
