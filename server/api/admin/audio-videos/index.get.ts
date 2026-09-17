import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { audioVideoCategorySelect } from '../../../utils/resources'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = Math.max(parseInt(query.page as string) || 1, 1)
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 10, 1), 100)
  const search = (query.search as string) || ''
  const status = (query.status as string) || 'all'
  const categoryId = (query.category as string) || ''

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { speakers: { has: search } }
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

  const [items, total, categories] = await Promise.all([
    prisma.audioVideo.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ publishedAt: { sort: 'desc', nulls: 'first' } }, { createdAt: 'desc' }],
      include: {
        category: audioVideoCategorySelect
      }
    }),
    prisma.audioVideo.count({ where }),
    prisma.audioVideoCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ])

  return {
    data: items,
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
