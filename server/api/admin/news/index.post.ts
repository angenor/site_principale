import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { normalizeStringList, parseDateInput } from '../../../utils/news'

interface CreateNewsBody {
  title: string
  summary: string
  content: string
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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  const body = await readBody<CreateNewsBody>(event)

  if (!body.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le titre est requis'
    })
  }

  if (!body.summary?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le résumé est requis'
    })
  }

  if (!body.content?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le contenu est requis'
    })
  }

  if (body.categoryId) {
    const category = await prisma.newsCategory.findUnique({ where: { id: body.categoryId } })
    if (!category) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Catégorie introuvable'
      })
    }
  }

  // Date de publication : celle fournie, sinon la date du jour lors de la publication
  const publishedAt = body.publishedAt
    ? parseDateInput(body.publishedAt, 'Date de publication')
    : (body.isPublished ? new Date() : null)

  let slug = generateSlug(body.title)
  const existingSlug = await prisma.news.findUnique({
    where: { slug }
  })

  if (existingSlug) {
    slug = `${slug}-${Date.now()}`
  }

  const news = await prisma.news.create({
    data: {
      slug,
      title: body.title.trim(),
      summary: body.summary.trim(),
      content: body.content.trim(),
      coverImage: body.coverImage || null,
      externalUrl: body.externalUrl || null,
      authorId: auth.userId,
      isPublished: body.isPublished || false,
      publishedAt,
      categoryId: body.categoryId || null,
      authors: normalizeStringList(body.authors),
      keywords: normalizeStringList(body.keywords),
      label: body.label || 'STANDARD',
      labelExpiresAt: body.labelExpiresAt ? new Date(body.labelExpiresAt) : null
    },
    include: {
      author: {
        select: { firstName: true, lastName: true }
      }
    }
  })

  return {
    success: true,
    data: {
      id: news.id,
      slug: news.slug,
      title: news.title,
      isPublished: news.isPublished,
      createdAt: news.createdAt
    }
  }
})
