import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface UpdateContactBody {
  status?: 'NEW' | 'IN_REVIEW' | 'PROCESSED' | 'ARCHIVED'
  notes?: string
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

  const existingContact = await prisma.contact.findUnique({
    where: { id }
  })

  if (!existingContact) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Signalement non trouvé'
    })
  }

  const body = await readBody<UpdateContactBody>(event)
  const updateData: Record<string, unknown> = {}

  if (body.status !== undefined) {
    updateData.status = body.status
    if (body.status === 'PROCESSED' && !existingContact.processedAt) {
      updateData.processedAt = new Date()
    }
  }

  if (body.notes !== undefined) {
    updateData.notes = body.notes || null
  }

  const updatedContact = await prisma.contact.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    data: updatedContact
  }
})
