import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  await requireAuth(event)

  // Récupérer les statistiques
  const [casesCount, newsCount, contactsCount, viewsCount] = await Promise.all([
    prisma.caseStudy.count(),
    prisma.news.count(),
    prisma.contact.count({
      where: { status: { not: 'ARCHIVED' } }
    }),
    prisma.pageVisit.count({
      where: {
        visitedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
        }
      }
    })
  ])

  return {
    casesCount,
    newsCount,
    contactsCount,
    viewsCount
  }
})
