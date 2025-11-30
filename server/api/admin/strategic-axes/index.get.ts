import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const axes = await prisma.strategicAxis.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return axes
})
