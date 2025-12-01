import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID requis'
    })
  }

  const content = await prisma.aboutContent.findUnique({
    where: { id }
  })

  if (!content) {
    throw createError({
      statusCode: 404,
      message: 'Contenu non trouvé'
    })
  }

  return content
})
