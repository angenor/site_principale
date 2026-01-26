import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = (query.search as string) || ''
  const status = (query.status as string) || 'all'
  const categoryId = (query.category as string) || ''

  const skip = (page - 1) * limit

  // Build where clause
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { filename: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (status === 'published') {
    where.isPublished = true
  } else if (status === 'draft') {
    where.isPublished = false
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  const [resources, total, categories] = await Promise.all([
    prisma.resource.findMany({
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
    prisma.resource.count({ where }),
    prisma.resourceCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true }
    })
  ])

  return {
    data: resources.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      coverImage: item.coverImage,
      fileUrl: item.fileUrl,
      filename: item.filename,
      mimeType: item.mimeType,
      fileSize: item.fileSize,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt,
      downloadCount: item.downloadCount,
      createdAt: item.createdAt,
      author: item.author ? `${item.author.firstName} ${item.author.lastName}` : null,
      category: item.category
    })),
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
