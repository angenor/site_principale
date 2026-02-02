import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const days = parseInt(query.days as string) || 30

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  try {
    // Process visits by day
    const visitsByDay: Record<string, number> = {}
    const dateLabels: string[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dateLabels.push(dateStr)
      visitsByDay[dateStr] = 0
    }

    // Get actual visit counts per day
    const rawVisits = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE(visited_at) as date, COUNT(*) as count
      FROM page_visits
      WHERE visited_at >= ${startDate}
      GROUP BY DATE(visited_at)
      ORDER BY date ASC
    `

    rawVisits.forEach((v) => {
      const dateStr = new Date(v.date).toISOString().split('T')[0]
      if (visitsByDay[dateStr] !== undefined) {
        visitsByDay[dateStr] = Number(v.count)
      }
    })

    // Get top pages
    const topPages = await prisma.pageVisit.groupBy({
      by: ['path'],
      where: {
        visitedAt: { gte: startDate }
      },
      _count: true,
      orderBy: { _count: { path: 'desc' } },
      take: 10
    })

    // Get total stats
    const [totalVisits, uniqueVisitors, totalDownloads] = await Promise.all([
      prisma.pageVisit.count({
        where: { visitedAt: { gte: startDate } }
      }),
      prisma.pageVisit.groupBy({
        by: ['ipAddress'],
        where: {
          visitedAt: { gte: startDate },
          ipAddress: { not: null }
        }
      }).then(r => r.length),
      prisma.download.count({
        where: { downloadedAt: { gte: startDate } }
      })
    ])

    // Get visits by referrer domain
    const referrers = await prisma.$queryRaw<{ domain: string; count: bigint }[]>`
      SELECT
        CASE
          WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
          ELSE SUBSTRING(referrer FROM '://([^/]+)')
        END as domain,
        COUNT(*) as count
      FROM page_visits
      WHERE visited_at >= ${startDate}
      GROUP BY domain
      ORDER BY count DESC
      LIMIT 5
    `

    return {
      period: days,
      summary: {
        totalVisits,
        uniqueVisitors,
        totalDownloads,
        avgVisitsPerDay: Math.round(totalVisits / days)
      },
      visitsByDay: {
        labels: dateLabels,
        data: dateLabels.map(d => visitsByDay[d] || 0)
      },
      topPages: topPages.map(p => ({
        path: p.path,
        visits: p._count
      })),
      referrers: referrers.map(r => ({
        domain: r.domain || 'Direct',
        count: Number(r.count)
      }))
    }
  } catch (error: any) {
    console.error('Analytics API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des statistiques',
      message: error.message || 'Erreur interne du serveur'
    })
  }
})
