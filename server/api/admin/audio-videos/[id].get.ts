import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { audioVideoCategorySelect } from '../../../utils/resources'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const item = await prisma.audioVideo.findUnique({
    where: { id },
    include: {
      category: audioVideoCategorySelect,
      author: {
        select: { firstName: true, lastName: true }
      }
    }
  })

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Audio/vidéo non trouvé'
    })
  }

  const { author, ...data } = item
  return {
    ...data,
    author: author ? `${author.firstName} ${author.lastName}` : null
  }
})
