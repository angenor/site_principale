import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const partners = await prisma.partner.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return partners
})
