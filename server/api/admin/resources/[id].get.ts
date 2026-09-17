import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { resourceFilesOf, resourceFilesSelect } from '../../../utils/resources'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true }
      },
      category: {
        select: { id: true, name: true, slug: true, icon: true, color: true }
      },
      files: resourceFilesSelect
    }
  })

  if (!resource) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Ressource non trouvée'
    })
  }

  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    coverImage: resource.coverImage,
    files: resourceFilesOf(resource),
    isPublished: resource.isPublished,
    publishedAt: resource.publishedAt,
    downloadCount: resource.downloadCount,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
    author: resource.author ? {
      id: resource.author.id,
      name: `${resource.author.firstName} ${resource.author.lastName}`
    } : null,
    category: resource.category,
    categoryId: resource.categoryId
  }
})
