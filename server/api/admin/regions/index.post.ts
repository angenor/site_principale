import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)

  // Validation
  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le nom est requis'
    })
  }

  const name = body.name.trim()
  const code = body.code?.trim() || null

  // Check unique name
  const existingByName = await prisma.region.findUnique({
    where: { name }
  })
  if (existingByName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Une région avec ce nom existe déjà'
    })
  }

  // Check unique code if provided
  if (code) {
    const existingByCode = await prisma.region.findUnique({
      where: { code }
    })
    if (existingByCode) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Une région avec ce code existe déjà'
      })
    }
  }

  const region = await prisma.region.create({
    data: {
      name,
      code,
      description: body.description?.trim() || null
    }
  })

  return {
    success: true,
    data: region
  }
})
