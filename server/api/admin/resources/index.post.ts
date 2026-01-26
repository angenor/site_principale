import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface CreateResourceBody {
  title: string
  description?: string
  coverImage?: string
  fileUrl: string
  filename: string
  mimeType: string
  fileSize: number
  categoryId?: string
  isPublished?: boolean
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  const body = await readBody<CreateResourceBody>(event)

  if (!body.title?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le titre est requis'
    })
  }

  if (!body.fileUrl?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le fichier est requis'
    })
  }

  if (!body.filename?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le nom du fichier est requis'
    })
  }

  let slug = generateSlug(body.title)
  const existingSlug = await prisma.resource.findUnique({
    where: { slug }
  })

  if (existingSlug) {
    slug = `${slug}-${Date.now()}`
  }

  const resource = await prisma.resource.create({
    data: {
      slug,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      coverImage: body.coverImage || null,
      fileUrl: body.fileUrl.trim(),
      filename: body.filename.trim(),
      mimeType: body.mimeType || 'application/octet-stream',
      fileSize: body.fileSize || 0,
      categoryId: body.categoryId || null,
      authorId: auth.userId,
      isPublished: body.isPublished || false,
      publishedAt: body.isPublished ? new Date() : null
    },
    include: {
      author: {
        select: { firstName: true, lastName: true }
      },
      category: {
        select: { id: true, name: true }
      }
    }
  })

  return {
    success: true,
    data: {
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      isPublished: resource.isPublished,
      createdAt: resource.createdAt
    }
  }
})
