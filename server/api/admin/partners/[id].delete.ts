import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

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

  await prisma.partner.delete({ where: { id } })

  return { success: true }
})
