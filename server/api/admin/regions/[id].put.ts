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

  const existing = await prisma.region.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Région non trouvée'
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
    const existingByName = await prisma.region.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })
    if (existingByName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Une région avec ce nom existe déjà'
      })
    }
    updateData.name = name
  }

  // Handle code update
  if (body.code !== undefined) {
    const code = body.code?.trim() || null
    if (code) {
      // Check unique code (excluding current)
      const existingByCode = await prisma.region.findFirst({
        where: {
          code,
          id: { not: id }
        }
      })
      if (existingByCode) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Une région avec ce code existe déjà'
        })
      }
    }
    updateData.code = code
  }

  // Handle description
  if (body.description !== undefined) {
    updateData.description = body.description?.trim() || null
  }

  const region = await prisma.region.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    data: region
  }
})
