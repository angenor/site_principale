import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const existing = await prisma.audioVideo.findUnique({ where: { id }, select: { id: true } })
  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Audio/vidéo non trouvé'
    })
  }

  await prisma.audioVideo.delete({ where: { id } })

  return { success: true }
})
