import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { parseDateInput } from '../../../utils/news'
import { normalizeResourceFiles, resourceFilesCreateData } from '../../../utils/resources'

interface CreateResourceBody {
  title: string
  description?: string
  coverImage?: string
  files: unknown
  categoryId?: string
  isPublished?: boolean
  publishedAt?: string | null
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

  const files = normalizeResourceFiles(body.files)

  // Date de publication : celle fournie, sinon la date du jour lors de la publication
  const publishedAt = body.publishedAt
    ? parseDateInput(body.publishedAt, 'Date de publication')
    : (body.isPublished ? new Date() : null)

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
      categoryId: body.categoryId || null,
      authorId: auth.userId,
      isPublished: body.isPublished || false,
      publishedAt,
      files: {
        create: resourceFilesCreateData(files)
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
