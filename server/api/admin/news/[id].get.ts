import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const news = await prisma.news.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true }
      },
      attachments: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!news) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Actualité non trouvée'
    })
  }

  return {
    id: news.id,
    slug: news.slug,
    title: news.title,
    summary: news.summary,
    content: news.content,
    coverImage: news.coverImage,
    externalUrl: news.externalUrl,
    isPublished: news.isPublished,
    publishedAt: news.publishedAt,
    viewCount: news.viewCount,
    createdAt: news.createdAt,
    updatedAt: news.updatedAt,
    author: news.author ? {
      id: news.author.id,
      name: `${news.author.firstName} ${news.author.lastName}`
    } : null,
    attachments: news.attachments || []
  }
})
