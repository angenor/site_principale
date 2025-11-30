import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const regions = await prisma.region.findMany({
    orderBy: { name: 'asc' }
  })

  return regions
})
