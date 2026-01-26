import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 4

  const featuredCases = await prisma.caseStudy.findMany({
    where: {
      isPublished: true
    },
    orderBy: [
      { viewCount: 'desc' }, // Les plus vus en premier
      { publishedAt: 'desc' }
    ],
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
  })

  // Formater les résultats
  return featuredCases.map(cs => ({
    ...cs,
    categories: cs.categories.map(c => c.category)
  }))
})
