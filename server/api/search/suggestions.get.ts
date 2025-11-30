import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string)?.trim() || ''

  if (!q || q.length < 2) {
    return []
  }

  // Get suggestions from case studies titles and keywords
  const [cases, keywords] = await Promise.all([
    prisma.caseStudy.findMany({
      where: {
        isPublished: true,
        title: { contains: q, mode: 'insensitive' }
      },
      select: { title: true },
      take: 5
    }),
    prisma.caseStudyKeyword.findMany({
      where: {
        keyword: { contains: q, mode: 'insensitive' }
      },
      select: { keyword: true },
      distinct: ['keyword'],
      take: 5
    })
  ])

  const suggestions = new Set<string>()

  cases.forEach(c => suggestions.add(c.title))
  keywords.forEach(k => suggestions.add(k.keyword))

  return Array.from(suggestions).slice(0, 8)
})
