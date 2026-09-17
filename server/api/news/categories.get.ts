import prisma from '../../utils/prisma'

// Catégories d'actualités ayant au moins une actualité publiée
export default defineEventHandler(async () => {
  const categories = await prisma.newsCategory.findMany({
    where: {
      news: { some: { isPublished: true } }
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      icon: true
    }
  })

  return categories
})
