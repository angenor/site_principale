import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface UpdateCaseBody {
  title?: string
  subtitle?: string
  summary?: string
  content?: string
  coverImage?: string
  eventDate?: string | null
  location?: string
  regionId?: string | null
  categoryIds?: string[]
  keywords?: string[]
  isPublished?: boolean
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  // Check if case exists
  const existingCase = await prisma.caseStudy.findUnique({
    where: { id },
    include: {
      categories: true,
      keywords: true
    }
  })

  if (!existingCase) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Étude de cas non trouvée'
    })
  }

  const body = await readBody<UpdateCaseBody>(event)

  // Prepare update data
  const updateData: Record<string, unknown> = {}

  if (body.title !== undefined) {
    if (!body.title.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le titre ne peut pas être vide'
      })
    }
    updateData.title = body.title.trim()
  }

  if (body.subtitle !== undefined) {
    updateData.subtitle = body.subtitle?.trim() || null
  }

  if (body.summary !== undefined) {
    if (!body.summary.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le résumé ne peut pas être vide'
      })
    }
    updateData.summary = body.summary.trim()
  }

  if (body.content !== undefined) {
    if (!body.content.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le contenu ne peut pas être vide'
      })
    }
    updateData.content = body.content.trim()
  }

  if (body.coverImage !== undefined) {
    updateData.coverImage = body.coverImage || null
  }

  if (body.eventDate !== undefined) {
    updateData.eventDate = body.eventDate ? new Date(body.eventDate) : null
  }

  if (body.location !== undefined) {
    updateData.location = body.location?.trim() || null
  }

  if (body.regionId !== undefined) {
    updateData.regionId = body.regionId || null
  }

  // Handle publication status
  if (body.isPublished !== undefined) {
    updateData.isPublished = body.isPublished
    // Set publishedAt when first published
    if (body.isPublished && !existingCase.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  // Use transaction for updating relations
  const updatedCase = await prisma.$transaction(async (tx) => {
    // Update categories if provided
    if (body.categoryIds !== undefined) {
      // Delete existing categories
      await tx.caseStudyCategory.deleteMany({
        where: { caseStudyId: id }
      })

      // Create new categories
      if (body.categoryIds.length > 0) {
        await tx.caseStudyCategory.createMany({
          data: body.categoryIds.map(categoryId => ({
            caseStudyId: id,
            categoryId
          }))
        })
      }
    }

    // Update keywords if provided
    if (body.keywords !== undefined) {
      // Delete existing keywords
      await tx.caseStudyKeyword.deleteMany({
        where: { caseStudyId: id }
      })

      // Create new keywords
      if (body.keywords.length > 0) {
        await tx.caseStudyKeyword.createMany({
          data: body.keywords.map(keyword => ({
            caseStudyId: id,
            keyword: keyword.trim()
          }))
        })
      }
    }

    // Update the case study
    return tx.caseStudy.update({
      where: { id },
      data: updateData,
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
  })

  return {
    success: true,
    data: {
      id: updatedCase.id,
      slug: updatedCase.slug,
      title: updatedCase.title,
      subtitle: updatedCase.subtitle,
      summary: updatedCase.summary,
      content: updatedCase.content,
      coverImage: updatedCase.coverImage,
      eventDate: updatedCase.eventDate,
      location: updatedCase.location,
      isPublished: updatedCase.isPublished,
      publishedAt: updatedCase.publishedAt,
      createdAt: updatedCase.createdAt,
      updatedAt: updatedCase.updatedAt,
      author: updatedCase.author ? `${updatedCase.author.firstName} ${updatedCase.author.lastName}` : null,
      region: updatedCase.region?.name || null,
      regionId: updatedCase.regionId,
      categories: updatedCase.categories.map(c => ({
        id: c.category.id,
        name: c.category.name,
        color: c.category.color
      })),
      keywords: updatedCase.keywords.map(k => k.keyword)
    }
  }
})
