/**
 * Script pour créer un utilisateur administrateur initial
 * Usage: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@mom.mg'
  const password = 'Admin123!' // À changer après la première connexion

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('❌ Un utilisateur avec cet email existe déjà')
    return
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, 12)

  // Créer l'utilisateur admin
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Admin',
      lastName: 'MOM',
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log('✅ Utilisateur administrateur créé avec succès!')
  console.log('📧 Email:', email)
  console.log('🔑 Mot de passe:', password)
  console.log('⚠️  Veuillez changer le mot de passe après la première connexion')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
