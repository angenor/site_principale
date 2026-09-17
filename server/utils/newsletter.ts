// Règles partagées pour les abonnements aux newsletters
export const NEWSLETTER_NAME_MAX_LENGTH = 200
export const NEWSLETTER_EMAIL_MAX_LENGTH = 254

const EMAIL_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/

export function normalizeNewsletterEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  if (!email || email.length > NEWSLETTER_EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) return null
  return email
}

export function normalizeNewsletterName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const name = value.replace(/\s+/g, ' ').trim()
  if (!name || name.length > NEWSLETTER_NAME_MAX_LENGTH) return null
  return name
}

// Filtres de la liste d'administration (recherche + statut)
export function buildNewsletterWhere(query: Record<string, unknown>) {
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const status = typeof query.status === 'string' ? query.status : 'all'
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }
  if (status === 'active') where.isActive = true
  if (status === 'inactive') where.isActive = false

  return where
}
