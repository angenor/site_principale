import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  await requireAuth(event)

  // Récupérer les 5 études de cas les plus récentes
  const cases = await prisma.caseStudy.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
      createdAt: true
    }
  })

  return cases
})
