import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import prisma from '../../../../../utils/prisma'
import { requireAuth } from '../../../../../utils/auth'
import { resolveReportAttachmentPath } from '../../../../../utils/reports'

// Téléchargement d'une pièce jointe de signalement, réservé à l'équipe connectée
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const attachmentId = getRouterParam(event, 'attachmentId')

  const attachment = id && attachmentId
    ? await prisma.contactAttachment.findFirst({
        where: { id: attachmentId, contactId: id, kind: 'FILE' }
      })
    : null

  const filePath = attachment?.filepath ? resolveReportAttachmentPath(attachment.filepath) : null
  const stats = filePath ? await stat(filePath).catch(() => null) : null

  if (!attachment || !filePath || !stats?.isFile()) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Pièce jointe non trouvée'
    })
  }

  const filename = attachment.filename || attachment.filepath!
  const asciiName = filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_')

  setHeader(event, 'Content-Type', attachment.mimeType || 'application/octet-stream')
  setHeader(event, 'Content-Length', stats.size)
  // Toujours en téléchargement, jamais interprété par le navigateur
  setHeader(event, 'Content-Disposition', `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`)
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Cache-Control', 'private, no-store')

  return sendStream(event, createReadStream(filePath))
})
