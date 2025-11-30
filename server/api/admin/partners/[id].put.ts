import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface UpdatePartnerBody {
  name?: string
  logo?: string
  websiteUrl?: string
  description?: string
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

  const existing = await prisma.partner.findUnique({ where: { id } })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Partenaire non trouvé'
    })
  }

  const body = await readBody<UpdatePartnerBody>(event)
  const updateData: Record<string, unknown> = {}

  if (body.name !== undefined) {
    if (!body.name.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Le nom ne peut pas être vide' })
    }
    updateData.name = body.name.trim()
  }

  if (body.logo !== undefined) {
    if (!body.logo.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Le logo ne peut pas être vide' })
    }
    updateData.logo = body.logo.trim()
  }

  if (body.websiteUrl !== undefined) updateData.websiteUrl = body.websiteUrl || null
  if (body.description !== undefined) updateData.description = body.description?.trim() || null
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder
  if (body.isActive !== undefined) updateData.isActive = body.isActive

  const partner = await prisma.partner.update({
    where: { id },
    data: updateData
  })

  return { success: true, data: partner }
})
