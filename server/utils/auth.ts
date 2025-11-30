import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'

// Clé secrète pour signer les JWT (à stocker dans .env en production)
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'mom-secret-key-change-in-production'
  return new TextEncoder().encode(secret)
}

// Durée de validité du token (7 jours)
const TOKEN_EXPIRATION = '7d'

export interface JwtPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'EDITOR'
}

// Générer un token JWT
export async function generateToken(payload: JwtPayload): Promise<string> {
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(getJwtSecret())
}

// Vérifier et décoder un token JWT
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

// Hacher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// Vérifier un mot de passe
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Récupérer le token depuis les cookies ou l'en-tête Authorization
export function getTokenFromEvent(event: H3Event): string | null {
  // Essayer d'abord le cookie
  const cookieToken = getCookie(event, 'auth_token')
  if (cookieToken) return cookieToken

  // Sinon, essayer l'en-tête Authorization
  const authHeader = getHeader(event, 'Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

// Récupérer l'utilisateur authentifié depuis l'événement
export async function getAuthUser(event: H3Event): Promise<JwtPayload | null> {
  const token = getTokenFromEvent(event)
  if (!token) return null
  return await verifyToken(token)
}

// Middleware pour protéger les routes (lève une erreur si non authentifié)
export async function requireAuth(event: H3Event): Promise<JwtPayload> {
  const user = await getAuthUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non autorisé'
    })
  }
  return user
}

// Middleware pour exiger le rôle ADMIN
export async function requireAdmin(event: H3Event): Promise<JwtPayload> {
  const user = await requireAuth(event)
  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès interdit - Rôle administrateur requis'
    })
  }
  return user
}
