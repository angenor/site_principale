import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token?: string }>(event)
  const token = typeof body?.token === 'string' ? body.token.trim() : ''

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Lien de désinscription invalide' })
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } })
  if (!subscriber) {
    throw createError({ statusCode: 404, statusMessage: 'Lien de désinscription invalide ou expiré' })
  }

  if (subscriber.isActive) {
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false, unsubscribedAt: new Date() }
    })
  }

  return { success: true, email: subscriber.email }
})
