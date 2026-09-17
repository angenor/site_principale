import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { formatNewsAuthors } from '../../../utils/news'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = (query.search as string) || ''
  const status = (query.status as string) || 'all'
  const categoryId = (query.categoryId as string) || ''

  const skip = (page - 1) * limit

  // Build where clause
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { keywords: { has: search } },
      { authors: { has: search } }
    ]
  }

  if (status === 'published') {
    where.isPublished = true
  } else if (status === 'draft') {
    where.isPublished = false
  }

  if (categoryId === 'none') {
    where.categoryId = null
  } else if (categoryId) {
    where.categoryId = categoryId
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
        },
        category: {
          select: { id: true, name: true, color: true, icon: true }
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
      category: item.category,
      authors: item.authors,
      keywords: item.keywords,
      author: formatNewsAuthors(item.authors, item.author)
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
