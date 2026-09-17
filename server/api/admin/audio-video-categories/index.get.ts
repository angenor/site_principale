import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const categories = await prisma.audioVideoCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { items: true }
      }
    }
  })

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    color: cat.color,
    sortOrder: cat.sortOrder,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
    itemCount: cat._count.items
  }))
})
