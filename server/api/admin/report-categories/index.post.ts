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

  const existing = await prisma.reportCategory.findFirst({
    where: { OR: [{ name }, { slug }] }
  })
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: existing.name === name
        ? 'Une catégorie de signalement avec ce nom existe déjà'
        : 'Une catégorie de signalement avec ce slug existe déjà'
    })
  }

  // Sans ordre précisé (création rapide), la catégorie est placée en dernier
  let sortOrder = body.sortOrder
  if (typeof sortOrder !== 'number') {
    const last = await prisma.reportCategory.aggregate({ _max: { sortOrder: true } })
    sortOrder = (last._max.sortOrder ?? -10) + 10
  }

  const category = await prisma.reportCategory.create({
    data: {
      name,
      slug,
      description: body.description?.trim() || null,
      icon: body.icon?.trim() || null,
      color: body.color?.trim() || null,
      sortOrder
    }
  })

  return {
    success: true,
    data: category
  }
})
