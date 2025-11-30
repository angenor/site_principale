import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Paramètres de filtrage
  const categorySlug = query.category as string | undefined
  const regionId = query.region as string | undefined
  const search = query.search as string | undefined
  const sortOrder = (query.sort as string) || 'recent'
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 12

  // Construction des conditions de filtrage
  const where: any = {
    isPublished: true
  }

  // Filtre par catégorie
  if (categorySlug) {
    where.categories = {
      some: {
        category: {
          slug: categorySlug
        }
      }
    }
  }

  // Filtre par région
  if (regionId) {
    where.regionId = regionId
  }

  // Recherche textuelle
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { subtitle: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Tri
  const orderBy: any = sortOrder === 'oldest'
    ? { publishedAt: 'asc' }
    : { publishedAt: 'desc' }

  // Requête avec pagination
  const [caseStudies, total] = await Promise.all([
    prisma.caseStudy.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        summary: true,
        coverImage: true,
        eventDate: true,
        publishedAt: true,
        region: {
          select: {
            id: true,
            name: true
          }
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                icon: true
              }
            }
          }
        }
      }
    }),
    prisma.caseStudy.count({ where })
  ])

  // Formater les résultats
  const formattedCases = caseStudies.map(cs => ({
    ...cs,
    categories: cs.categories.map(c => c.category)
  }))

  return {
    data: formattedCases,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
