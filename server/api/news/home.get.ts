import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const categorySlug = (query.category as string) || ''

  // Filtre optionnel par catégorie pour la section "Récent"
  const latestWhere = {
    isPublished: true,
    ...(categorySlug ? { category: { slug: categorySlug } } : {})
  }

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
      publishedAt: true,
      keywords: true,
      category: {
        select: { id: true, name: true, slug: true, color: true }
      }
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
      publishedAt: true,
      keywords: true,
      category: {
        select: { id: true, name: true, slug: true, color: true }
      }
    }
  })

  // Récupérer toutes les actualités publiées (paginées) pour la section "Récent"
  const [latest, total] = await Promise.all([
    prisma.news.findMany({
      where: latestWhere,
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
        publishedAt: true,
        keywords: true,
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    }),
    prisma.news.count({ where: latestWhere })
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
