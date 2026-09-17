import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { normalizeNewsletterName } from '../../../utils/newsletter'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID requis' })
  }

  const body = await readBody<{ name?: string, isActive?: boolean }>(event)
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } })
  if (!subscriber) {
    throw createError({ statusCode: 404, statusMessage: 'Abonné non trouvé' })
  }

  const data: { name?: string, isActive?: boolean, unsubscribedAt?: Date | null } = {}

  if (body?.name !== undefined) {
    const name = normalizeNewsletterName(body.name)
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Nom invalide' })
    }
    data.name = name
  }

  if (typeof body?.isActive === 'boolean' && body.isActive !== subscriber.isActive) {
    data.isActive = body.isActive
    data.unsubscribedAt = body.isActive ? null : new Date()
  }

  const updated = await prisma.newsletterSubscriber.update({ where: { id }, data })

  return { success: true, data: updated }
})
