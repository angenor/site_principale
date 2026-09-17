import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { parseDateInput } from '../../../utils/news'
import { normalizeResourceFiles, resourceFilesCreateData } from '../../../utils/resources'

interface UpdateResourceBody {
  title?: string
  description?: string
  coverImage?: string
  files?: unknown
  categoryId?: string | null
  isPublished?: boolean
  publishedAt?: string | null
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

  if (body.categoryId !== undefined) {
    updateData.categoryId = body.categoryId || null
  }

  if (body.publishedAt !== undefined) {
    updateData.publishedAt = body.publishedAt
      ? parseDateInput(body.publishedAt, 'Date de publication')
      : null
  }

  if (body.isPublished !== undefined) {
    updateData.isPublished = body.isPublished
    // Date de publication par défaut si aucune n'est définie
    const nextPublishedAt = updateData.publishedAt !== undefined ? updateData.publishedAt : existingResource.publishedAt
    if (body.isPublished && !nextPublishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  // Les versions linguistiques remplacent la liste existante (et l'ancien fichier unique)
  if (body.files !== undefined) {
    const files = normalizeResourceFiles(body.files)
    updateData.files = {
      deleteMany: {},
      create: resourceFilesCreateData(files)
    }
    updateData.fileUrl = null
    updateData.filename = null
    updateData.mimeType = null
    updateData.fileSize = null
  }

  const updatedResource = await prisma.resource.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    data: {
      id: updatedResource.id,
      slug: updatedResource.slug,
      title: updatedResource.title,
      isPublished: updatedResource.isPublished,
      publishedAt: updatedResource.publishedAt,
      updatedAt: updatedResource.updatedAt
    }
  }
})
