import prisma from '../../utils/prisma'
import { normalizeNewsletterEmail, normalizeNewsletterName } from '../../utils/newsletter'

interface SubscribeBody {
  name?: string
  email?: string
  website?: string // Champ piège invisible (anti-robots)
}

// Limite simple anti-abus : nombre d'inscriptions par adresse IP sur une fenêtre glissante
const RATE_LIMIT_WINDOW = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const recentSubmissions = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (recentSubmissions.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW)
  if (timestamps.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  recentSubmissions.set(ip, timestamps)
  if (recentSubmissions.size > 5000) {
    for (const [key, list] of recentSubmissions) {
      if (!list.some(t => now - t < RATE_LIMIT_WINDOW)) recentSubmissions.delete(key)
    }
  }
  return false
}

const SUCCESS_MESSAGE = 'Merci ! Votre abonnement aux newsletters de l\'Observatoire est enregistré.'

export default defineEventHandler(async (event) => {
  const body = await readBody<SubscribeBody>(event)

  // Un robot a rempli le champ piège : on fait semblant d'accepter
  if (body?.website) {
    return { success: true, message: SUCCESS_MESSAGE }
  }

  const name = normalizeNewsletterName(body?.name)
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Veuillez indiquer un nom (personne ou organisation)' })
  }

  const email = normalizeNewsletterEmail(body?.email)
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Veuillez indiquer une adresse électronique valide' })
  }

  const ipAddress = getRequestIP(event, { xForwardedFor: true }) || null
  if (ipAddress && isRateLimited(ipAddress)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de tentatives en peu de temps. Veuillez réessayer dans quelques minutes.'
    })
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })

  if (!existing) {
    await prisma.newsletterSubscriber.create({
      data: { name, email, ipAddress }
    })
  } else if (!existing.isActive) {
    // Réabonnement d'une adresse précédemment désinscrite
    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: { name, isActive: true, unsubscribedAt: null, subscribedAt: new Date(), ipAddress }
    })
  }
  // Adresse déjà active : même réponse, pour ne pas révéler qui est abonné

  return { success: true, message: SUCCESS_MESSAGE }
})
