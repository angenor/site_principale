import prisma from '../../utils/prisma'
import { audioVideoCategorySelect } from '../../utils/resources'

// Nombre d'éléments affichés par catégorie dans la vue groupée
const ITEMS_PER_GROUP = 4

const itemSelect = {
  id: true,
  title: true,
  description: true,
  format: true,
  speakers: true,
  externalUrl: true,
  coverImage: true,
  publishedAt: true,
  category: audioVideoCategorySelect
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Math.max(parseInt(query.page as string) || 1, 1)
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 12, 1), 48)
  const sortDirection = query.sort === 'oldest' ? 'asc' : 'desc'
  const categoryId = (query.category as string) || ''
  const view = query.view === 'categories' ? 'categories' : 'list'

  const orderBy: Array<{ publishedAt: 'asc' | 'desc' } | { createdAt: 'asc' | 'desc' }> = [
    { publishedAt: sortDirection },
    { createdAt: sortDirection }
  ]

  // Catégories ayant au moins un contenu publié, avec leur nombre de contenus
  const categoryRows = await prisma.audioVideoCategory.findMany({
    where: { items: { some: { isPublished: true } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      ...audioVideoCategorySelect.select,
      _count: {
        select: { items: { where: { isPublished: true } } }
      }
    }
  })
  const categories = categoryRows.map(({ _count, ...cat }) => ({ ...cat, count: _count.items }))

  // Vue par catégorie : les contenus les plus récents de chaque catégorie
  if (view === 'categories' && !categoryId) {
    const groups = await Promise.all(categories.map(async category => ({
      category,
      items: await prisma.audioVideo.findMany({
        where: { isPublished: true, categoryId: category.id },
        orderBy,
        take: ITEMS_PER_GROUP,
        select: itemSelect
      })
    })))

    return {
      view: 'categories' as const,
      groups,
      categories
    }
  }

  const where = {
    isPublished: true,
    ...(categoryId ? { categoryId } : {})
  }

  const [items, total] = await Promise.all([
    prisma.audioVideo.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: itemSelect
    }),
    prisma.audioVideo.count({ where })
  ])

  return {
    view: 'list' as const,
    data: items,
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
