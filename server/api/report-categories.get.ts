import prisma from '../utils/prisma'
import { ensureDefaultReportCategories } from '../utils/reports'

export default defineEventHandler(async () => {
  await ensureDefaultReportCategories()

  return prisma.reportCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      color: true
    }
  })
})
