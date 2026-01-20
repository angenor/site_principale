import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const events = await prisma.timelineEvent.findMany({
    where: {
      isActive: true
    },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      year: true,
      title: true,
      description: true,
      image: true
    }
  })

  return events
})
