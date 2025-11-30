import prisma from '../../../utils/prisma'
import { requireAdmin, hashPassword } from '../../../utils/auth'

interface CreateUserBody {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'ADMIN' | 'EDITOR'
  isActive?: boolean
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<CreateUserBody>(event)

  if (!body.email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'L\'email est requis' })
  }

  if (!body.password?.trim() || body.password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Le mot de passe doit contenir au moins 6 caractères' })
  }

  if (!body.firstName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Le prénom est requis' })
  }

  if (!body.lastName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom est requis' })
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase().trim() }
  })

  if (existing) {
    throw createError({ statusCode: 400, statusMessage: 'Cet email est déjà utilisé' })
  }

  const passwordHash = await hashPassword(body.password)

  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase().trim(),
      passwordHash,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      role: body.role || 'EDITOR',
      isActive: body.isActive ?? true
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })

  return { success: true, data: user }
})
