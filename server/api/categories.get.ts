import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return categories
})
