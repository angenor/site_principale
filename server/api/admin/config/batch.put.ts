import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !Array.isArray(body.configs)) {
    throw createError({
      statusCode: 400,
      message: 'Un tableau de configurations est requis'
    })
  }

  const results = []

  for (const item of body.configs) {
    if (!item.key || item.value === undefined) {
      continue
    }

    const config = await prisma.siteConfig.upsert({
      where: { key: item.key },
      update: {
        value: item.value,
        description: item.description !== undefined ? item.description : undefined
      },
      create: {
        key: item.key,
        value: item.value,
        description: item.description || null
      }
    })

    results.push(config)
  }

  return { success: true, updated: results.length, configs: results }
})
