import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { buildNewsletterWhere } from '../../../utils/newsletter'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = Math.max(parseInt(query.page as string) || 1, 1)
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 20, 1), 100)
  const where = buildNewsletterWhere(query)

  const [subscribers, total, activeCount, inactiveCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { subscribedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        subscribedAt: true,
        unsubscribedAt: true
      }
    }),
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.newsletterSubscriber.count({ where: { isActive: false } })
  ])

  return {
    data: subscribers,
    counts: { active: activeCount, inactive: inactiveCount },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
