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

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      attachments: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          kind: true,
          filename: true,
          url: true,
          mimeType: true,
          fileSize: true
        }
      }
    }
  })

  if (!contact) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Signalement non trouvé'
    })
  }

  return contact
})
