import prisma from '../utils/prisma'

export default defineEventHandler(async () => {
  const config = await prisma.siteConfig.findMany()

  // Transformer en objet clé-valeur
  const configMap: Record<string, string> = {}
  config.forEach(item => {
    configMap[item.key] = item.value
  })

  return configMap
})
