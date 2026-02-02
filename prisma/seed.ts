import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer l'utilisateur admin
  const adminEmail = 'admin@mom.mg'
  const adminPassword = 'Admin123!'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'MOM',
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log(`✅ Admin user created: ${admin.email}`)

  // Créer quelques configurations de base
  const configs = [
    { key: 'contact_email', value: 'contact@mom.mg' },
    { key: 'contact_phone', value: '+261 20 22 309 71' },
    { key: 'contact_address', value: 'Lot IVG 167 Ter, Ambatoroka\nAntananarivo 101\nMadagascar' },
    { key: 'org_timg_website', value: 'https://www.transparency.mg' },
    { key: 'org_pcqvp_website', value: 'https://www.pwyp.org' },
    { key: 'news_intro', value: 'Les dernières nouvelles du secteur minier malgache' },
    { key: 'case_studies_intro', value: 'Analyses approfondies des activités minières à Madagascar' },
    { key: 'report_case_intro', value: 'Vous avez connaissance d\'un cas de mauvaise gouvernance ou d\'impact négatif lié à l\'exploitation minière ? Partagez l\'information de manière sécurisée.' }
  ]

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config
    })
  }

  console.log('✅ Site config created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
