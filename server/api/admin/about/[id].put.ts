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

  const { section, title, content, image, sortOrder, isActive } = body

  // Vérifier que le contenu existe
  const existing = await prisma.aboutContent.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Contenu non trouvé'
    })
  }

  // Si la section change, vérifier qu'elle n'existe pas
  if (section && section !== existing.section) {
    const sectionExists = await prisma.aboutContent.findUnique({
      where: { section }
    })
    if (sectionExists) {
      throw createError({
        statusCode: 400,
        message: 'Cette section existe déjà'
      })
    }
  }

  const updated = await prisma.aboutContent.update({
    where: { id },
    data: {
      section: section ?? existing.section,
      title: title ?? existing.title,
      content: content ?? existing.content,
      image: image !== undefined ? image : existing.image,
      sortOrder: sortOrder ?? existing.sortOrder,
      isActive: isActive !== undefined ? isActive : existing.isActive
    }
  })

  return updated
})
