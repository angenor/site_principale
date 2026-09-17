import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { deleteReportAttachmentFiles } from '../../../utils/reports'

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
    include: { attachments: { select: { filepath: true } } }
  })

  if (!contact) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Signalement non trouvé'
    })
  }

  await prisma.contact.delete({
    where: { id }
  })

  await deleteReportAttachmentFiles(contact.attachments.map(attachment => attachment.filepath))

  return { success: true }
})
