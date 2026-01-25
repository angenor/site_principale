import prisma from '../../../../utils/prisma'
import { requireAuth } from '../../../../utils/auth'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const attachmentId = getRouterParam(event, 'attachmentId')
  if (!attachmentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de la pièce jointe requis'
    })
  }

  // Récupérer la pièce jointe
  const attachment = await prisma.newsAttachment.findUnique({
    where: { id: attachmentId }
  })

  if (!attachment) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Pièce jointe non trouvée'
    })
  }

  // Supprimer le fichier physique
  const isProduction = process.env.NODE_ENV === 'production'
  const baseDir = isProduction ? '/app' : join(process.cwd(), 'public')
  const filepath = join(baseDir, attachment.url)

  if (existsSync(filepath)) {
    try {
      await unlink(filepath)
    } catch (err) {
      console.error('Erreur suppression fichier:', err)
      // On continue même si la suppression du fichier échoue
    }
  }

  // Supprimer l'enregistrement en base
  await prisma.newsAttachment.delete({
    where: { id: attachmentId }
  })

  return {
    success: true,
    message: 'Pièce jointe supprimée'
  }
})
