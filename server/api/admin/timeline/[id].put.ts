import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID requis'
    })
  }

  const { year, title, description, image, sortOrder, isActive } = body

  const existing = await prisma.timelineEvent.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Événement non trouvé'
    })
  }

  const updated = await prisma.timelineEvent.update({
    where: { id },
    data: {
      year: year ?? existing.year,
      title: title ?? existing.title,
      description: description ?? existing.description,
      image: image !== undefined ? image : existing.image,
      sortOrder: sortOrder ?? existing.sortOrder,
      isActive: isActive !== undefined ? isActive : existing.isActive
    }
  })

  return updated
})
