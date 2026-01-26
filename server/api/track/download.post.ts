import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const headers = getHeaders(event)

  const { mediaId, resourceId } = body

  if (!mediaId && !resourceId) {
    return { tracked: false }
  }

  const userAgent = headers['user-agent'] || null
  const forwarded = headers['x-forwarded-for']
  const ipAddress = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : getRequestIP(event) || null

  try {
    // Track resource download
    if (resourceId) {
      await prisma.download.create({
        data: {
          mediaId: resourceId, // Reuse mediaId field for resourceId
          userAgent,
          ipAddress
        }
      })

      // Increment download count on resource
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          downloadCount: { increment: 1 }
        }
      })

      return { tracked: true }
    }

    // Track media download
    if (mediaId) {
      await prisma.download.create({
        data: {
          mediaId,
          userAgent,
          ipAddress
        }
      })

      // Increment download count on media
      await prisma.media.update({
        where: { id: mediaId },
        data: {
          downloadCount: { increment: 1 }
        }
      })

      return { tracked: true }
    }

    return { tracked: false }
  } catch {
    return { tracked: false }
  }
})
