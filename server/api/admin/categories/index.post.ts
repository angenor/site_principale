import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/-+/g, '-')             // Replace multiple - with single -
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
  const existingByName = await prisma.category.findUnique({
    where: { name }
  })
  if (existingByName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Une catégorie avec ce nom existe déjà'
    })
  }

  // Check unique slug
  const existingBySlug = await prisma.category.findUnique({
    where: { slug }
  })
  if (existingBySlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Une catégorie avec ce slug existe déjà'
    })
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: body.description?.trim() || null,
      icon: body.icon?.trim() || null,
      color: body.color?.trim() || null,
      sortOrder: body.sortOrder ?? 0
    }
  })

  return {
    success: true,
    data: category
  }
})
