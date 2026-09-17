import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const sortOrder = (query.sort as string) || 'recent'
  const categorySlug = (query.category as string) || ''

  const where = {
    isPublished: true,
    ...(categorySlug ? { category: { slug: categorySlug } } : {})
  }

  const orderBy: any = sortOrder === 'oldest'
    ? { publishedAt: 'asc' }
    : { publishedAt: 'desc' }

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverImage: true,
        externalUrl: true,
        publishedAt: true,
        keywords: true,
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    }),
    prisma.news.count({ where })
  ])

  return {
    data: news,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
