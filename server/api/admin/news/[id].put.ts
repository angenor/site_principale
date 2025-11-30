import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface UpdateNewsBody {
  title?: string
  summary?: string
  content?: string
  coverImage?: string
  externalUrl?: string
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

  const existingNews = await prisma.news.findUnique({
    where: { id }
  })

  if (!existingNews) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Actualité non trouvée'
    })
  }

  const body = await readBody<UpdateNewsBody>(event)
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

  if (body.summary !== undefined) {
    if (!body.summary.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le résumé ne peut pas être vide'
      })
    }
    updateData.summary = body.summary.trim()
  }

  if (body.content !== undefined) {
    if (!body.content.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le contenu ne peut pas être vide'
      })
    }
    updateData.content = body.content.trim()
  }

  if (body.coverImage !== undefined) {
    updateData.coverImage = body.coverImage || null
  }

  if (body.externalUrl !== undefined) {
    updateData.externalUrl = body.externalUrl || null
  }

  if (body.isPublished !== undefined) {
    updateData.isPublished = body.isPublished
    if (body.isPublished && !existingNews.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  const updatedNews = await prisma.news.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: { firstName: true, lastName: true }
      }
    }
  })

  return {
    success: true,
    data: {
      id: updatedNews.id,
      slug: updatedNews.slug,
      title: updatedNews.title,
      summary: updatedNews.summary,
      content: updatedNews.content,
      coverImage: updatedNews.coverImage,
      externalUrl: updatedNews.externalUrl,
      isPublished: updatedNews.isPublished,
      publishedAt: updatedNews.publishedAt,
      createdAt: updatedNews.createdAt,
      updatedAt: updatedNews.updatedAt,
      author: updatedNews.author ? `${updatedNews.author.firstName} ${updatedNews.author.lastName}` : null
    }
  }
})
