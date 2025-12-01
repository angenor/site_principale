import prisma from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const config = await prisma.siteConfig.findMany({
    orderBy: { key: 'asc' }
  })

  return config
})
