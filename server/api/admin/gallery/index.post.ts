import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface CreateImageBody {
  title?: string
  description?: string
  imageUrl: string
  linkUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody<CreateImageBody>(event)

  if (!body.imageUrl?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'L\'URL de l\'image est requise'
    })
  }

  const maxOrder = await prisma.galleryImage.aggregate({
    _max: { sortOrder: true }
  })

  const image = await prisma.galleryImage.create({
    data: {
      title: body.title?.trim() || null,
      description: body.description?.trim() || null,
      imageUrl: body.imageUrl.trim(),
      linkUrl: body.linkUrl || null,
      sortOrder: body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      isActive: body.isActive ?? true
    }
  })

  return { success: true, data: image }
})
