import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)

  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le nom est requis'
    })
  }

  const name = body.name.trim()
  const slug = body.slug?.trim() || generateSlug(name)

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le slug est invalide'
    })
  }

  const existing = await prisma.newsCategory.findFirst({
    where: { OR: [{ name }, { slug }] }
  })
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: existing.name === name
        ? 'Une catégorie d\'actualité avec ce nom existe déjà'
        : 'Une catégorie d\'actualité avec ce slug existe déjà'
    })
  }

  const category = await prisma.newsCategory.create({
    data: {
      name,
      slug,
      description: body.description?.trim() || null,
      color: body.color?.trim() || null,
      sortOrder: body.sortOrder ?? 0
    }
  })

  return {
    success: true,
    data: category
  }
})
