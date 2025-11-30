import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  await requireAuth(event)

  // Récupérer les 5 signalements les plus récents
  const contacts = await prisma.contact.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      subject: true,
      status: true,
      createdAt: true
    }
  })

  return contacts
})
