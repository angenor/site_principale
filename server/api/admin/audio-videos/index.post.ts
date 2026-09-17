import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { normalizeStringList, parseDateInput } from '../../../utils/news'
import {
  parseAudioVideoFormat,
  parseAudioVideoUrl,
  requireAudioVideoCategory,
  requiredText
} from '../../../utils/resources'

interface CreateAudioVideoBody {
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
  const auth = await requireAuth(event)
  const body = await readBody<CreateAudioVideoBody>(event)

  const title = requiredText(body.title, 'Le titre')
  const description = requiredText(body.description, 'La description')
  const externalUrl = parseAudioVideoUrl(body.externalUrl)
  const coverImage = requiredText(body.coverImage, 'L\'image de couverture')
  const categoryId = await requireAudioVideoCategory(body.categoryId)

  // Date de publication : celle fournie, sinon la date du jour lors de la publication
  const publishedAt = body.publishedAt
    ? parseDateInput(body.publishedAt, 'Date de publication')
    : (body.isPublished ? new Date() : null)

  const item = await prisma.audioVideo.create({
    data: {
      title,
      description,
      format: body.format === undefined ? 'VIDEO' : parseAudioVideoFormat(body.format),
      speakers: normalizeStringList(body.speakers),
      externalUrl,
      coverImage,
      categoryId,
      authorId: auth.userId,
      isPublished: body.isPublished || false,
      publishedAt
    }
  })

  return {
    success: true,
    data: {
      id: item.id,
      title: item.title,
      isPublished: item.isPublished,
      createdAt: item.createdAt
    }
  }
})
