import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

// Intervenants déjà utilisés, pour l'autocomplétion du formulaire
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const speakers = await prisma.$queryRaw<{ value: string }[]>`
    SELECT DISTINCT unnest(speakers) AS value FROM audio_videos ORDER BY value
  `

  return {
    speakers: speakers.map(row => row.value)
  }
})
