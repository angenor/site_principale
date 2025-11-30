import prisma from '../../utils/prisma'
import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const urls = []

  // Récupérer toutes les études de cas publiées
  const cases = await prisma.caseStudy.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      updatedAt: true
    }
  })

  for (const caseStudy of cases) {
    urls.push(asSitemapUrl({
      loc: `/cas/${caseStudy.slug}`,
      lastmod: caseStudy.updatedAt,
      changefreq: 'monthly',
      priority: 0.8
    }))
  }

  // Récupérer toutes les actualités publiées
  const news = await prisma.news.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      updatedAt: true
    }
  })

  for (const article of news) {
    urls.push(asSitemapUrl({
      loc: `/actualites/${article.slug}`,
      lastmod: article.updatedAt,
      changefreq: 'monthly',
      priority: 0.7
    }))
  }

  return urls
})
