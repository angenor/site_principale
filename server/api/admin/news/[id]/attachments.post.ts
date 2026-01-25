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

  // Vérifier que l'actualité existe
  const news = await prisma.news.findUnique({
    where: { id: newsId }
  })

  if (!news) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Actualité non trouvée'
    })
  }

  const body = await readBody(event)

  if (!body.url || !body.filename || !body.mimeType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL, nom de fichier et type MIME requis'
    })
  }

  // Récupérer le prochain sortOrder
  const lastAttachment = await prisma.newsAttachment.findFirst({
    where: { newsId },
    orderBy: { sortOrder: 'desc' }
  })
  const nextSortOrder = (lastAttachment?.sortOrder ?? -1) + 1

  // Créer la pièce jointe
  const attachment = await prisma.newsAttachment.create({
    data: {
      newsId,
      filename: body.filename,
      filepath: body.url, // Le chemin et l'URL sont identiques pour notre système
      url: body.url,
      mimeType: body.mimeType,
      fileSize: body.fileSize || 0,
      sortOrder: nextSortOrder
    }
  })

  return {
    success: true,
    data: attachment
  }
})
