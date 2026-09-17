import prisma from '../../utils/prisma'
import { legacyFileSelect, resourceFilesOf, resourceFilesSelect } from '../../utils/resources'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug requis'
    })
  }

  const resource = await prisma.resource.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
      ...legacyFileSelect,
      files: resourceFilesSelect,
      downloadCount: true,
      publishedAt: true,
      isPublished: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true
        }
      }
    }
  })

  if (!resource || !resource.isPublished) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Ressource non trouvée'
    })
  }

  const { fileUrl, filename, mimeType, fileSize, files, ...data } = resource
  return {
    ...data,
    files: resourceFilesOf({ id: resource.id, fileUrl, filename, mimeType, fileSize, files })
  }
})
