import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { normalizeStringList, parseDateInput } from '../../../utils/news'
import {
  parseAudioVideoFormat,
  parseAudioVideoUrl,
  requireAudioVideoCategory,
  requiredText
} from '../../../utils/resources'

interface UpdateAudioVideoBody {
  title?: string
  description?: string
  format?: string
  speakers?: string[]
  externalUrl?: string
  coverImage?: string | null
  categoryId?: string
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

  const existing = await prisma.audioVideo.findUnique({ where: { id } })
  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Audio/vidéo non trouvé'
    })
  }

  const body = await readBody<UpdateAudioVideoBody>(event)
  const updateData: Record<string, unknown> = {}

  if (body.title !== undefined) updateData.title = requiredText(body.title, 'Le titre')
  if (body.description !== undefined) updateData.description = requiredText(body.description, 'La description')
  if (body.format !== undefined) updateData.format = parseAudioVideoFormat(body.format)
  if (body.speakers !== undefined) updateData.speakers = normalizeStringList(body.speakers)
  if (body.externalUrl !== undefined) updateData.externalUrl = parseAudioVideoUrl(body.externalUrl)
  if (body.coverImage !== undefined) updateData.coverImage = requiredText(body.coverImage, 'L\'image de couverture')
  if (body.categoryId !== undefined) updateData.categoryId = await requireAudioVideoCategory(body.categoryId)

  if (body.publishedAt !== undefined) {
    updateData.publishedAt = body.publishedAt
      ? parseDateInput(body.publishedAt, 'Date de publication')
      : null
  }

  if (body.isPublished !== undefined) {
    updateData.isPublished = body.isPublished
    // Date de publication par défaut si aucune n'est définie
    const nextPublishedAt = updateData.publishedAt !== undefined ? updateData.publishedAt : existing.publishedAt
    if (body.isPublished && !nextPublishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  const item = await prisma.audioVideo.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    data: {
      id: item.id,
      title: item.title,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt,
      updatedAt: item.updatedAt
    }
  }
})
