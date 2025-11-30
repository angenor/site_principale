import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface UpdateImageBody {
  title?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const existing = await prisma.galleryImage.findUnique({ where: { id } })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image non trouvée'
    })
  }

  const body = await readBody<UpdateImageBody>(event)
  const updateData: Record<string, unknown> = {}

  if (body.title !== undefined) updateData.title = body.title?.trim() || null
  if (body.description !== undefined) updateData.description = body.description?.trim() || null

  if (body.imageUrl !== undefined) {
    if (!body.imageUrl.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'L\'URL de l\'image ne peut pas être vide' })
    }
    updateData.imageUrl = body.imageUrl.trim()
  }

  if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl || null
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder
  if (body.isActive !== undefined) updateData.isActive = body.isActive

  const image = await prisma.galleryImage.update({
    where: { id },
    data: updateData
  })

  return { success: true, data: image }
})
