import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID requis'
    })
  }

  const timelineEvent = await prisma.timelineEvent.findUnique({
    where: { id }
  })

  if (!timelineEvent) {
    throw createError({
      statusCode: 404,
      message: 'Événement non trouvé'
    })
  }

  return timelineEvent
})
