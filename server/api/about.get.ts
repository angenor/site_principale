import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const content = await prisma.aboutContent.findMany({
    where: {
      isActive: true
    },
    orderBy: { sortOrder: 'asc' }
  })

  // Transformer en objet clé-valeur pour faciliter l'utilisation
  const contentMap: Record<string, any> = {}
  content.forEach(item => {
    contentMap[item.section] = {
      title: item.title,
      content: item.content,
      image: item.image
    }
  })

  return contentMap
})
