import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const sliders = await prisma.galleryImage.findMany({
    where: {
      isActive: true
    },
    orderBy: { sortOrder: 'asc' }
  })

  return sliders
})
