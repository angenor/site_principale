import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface CreateAxisBody {
  title: string
  description: string
  icon?: string
  color?: string
  backgroundImage?: string
  linkUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody<CreateAxisBody>(event)

  if (!body.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le titre est requis'
    })
  }

  if (!body.description?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La description est requise'
    })
  }

  // Get max sortOrder
  const maxOrder = await prisma.strategicAxis.aggregate({
    _max: { sortOrder: true }
  })

  const axis = await prisma.strategicAxis.create({
    data: {
      title: body.title.trim(),
      description: body.description.trim(),
      icon: body.icon || null,
      color: body.color || null,
      backgroundImage: body.backgroundImage || null,
      linkUrl: body.linkUrl || null,
      sortOrder: body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      isActive: body.isActive ?? true
    }
  })

  return { success: true, data: axis }
})
