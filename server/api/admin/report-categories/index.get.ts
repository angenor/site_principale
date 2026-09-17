import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { ensureDefaultReportCategories } from '../../../utils/reports'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  await ensureDefaultReportCategories()

  const categories = await prisma.reportCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { reports: true }
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
    reportCount: cat._count.reports
  }))
})
