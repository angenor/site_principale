import prisma from '../utils/prisma'

interface ContactBody {
  name?: string
  email?: string
  phone?: string
  subject: string
  message: string
  isAnonymous?: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactBody>(event)

  // Validation des champs requis
  if (!body.subject || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le sujet et le message sont requis'
    })
  }

  // Validation de l'email si fourni
  if (body.email && !isValidEmail(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Adresse email invalide'
    })
  }

  // Récupérer l'adresse IP (pour le suivi)
  const ipAddress = getRequestIP(event, { xForwardedFor: true })

  // Créer le signalement
  const contact = await prisma.contact.create({
    data: {
      name: body.isAnonymous ? null : body.name,
      email: body.isAnonymous ? null : body.email,
      phone: body.isAnonymous ? null : body.phone,
      subject: body.subject,
      message: body.message,
      isAnonymous: body.isAnonymous || false,
      ipAddress: ipAddress || null,
      status: 'NEW'
    }
  })

  return {
    success: true,
    message: 'Votre signalement a été envoyé avec succès',
    id: contact.id
  }
})

// Fonction utilitaire pour valider l'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
