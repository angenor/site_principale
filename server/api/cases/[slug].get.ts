import prisma from '../../utils/prisma'
import { ensureCaseStudyRegionsMigrated } from '../../utils/caseStudies'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug requis'
    })
  }

  await ensureCaseStudyRegionsMigrated()

  const caseStudy = await prisma.caseStudy.findUnique({
    where: {
      slug,
      isPublished: true
    },
    include: {
      regions: {
        include: {
          region: true
        },
        orderBy: { region: { name: 'asc' } }
      },
      categories: {
        include: {
          category: true
        }
      },
      keywords: {
        include: {
          keyword: true
        }
      },
      media: {
        include: {
          media: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      },
      author: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  })

  if (!caseStudy) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Étude de cas non trouvée'
    })
  }

  // Incrémenter le compteur de vues
  await prisma.caseStudy.update({
    where: { id: caseStudy.id },
    data: { viewCount: { increment: 1 } }
  })

  // Récupérer les cas connexes (même catégorie ou région)
  const categoryIds = caseStudy.categories.map(c => c.categoryId)
  const regionIds = caseStudy.regions.map(r => r.regionId)
  const relatedCases = await prisma.caseStudy.findMany({
    where: {
      isPublished: true,
      id: { not: caseStudy.id },
      OR: [
        {
          categories: {
            some: {
              categoryId: { in: categoryIds }
            }
          }
        },
        {
          regions: {
            some: {
              regionId: { in: regionIds }
            }
          }
        }
      ]
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true
    }
  })

  // Formater la réponse
  return {
    ...caseStudy,
    regions: caseStudy.regions.map(r => r.region),
    categories: caseStudy.categories.map(c => c.category),
    keywords: caseStudy.keywords.map(k => ({
      id: k.keyword.id,
      name: k.keyword.name,
      slug: k.keyword.slug,
      icon: k.keyword.icon,
      color: k.keyword.color
    })),
    media: caseStudy.media.map(m => ({
      ...m.media,
      caption: m.caption
    })),
    author: caseStudy.author
      ? `${caseStudy.author.firstName} ${caseStudy.author.lastName}`
      : 'Équipe MOM',
    relatedCases
  }
})
