import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID requis' })
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } })
  if (!subscriber) {
    throw createError({ statusCode: 404, statusMessage: 'Abonné non trouvé' })
  }

  await prisma.newsletterSubscriber.delete({ where: { id } })

  return { success: true }
})
