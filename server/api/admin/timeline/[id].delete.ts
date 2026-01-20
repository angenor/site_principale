import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID requis'
    })
  }

  const existing = await prisma.timelineEvent.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Événement non trouvé'
    })
  }

  await prisma.timelineEvent.delete({
    where: { id }
  })

  return { success: true, message: 'Événement supprimé' }
})
