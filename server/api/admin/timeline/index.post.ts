import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { year, title, description, image, sortOrder, isActive } = body

  if (!year || !title || !description) {
    throw createError({
      statusCode: 400,
      message: 'Année, titre et description sont requis'
    })
  }

  const newEvent = await prisma.timelineEvent.create({
    data: {
      year,
      title,
      description,
      image: image || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true
    }
  })

  return newEvent
})
