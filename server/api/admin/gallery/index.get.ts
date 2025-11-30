import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return images
})
