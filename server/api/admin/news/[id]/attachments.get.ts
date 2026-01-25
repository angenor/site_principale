import { PrismaClient } from '~/generated/prisma'
import { requireAuth } from '../../../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const newsId = getRouterParam(event, 'id')
  if (!newsId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de l\'actualité requis'
    })
  }

  const attachments = await prisma.newsAttachment.findMany({
    where: { newsId },
    orderBy: { sortOrder: 'asc' }
  })

  return {
    success: true,
    data: attachments
  }
})
