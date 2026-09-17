import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

// Auteurs et mots-clés déjà utilisés, pour l'autocomplétion du formulaire
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const [authors, keywords] = await Promise.all([
    prisma.$queryRaw<{ value: string }[]>`
      SELECT DISTINCT unnest(authors) AS value FROM news ORDER BY value
    `,
    prisma.$queryRaw<{ value: string }[]>`
      SELECT DISTINCT unnest(keywords) AS value FROM news ORDER BY value
    `
  ])

  return {
    authors: authors.map(row => row.value),
    keywords: keywords.map(row => row.value)
  }
})
