import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { normalizeStringList, parseDateInput } from '../../../utils/news'

interface UpdateNewsBody {
  title?: string
  summary?: string
  content?: string
  coverImage?: string
  externalUrl?: string
  isPublished?: boolean
  label?: 'STANDARD' | 'TRENDING' | 'FEATURED'
  labelExpiresAt?: string | null
  publishedAt?: string | null
  categoryId?: string | null
  authors?: string[]
  keywords?: string[]
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

  if (body.publishedAt !== undefined) {
    updateData.publishedAt = body.publishedAt
      ? parseDateInput(body.publishedAt, 'Date de publication')
      : null
  }

  if (body.isPublished !== undefined) {
    updateData.isPublished = body.isPublished
    // Date de publication par défaut si aucune n'est définie
    const nextPublishedAt = updateData.publishedAt !== undefined ? updateData.publishedAt : existingNews.publishedAt
    if (body.isPublished && !nextPublishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  if (body.categoryId !== undefined) {
    if (body.categoryId) {
      const category = await prisma.newsCategory.findUnique({ where: { id: body.categoryId } })
      if (!category) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Catégorie introuvable'
        })
      }
    }
    updateData.categoryId = body.categoryId || null
  }

  if (body.authors !== undefined) {
    updateData.authors = normalizeStringList(body.authors)
  }

  if (body.keywords !== undefined) {
    updateData.keywords = normalizeStringList(body.keywords)
  }

  if (body.label !== undefined) {
    updateData.label = body.label
  }

  if (body.labelExpiresAt !== undefined) {
    updateData.labelExpiresAt = body.labelExpiresAt ? new Date(body.labelExpiresAt) : null
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
      label: updatedNews.label,
      labelExpiresAt: updatedNews.labelExpiresAt,
      categoryId: updatedNews.categoryId,
      authors: updatedNews.authors,
      keywords: updatedNews.keywords,
      createdAt: updatedNews.createdAt,
      updatedAt: updatedNews.updatedAt,
      author: updatedNews.author ? `${updatedNews.author.firstName} ${updatedNews.author.lastName}` : null
    }
  }
})
