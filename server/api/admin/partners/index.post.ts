import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface CreatePartnerBody {
  name: string
  logo: string
  websiteUrl?: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody<CreatePartnerBody>(event)

  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le nom est requis'
    })
  }

  if (!body.logo?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le logo est requis'
    })
  }

  const maxOrder = await prisma.partner.aggregate({
    _max: { sortOrder: true }
  })

  const partner = await prisma.partner.create({
    data: {
      name: body.name.trim(),
      logo: body.logo.trim(),
      websiteUrl: body.websiteUrl || null,
      description: body.description?.trim() || null,
      sortOrder: body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      isActive: body.isActive ?? true
    }
  })

  return { success: true, data: partner }
})
