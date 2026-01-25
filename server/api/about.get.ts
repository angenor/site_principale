import prisma from '../utils/prisma'
import { editorJsToHtml } from '../utils/editorjs'

export default defineEventHandler(async () => {
  const sections = await prisma.aboutContent.findMany({
    where: {
      isActive: true
    },
    orderBy: { sortOrder: 'asc' }
  })

  return sections.map(section => ({
    id: section.id,
    title: section.title,
    content: editorJsToHtml(section.content),
    image: section.image,
    sortOrder: section.sortOrder
  }))
})
