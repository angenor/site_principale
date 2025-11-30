import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const axes = await prisma.strategicAxis.findMany({
    where: {
      isActive: true
    },
    orderBy: { sortOrder: 'asc' }
  })

  return axes
})
