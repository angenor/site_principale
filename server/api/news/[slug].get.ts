import prisma from '../../utils/prisma'
import { formatNewsAuthors } from '../../utils/news'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug requis'
    })
  }

  const newsArticle = await prisma.news.findUnique({
    where: {
      slug,
      isPublished: true
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      category: {
        select: { id: true, name: true, slug: true, color: true, icon: true }
      },
      attachments: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!newsArticle) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Actualité non trouvée'
    })
  }

  // Incrémenter le compteur de vues
  await prisma.news.update({
    where: { id: newsArticle.id },
    data: { viewCount: { increment: 1 } }
  })

  return {
    ...newsArticle,
    author: formatNewsAuthors(newsArticle.authors, newsArticle.author)
  }
})
