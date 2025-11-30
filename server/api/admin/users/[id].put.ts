import prisma from '../../../utils/prisma'
import { requireAdmin, hashPassword } from '../../../utils/auth'

interface UpdateUserBody {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: 'ADMIN' | 'EDITOR'
  isActive?: boolean
}

export default defineEventHandler(async (event) => {
  const auth = await requireAdmin(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID requis' })
  }

  const existing = await prisma.user.findUnique({ where: { id } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur non trouvé' })
  }

  const body = await readBody<UpdateUserBody>(event)
  const updateData: Record<string, unknown> = {}

  if (body.email !== undefined) {
    if (!body.email.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'L\'email ne peut pas être vide' })
    }
    // Check if new email is already used by another user
    const emailExists = await prisma.user.findFirst({
      where: {
        email: body.email.toLowerCase().trim(),
        NOT: { id }
      }
    })
    if (emailExists) {
      throw createError({ statusCode: 400, statusMessage: 'Cet email est déjà utilisé' })
    }
    updateData.email = body.email.toLowerCase().trim()
  }

  if (body.password !== undefined && body.password.trim()) {
    if (body.password.length < 6) {
      throw createError({ statusCode: 400, statusMessage: 'Le mot de passe doit contenir au moins 6 caractères' })
    }
    updateData.passwordHash = await hashPassword(body.password)
  }

  if (body.firstName !== undefined) {
    if (!body.firstName.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Le prénom ne peut pas être vide' })
    }
    updateData.firstName = body.firstName.trim()
  }

  if (body.lastName !== undefined) {
    if (!body.lastName.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Le nom ne peut pas être vide' })
    }
    updateData.lastName = body.lastName.trim()
  }

  if (body.role !== undefined) {
    // Prevent removing last admin
    if (existing.role === 'ADMIN' && body.role !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', isActive: true }
      })
      if (adminCount <= 1) {
        throw createError({ statusCode: 400, statusMessage: 'Impossible de retirer le rôle admin du dernier administrateur' })
      }
    }
    updateData.role = body.role
  }

  if (body.isActive !== undefined) {
    // Prevent self-deactivation
    if (id === auth.userId && !body.isActive) {
      throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas désactiver votre propre compte' })
    }
    // Prevent deactivating last admin
    if (existing.role === 'ADMIN' && !body.isActive) {
      const activeAdminCount = await prisma.user.count({
        where: { role: 'ADMIN', isActive: true }
      })
      if (activeAdminCount <= 1) {
        throw createError({ statusCode: 400, statusMessage: 'Impossible de désactiver le dernier administrateur actif' })
      }
    }
    updateData.isActive = body.isActive
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
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
