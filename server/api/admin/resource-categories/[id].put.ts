import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const existing = await prisma.resourceCategory.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catégorie de ressource non trouvée'
    })
  }

  const body = await readBody(event)
  const updateData: Record<string, unknown> = {}

  // Handle name update
  if (body.name !== undefined) {
    const name = body.name.trim()
    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le nom ne peut pas être vide'
      })
    }
    // Check unique name (excluding current)
    const existingByName = await prisma.resourceCategory.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })
    if (existingByName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Une catégorie de ressource avec ce nom existe déjà'
      })
    }
    updateData.name = name
  }

  // Handle slug update
  if (body.slug !== undefined) {
    const slug = body.slug.trim()
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le slug ne peut pas être vide'
      })
    }
    // Check unique slug (excluding current)
    const existingBySlug = await prisma.resourceCategory.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    })
    if (existingBySlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Une catégorie de ressource avec ce slug existe déjà'
      })
    }
    updateData.slug = slug
  }

  // Handle other fields
  if (body.description !== undefined) {
    updateData.description = body.description?.trim() || null
  }
  if (body.icon !== undefined) {
    updateData.icon = body.icon?.trim() || null
  }
  if (body.color !== undefined) {
    updateData.color = body.color?.trim() || null
  }
  if (body.sortOrder !== undefined) {
    updateData.sortOrder = body.sortOrder
  }

  const category = await prisma.resourceCategory.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    data: category
  }
})
