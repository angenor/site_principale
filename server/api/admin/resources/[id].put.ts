import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface UpdateResourceBody {
  title?: string
  description?: string
  coverImage?: string
  fileUrl?: string
  filename?: string
  mimeType?: string
  fileSize?: number
  categoryId?: string | null
  isPublished?: boolean
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

  const existingResource = await prisma.resource.findUnique({
    where: { id }
  })

  if (!existingResource) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Ressource non trouvée'
    })
  }

  const body = await readBody<UpdateResourceBody>(event)
  const updateData: Record<string, unknown> = {}

  if (body.title !== undefined) {
    if (!body.title.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le titre ne peut pas être vide'
      })
    }
    updateData.title = body.title.trim()
  }

  if (body.description !== undefined) {
    updateData.description = body.description?.trim() || null
  }

  if (body.coverImage !== undefined) {
    updateData.coverImage = body.coverImage || null
  }

  if (body.fileUrl !== undefined) {
    if (!body.fileUrl.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'L\'URL du fichier ne peut pas être vide'
      })
    }
    updateData.fileUrl = body.fileUrl.trim()
  }

  if (body.filename !== undefined) {
    if (!body.filename.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le nom du fichier ne peut pas être vide'
      })
    }
    updateData.filename = body.filename.trim()
  }

  if (body.mimeType !== undefined) {
    updateData.mimeType = body.mimeType
  }

  if (body.fileSize !== undefined) {
    updateData.fileSize = body.fileSize
  }

  if (body.categoryId !== undefined) {
    updateData.categoryId = body.categoryId || null
  }

  if (body.isPublished !== undefined) {
    updateData.isPublished = body.isPublished
    if (body.isPublished && !existingResource.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  const updatedResource = await prisma.resource.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: { firstName: true, lastName: true }
      },
      category: {
        select: { id: true, name: true }
      }
    }
  })

  return {
    success: true,
    data: {
      id: updatedResource.id,
      slug: updatedResource.slug,
      title: updatedResource.title,
      description: updatedResource.description,
      coverImage: updatedResource.coverImage,
      fileUrl: updatedResource.fileUrl,
      filename: updatedResource.filename,
      mimeType: updatedResource.mimeType,
      fileSize: updatedResource.fileSize,
      isPublished: updatedResource.isPublished,
      publishedAt: updatedResource.publishedAt,
      downloadCount: updatedResource.downloadCount,
      createdAt: updatedResource.createdAt,
      updatedAt: updatedResource.updatedAt,
      author: updatedResource.author ? `${updatedResource.author.firstName} ${updatedResource.author.lastName}` : null,
      category: updatedResource.category
    }
  }
})
