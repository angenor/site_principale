import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10

  const now = new Date()

  // Condition pour vérifier si l'étiquette est active (non expirée)
  const labelActiveCondition = {
    OR: [
      { labelExpiresAt: { gt: now } },
      { labelExpiresAt: null }
    ]
  }

  // Récupérer les actualités "À la une" (trending) - max 4
  const trending = await prisma.news.findMany({
    where: {
      isPublished: true,
      label: 'TRENDING',
      ...labelActiveCondition
    },
    take: 4,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      coverImage: true,
      externalUrl: true,
      publishedAt: true
    }
  })

  // Récupérer l'actualité "En vedette" (featured) - 1 seule
  const featured = await prisma.news.findFirst({
    where: {
      isPublished: true,
      label: 'FEATURED',
      ...labelActiveCondition
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      coverImage: true,
      externalUrl: true,
      publishedAt: true
    }
  })

  // Récupérer toutes les actualités publiées (paginées) pour la section "Récent"
  const [latest, total] = await Promise.all([
    prisma.news.findMany({
      where: {
        isPublished: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverImage: true,
        externalUrl: true,
        publishedAt: true
      }
    }),
    prisma.news.count({
      where: { isPublished: true }
    })
  ])

  return {
    trending,
    featured,
    latest: {
      data: latest,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
})
