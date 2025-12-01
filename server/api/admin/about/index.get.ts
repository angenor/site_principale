import prisma from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const content = await prisma.aboutContent.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return content
})
