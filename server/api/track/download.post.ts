import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const headers = getHeaders(event)

  const mediaId = body.mediaId

  if (!mediaId) {
    return { tracked: false }
  }

  const userAgent = headers['user-agent'] || null
  const forwarded = headers['x-forwarded-for']
  const ipAddress = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : getRequestIP(event) || null

  try {
    // Create download record
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
  } catch {
    return { tracked: false }
  }
})
