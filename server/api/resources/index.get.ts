import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 12
  const sortOrder = (query.sort as string) || 'recent'
  const categoryId = (query.category as string) || ''

  const orderBy: Record<string, string> = sortOrder === 'oldest'
    ? { publishedAt: 'asc' }
    : { publishedAt: 'desc' }

  const where: Record<string, unknown> = {
    isPublished: true
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  const [resources, total, categories] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        coverImage: true,
        fileUrl: true,
        filename: true,
        mimeType: true,
        fileSize: true,
        downloadCount: true,
        publishedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true
          }
        }
      }
    }),
    prisma.resource.count({ where }),
    prisma.resourceCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        _count: {
          select: { resources: true }
        }
      }
    })
  ])

  return {
    data: resources,
    categories: categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      color: cat.color,
      count: cat._count.resources
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
