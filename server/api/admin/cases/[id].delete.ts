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

  // Vérifier que le cas existe
  const caseStudy = await prisma.caseStudy.findUnique({
    where: { id }
  })

  if (!caseStudy) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Étude de cas non trouvée'
    })
  }

  // Supprimer le cas (les relations sont supprimées en cascade grâce au schema)
  await prisma.caseStudy.delete({
    where: { id }
  })

  return { success: true }
})
