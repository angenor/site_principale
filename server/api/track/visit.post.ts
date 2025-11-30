import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const headers = getHeaders(event)

  const path = body.path || '/'
  const referrer = body.referrer || headers.referer || null
  const userAgent = headers['user-agent'] || null

  // Get IP address
  const forwarded = headers['x-forwarded-for']
  const ipAddress = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : getRequestIP(event) || null

  // Don't track admin pages or API calls
  if (path.startsWith('/admin') || path.startsWith('/api')) {
    return { tracked: false }
  }

  try {
    await prisma.pageVisit.create({
      data: {
        path,
        referrer,
        userAgent,
        ipAddress
      }
    })

    return { tracked: true }
  } catch {
    return { tracked: false }
  }
})
