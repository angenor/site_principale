import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string)?.trim() || ''
  const type = (query.type as string) || 'all' // all, cases, news
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10

  if (!q || q.length < 2) {
    return {
      results: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 },
      query: q
    }
  }

  const skip = (page - 1) * limit
  const searchTerms = q.split(/\s+/).filter(term => term.length >= 2)

  // Build search conditions
  const caseConditions = searchTerms.map(term => ({
    OR: [
      { title: { contains: term, mode: 'insensitive' as const } },
      { summary: { contains: term, mode: 'insensitive' as const } },
      { content: { contains: term, mode: 'insensitive' as const } },
      { subtitle: { contains: term, mode: 'insensitive' as const } },
      { location: { contains: term, mode: 'insensitive' as const } },
      { keywords: { some: { keyword: { contains: term, mode: 'insensitive' as const } } } }
    ]
  }))

  const newsConditions = searchTerms.map(term => ({
    OR: [
      { title: { contains: term, mode: 'insensitive' as const } },
      { summary: { contains: term, mode: 'insensitive' as const } },
      { content: { contains: term, mode: 'insensitive' as const } }
    ]
  }))

  interface SearchResult {
    id: string
    type: 'case' | 'news'
    slug: string
    title: string
    summary: string
    coverImage: string | null
    date: Date | null
    url: string
  }

  const results: SearchResult[] = []
  let totalCases = 0
  let totalNews = 0

  // Search in case studies
  if (type === 'all' || type === 'cases') {
    const [cases, casesCount] = await Promise.all([
      prisma.caseStudy.findMany({
        where: {
          isPublished: true,
          AND: caseConditions
        },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          coverImage: true,
          publishedAt: true
        },
        orderBy: { publishedAt: 'desc' },
        take: type === 'all' ? Math.ceil(limit / 2) : limit,
        skip: type === 'cases' ? skip : 0
      }),
      prisma.caseStudy.count({
        where: {
          isPublished: true,
          AND: caseConditions
        }
      })
    ])

    totalCases = casesCount
    cases.forEach(c => {
      results.push({
        id: c.id,
        type: 'case',
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        coverImage: c.coverImage,
        date: c.publishedAt,
        url: `/cas/${c.slug}`
      })
    })
  }

  // Search in news
  if (type === 'all' || type === 'news') {
    const [news, newsCount] = await Promise.all([
      prisma.news.findMany({
        where: {
          isPublished: true,
          AND: newsConditions
        },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          coverImage: true,
          publishedAt: true
        },
        orderBy: { publishedAt: 'desc' },
        take: type === 'all' ? Math.ceil(limit / 2) : limit,
        skip: type === 'news' ? skip : 0
      }),
      prisma.news.count({
        where: {
          isPublished: true,
          AND: newsConditions
        }
      })
    ])

    totalNews = newsCount
    news.forEach(n => {
      results.push({
        id: n.id,
        type: 'news',
        slug: n.slug,
        title: n.title,
        summary: n.summary,
        coverImage: n.coverImage,
        date: n.publishedAt,
        url: `/actualites/${n.slug}`
      })
    })
  }

  // Sort by date
  results.sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const total = type === 'all' ? totalCases + totalNews : (type === 'cases' ? totalCases : totalNews)

  return {
    results: type === 'all' ? results.slice(0, limit) : results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    counts: {
      cases: totalCases,
      news: totalNews
    },
    query: q
  }
})
