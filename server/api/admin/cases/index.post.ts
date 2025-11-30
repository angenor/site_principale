import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface CreateCaseBody {
  title: string
  subtitle?: string
  summary: string
  content: string
  coverImage?: string
  eventDate?: string
  location?: string
  regionId?: string
  categoryIds?: string[]
  keywords?: string[]
  isPublished?: boolean
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim()
}

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  const body = await readBody<CreateCaseBody>(event)

  // Validation
  if (!body.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le titre est requis'
    })
  }

  if (!body.summary?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le résumé est requis'
    })
  }

  if (!body.content?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le contenu est requis'
    })
  }

  // Generate unique slug
  let slug = generateSlug(body.title)
  const existingSlug = await prisma.caseStudy.findUnique({
    where: { slug }
  })

  if (existingSlug) {
    slug = `${slug}-${Date.now()}`
  }

  // Create case study
  const caseStudy = await prisma.caseStudy.create({
    data: {
      slug,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || null,
      summary: body.summary.trim(),
      content: body.content.trim(),
      coverImage: body.coverImage || null,
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      location: body.location?.trim() || null,
      regionId: body.regionId || null,
      authorId: auth.userId,
      isPublished: body.isPublished || false,
      publishedAt: body.isPublished ? new Date() : null,
      // Create categories relations
      categories: body.categoryIds?.length ? {
        create: body.categoryIds.map(categoryId => ({
          categoryId
        }))
      } : undefined,
      // Create keywords
      keywords: body.keywords?.length ? {
        create: body.keywords.map(keyword => ({
          keyword: keyword.trim()
        }))
      } : undefined
    },
    include: {
      author: {
        select: { firstName: true, lastName: true }
      },
      region: {
        select: { name: true }
      },
      categories: {
        include: {
          category: {
            select: { id: true, name: true, color: true }
          }
        }
      },
      keywords: {
        select: { keyword: true }
      }
    }
  })

  return {
    success: true,
    data: {
      id: caseStudy.id,
      slug: caseStudy.slug,
      title: caseStudy.title,
      subtitle: caseStudy.subtitle,
      summary: caseStudy.summary,
      isPublished: caseStudy.isPublished,
      createdAt: caseStudy.createdAt,
      author: caseStudy.author ? `${caseStudy.author.firstName} ${caseStudy.author.lastName}` : null,
      region: caseStudy.region?.name || null,
      categories: caseStudy.categories.map(c => ({
        id: c.category.id,
        name: c.category.name,
        color: c.category.color
      })),
      keywords: caseStudy.keywords.map(k => k.keyword)
    }
  }
})
