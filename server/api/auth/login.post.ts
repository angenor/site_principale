import prisma from '../../utils/prisma'
import { generateToken, verifyPassword } from '../../utils/auth'

interface LoginBody {
  email: string
  password: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)

  // Validation des champs
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email et mot de passe requis'
    })
  }

  // Rechercher l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Identifiants invalides'
    })
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Compte désactivé'
    })
  }

  // Vérifier le mot de passe
  const isValidPassword = await verifyPassword(body.password, user.passwordHash)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Identifiants invalides'
    })
  }

  // Mettre à jour la date de dernière connexion
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })

  // Générer le token JWT
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  // Définir le cookie
  // secure: true uniquement si HTTPS (vérifie l'URL du site)
  const isHttps = process.env.NUXT_PUBLIC_SITE_URL?.startsWith('https://') ?? false
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 jours
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    token
  }
})
