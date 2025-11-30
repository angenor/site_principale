import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const partners = await prisma.partner.findMany({
    where: {
      isActive: true
    },
    orderBy: { sortOrder: 'asc' }
  })

  return partners
})
