import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const keywords = await prisma.keyword.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return keywords
})
