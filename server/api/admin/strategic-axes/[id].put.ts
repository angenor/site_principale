import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface UpdateAxisBody {
  title?: string
  description?: string
  icon?: string
  color?: string
  backgroundImage?: string
  linkUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const existing = await prisma.strategicAxis.findUnique({ where: { id } })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Axe stratégique non trouvé'
    })
  }

  const body = await readBody<UpdateAxisBody>(event)
  const updateData: Record<string, unknown> = {}

  if (body.title !== undefined) {
    if (!body.title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Le titre ne peut pas être vide' })
    }
    updateData.title = body.title.trim()
  }

  if (body.description !== undefined) {
    if (!body.description.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'La description ne peut pas être vide' })
    }
    updateData.description = body.description.trim()
  }

  if (body.icon !== undefined) updateData.icon = body.icon || null
  if (body.color !== undefined) updateData.color = body.color || null
  if (body.backgroundImage !== undefined) updateData.backgroundImage = body.backgroundImage || null
  if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl || null
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder
  if (body.isActive !== undefined) updateData.isActive = body.isActive

  const axis = await prisma.strategicAxis.update({
    where: { id },
    data: updateData
  })

  return { success: true, data: axis }
})
