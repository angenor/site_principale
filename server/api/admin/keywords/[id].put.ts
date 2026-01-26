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

  const existing = await prisma.keyword.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Mot-clé non trouvé'
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
    const existingByName = await prisma.keyword.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })
    if (existingByName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Un mot-clé avec ce nom existe déjà'
      })
    }
    updateData.name = name
  }

  // Handle slug update
  if (body.slug !== undefined) {
    const slug = body.slug?.trim()
    if (slug) {
      // Check unique slug (excluding current)
      const existingBySlug = await prisma.keyword.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })
      if (existingBySlug) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Un mot-clé avec ce slug existe déjà'
        })
      }
      updateData.slug = slug
    }
  }

  // Handle description
  if (body.description !== undefined) {
    updateData.description = body.description?.trim() || null
  }

  // Handle icon
  if (body.icon !== undefined) {
    updateData.icon = body.icon || null
  }

  // Handle color
  if (body.color !== undefined) {
    updateData.color = body.color || null
  }

  // Handle sortOrder
  if (body.sortOrder !== undefined) {
    updateData.sortOrder = body.sortOrder
  }

  const keyword = await prisma.keyword.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    data: keyword
  }
})
