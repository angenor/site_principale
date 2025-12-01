import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  const body = await readBody(event)

  if (!key) {
    throw createError({
      statusCode: 400,
      message: 'Clé requise'
    })
  }

  const { value, description } = body

  if (value === undefined) {
    throw createError({
      statusCode: 400,
      message: 'Valeur requise'
    })
  }

  // Upsert - créer si n'existe pas, mettre à jour sinon
  const config = await prisma.siteConfig.upsert({
    where: { key },
    update: {
      value,
      description: description !== undefined ? description : undefined
    },
    create: {
      key,
      value,
      description: description || null
    }
  })

  return config
})
