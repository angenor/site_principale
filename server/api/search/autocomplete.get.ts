import prisma from '../../utils/prisma'

interface AutocompleteResult {
  id: string
  type: 'case' | 'news' | 'resource'
  slug: string
  title: string
  summary: string
  coverImage: string | null
  date: string | null
  url: string
  category?: { name: string; color: string | null }
  region?: string
}

interface AutocompleteResponse {
  results: AutocompleteResult[]
  counts: {
    cases: number
    news: number
    resources: number
  }
  query: string
}

export default defineEventHandler(async (event): Promise<AutocompleteResponse> => {
  const query = getQuery(event)
  const q = (query.q as string)?.trim() || ''
  const type = (query.type as string) || 'all'
  const limit = Math.min(parseInt(query.limit as string) || 5, 10)

  if (!q || q.length < 2) {
    return {
      results: [],
      counts: { cases: 0, news: 0, resources: 0 },
      query: q
    }
  }

  // Build search conditions
  const searchCondition = {
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { summary: { contains: q, mode: 'insensitive' as const } }
    ]
  }

  // Parallel queries based on type filter
  const shouldSearchCases = type === 'all' || type === 'cases'
  const shouldSearchNews = type === 'all' || type === 'news'
  const shouldSearchResources = type === 'all' || type === 'resources'

  const [cases, news, resources, casesCount, newsCount, resourcesCount] = await Promise.all([
    // Case studies
    shouldSearchCases
      ? prisma.caseStudy.findMany({
          where: {
            isPublished: true,
            ...searchCondition
          },
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            coverImage: true,
            publishedAt: true,
            region: { select: { name: true } },
            categories: {
              include: { category: { select: { name: true, color: true } } },
              take: 1
            }
          },
          orderBy: { publishedAt: 'desc' },
          take: limit
        })
      : [],

    // News
    shouldSearchNews
      ? prisma.news.findMany({
          where: {
            isPublished: true,
            ...searchCondition
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
          take: limit
        })
      : [],

    // Resources
    shouldSearchResources
      ? prisma.resource.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            coverImage: true,
            publishedAt: true,
            category: { select: { name: true, color: true } }
          },
          orderBy: { publishedAt: 'desc' },
          take: limit
        })
      : [],

    // Counts for all types (always fetch for filter badges)
    prisma.caseStudy.count({
      where: { isPublished: true, ...searchCondition }
    }),
    prisma.news.count({
      where: { isPublished: true, ...searchCondition }
    }),
    prisma.resource.count({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      }
    })
  ])

  // Transform results to unified format
  const results: AutocompleteResult[] = []

  // Add case studies
  cases.forEach(item => {
    results.push({
      id: item.id,
      type: 'case',
      slug: item.slug,
      title: item.title,
      summary: truncateText(item.summary, 80),
      coverImage: item.coverImage,
      date: item.publishedAt?.toISOString() || null,
      url: `/cas/${item.slug}`,
      category: item.categories[0]?.category
        ? { name: item.categories[0].category.name, color: item.categories[0].category.color }
        : undefined,
      region: item.region?.name
    })
  })

  // Add news
  news.forEach(item => {
    results.push({
      id: item.id,
      type: 'news',
      slug: item.slug,
      title: item.title,
      summary: truncateText(item.summary, 80),
      coverImage: item.coverImage,
      date: item.publishedAt?.toISOString() || null,
      url: `/actualites/${item.slug}`
    })
  })

  // Add resources
  resources.forEach(item => {
    results.push({
      id: item.id,
      type: 'resource',
      slug: item.slug,
      title: item.title,
      summary: truncateText(item.description || '', 80),
      coverImage: item.coverImage,
      date: item.publishedAt?.toISOString() || null,
      url: `/ressources#${item.slug}`,
      category: item.category
        ? { name: item.category.name, color: item.category.color }
        : undefined
    })
  })

  // Sort all results by date (newest first)
  results.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return {
    results: results.slice(0, limit * 3), // Max results across all types
    counts: {
      cases: casesCount,
      news: newsCount,
      resources: resourcesCount
    },
    query: q
  }
})

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}
