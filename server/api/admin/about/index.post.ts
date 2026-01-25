import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { section, title, content, image, sortOrder, isActive } = body

  if (!title || !content) {
    throw createError({
      statusCode: 400,
      message: 'Titre et contenu sont requis'
    })
  }

  // Générer le slug de section à partir du titre
  const sectionSlug = section || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const newContent = await prisma.aboutContent.create({
    data: {
      section: sectionSlug,
      title,
      content,
      image: image || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true
    }
  })

  return newContent
})
