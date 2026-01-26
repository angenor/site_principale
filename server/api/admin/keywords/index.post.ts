import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

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
  const slug = body.slug?.trim() || generateSlug(name)

  // Check unique name
  const existingByName = await prisma.keyword.findUnique({
    where: { name }
  })
  if (existingByName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Un mot-clé avec ce nom existe déjà'
    })
  }

  // Check unique slug
  const existingBySlug = await prisma.keyword.findUnique({
    where: { slug }
  })
  if (existingBySlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Un mot-clé avec ce slug existe déjà'
    })
  }

  const keyword = await prisma.keyword.create({
    data: {
      name,
      slug,
      description: body.description?.trim() || null,
      icon: body.icon || null,
      color: body.color || null,
      sortOrder: body.sortOrder ?? 0
    }
  })

  return {
    success: true,
    data: keyword
  }
})
