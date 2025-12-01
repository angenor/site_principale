import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { section, title, content, image, sortOrder, isActive } = body

  if (!section || !title || !content) {
    throw createError({
      statusCode: 400,
      message: 'Section, titre et contenu sont requis'
    })
  }

  // Vérifier que la section n'existe pas déjà
  const existing = await prisma.aboutContent.findUnique({
    where: { section }
  })

  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'Cette section existe déjà'
    })
  }

  const newContent = await prisma.aboutContent.create({
    data: {
      section,
      title,
      content,
      image: image || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true
    }
  })

  return newContent
})
