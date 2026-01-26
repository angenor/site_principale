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

  const caseStudy = await prisma.caseStudy.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true }
      },
      region: {
        select: { id: true, name: true }
      },
      categories: {
        include: {
          category: {
            select: { id: true, name: true, slug: true, color: true, icon: true }
          }
        }
      },
      keywords: {
        include: {
          keyword: {
            select: { id: true, name: true, slug: true, color: true, icon: true }
          }
        }
      },
      media: {
        include: {
          media: {
            select: { id: true, filename: true, url: true, mimeType: true, mediaType: true }
          }
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!caseStudy) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Étude de cas non trouvée'
    })
  }

  return {
    id: caseStudy.id,
    slug: caseStudy.slug,
    title: caseStudy.title,
    subtitle: caseStudy.subtitle,
    summary: caseStudy.summary,
    content: caseStudy.content,
    coverImage: caseStudy.coverImage,
    eventDate: caseStudy.eventDate,
    location: caseStudy.location,
    isPublished: caseStudy.isPublished,
    publishedAt: caseStudy.publishedAt,
    viewCount: caseStudy.viewCount,
    createdAt: caseStudy.createdAt,
    updatedAt: caseStudy.updatedAt,
    author: caseStudy.author ? {
      id: caseStudy.author.id,
      name: `${caseStudy.author.firstName} ${caseStudy.author.lastName}`
    } : null,
    region: caseStudy.region,
    regionId: caseStudy.regionId,
    categories: caseStudy.categories.map(c => c.category),
    categoryIds: caseStudy.categories.map(c => c.categoryId),
    keywords: caseStudy.keywords.map(k => k.keyword),
    keywordIds: caseStudy.keywords.map(k => k.keywordId),
    media: caseStudy.media.map(m => ({
      id: m.id,
      caption: m.caption,
      sortOrder: m.sortOrder,
      media: m.media
    }))
  }
})
