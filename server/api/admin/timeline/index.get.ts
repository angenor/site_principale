import prisma from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const events = await prisma.timelineEvent.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return events
})
