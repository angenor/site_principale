import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { buildNewsletterWhere } from '../../../utils/newsletter'

// Échappe une valeur CSV et neutralise les formules (injection dans les tableurs)
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

function formatDate(date: Date | null): string {
  return date ? date.toISOString().replace('T', ' ').substring(0, 19) : ''
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: buildNewsletterWhere(getQuery(event)),
    orderBy: { subscribedAt: 'desc' }
  })

  const header = ['Nom', 'Adresse électronique', 'Statut', 'Date d\'abonnement', 'Date de désinscription']
  const rows = subscribers.map(s => [
    s.name,
    s.email,
    s.isActive ? 'Abonné' : 'Désinscrit',
    formatDate(s.subscribedAt),
    formatDate(s.unsubscribedAt)
  ])

  const csv = [header, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n')
  const filename = `abonnes-newsletter-${new Date().toISOString().substring(0, 10)}.csv`

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  // BOM pour qu'Excel reconnaisse l'UTF-8 (accents)
  return `﻿${csv}`
})
